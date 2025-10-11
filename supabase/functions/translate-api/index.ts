import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-api-key',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const apiKey = req.headers.get('x-api-key');
    if (!apiKey) {
      return new Response(
        JSON.stringify({ error: 'Missing API key. Include X-API-Key header.' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY || !LOVABLE_API_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Validate API key
    const { data: keyData, error: keyError } = await supabase
      .from('translation_api_keys')
      .select('*')
      .eq('api_key', apiKey)
      .eq('is_active', true)
      .single();

    if (keyError || !keyData) {
      // Log failed attempt
      await supabase.from('translation_api_logs').insert({
        endpoint: '/translate-api',
        success: false,
        error_message: 'Invalid API key',
        ip_address: req.headers.get('x-forwarded-for') || 'unknown',
        user_agent: req.headers.get('user-agent') || 'unknown',
        response_time_ms: Date.now() - startTime
      });

      return new Response(
        JSON.stringify({ error: 'Invalid or inactive API key' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Check if key has expired
    if (keyData.expires_at && new Date(keyData.expires_at) < new Date()) {
      return new Response(
        JSON.stringify({ error: 'API key has expired' }),
        { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Get branding config to check quota
    const { data: branding } = await supabase
      .from('translation_branding')
      .select('*')
      .eq('store_id', keyData.store_id)
      .single();

    if (branding && branding.current_api_usage >= branding.monthly_api_quota) {
      return new Response(
        JSON.stringify({ 
          error: 'Monthly API quota exceeded',
          current_usage: branding.current_api_usage,
          quota: branding.monthly_api_quota
        }),
        { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { products, targetLanguages } = await req.json();

    if (!products || !Array.isArray(products) || products.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Provide "products" array.' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (!targetLanguages || !Array.isArray(targetLanguages) || targetLanguages.length === 0) {
      return new Response(
        JSON.stringify({ error: 'Invalid request. Provide "targetLanguages" array (e.g., ["es", "fr"])' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Batch translate products
    const results: any = {};
    let totalAICalls = 0;

    const languageNames: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      pt: 'Portuguese',
      zh: 'Chinese (Simplified)'
    };

    for (const lang of targetLanguages) {
      if (!languageNames[lang]) {
        results[lang] = { error: `Unsupported language: ${lang}` };
        continue;
      }

      const batchData = products.map((p: any, idx: number) => ({
        id: idx,
        name: p.name,
        description: p.description || ''
      }));

      const systemPrompt = `You are a professional e-commerce translator.
Translate ALL products in the JSON array to ${languageNames[lang]}.

CRITICAL:
- Maintain marketing appeal and natural tone
- Keep product names concise and searchable
- Make descriptions customer-friendly and clear
- Preserve any technical specifications accurately

Return ONLY a JSON array with this EXACT structure:
[
  {
    "id": 0,
    "name": "translated product name",
    "description": "translated description"
  }
]`;

      const userPrompt = `Translate these ${products.length} products to ${languageNames[lang]}:\n\n${JSON.stringify(batchData, null, 2)}`;

      try {
        const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Authorization': `Bearer ${LOVABLE_API_KEY}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            model: 'google/gemini-2.5-flash',
            messages: [
              { role: 'system', content: systemPrompt },
              { role: 'user', content: userPrompt }
            ],
            temperature: 0.3
          })
        });

        if (!response.ok) {
          results[lang] = { error: `AI API error: ${response.statusText}` };
          continue;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          results[lang] = { error: 'No content in AI response' };
          continue;
        }

        // Clean response
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const translations = JSON.parse(content);

        results[lang] = {
          success: true,
          translations: translations.map((t: any) => ({
            original_id: t.id,
            name: t.name,
            description: t.description
          }))
        };

        totalAICalls++;

      } catch (error) {
        results[lang] = { error: error instanceof Error ? error.message : 'Translation failed' };
      }
    }

    // Update API usage
    await supabase
      .from('translation_branding')
      .update({ current_api_usage: (branding?.current_api_usage || 0) + totalAICalls })
      .eq('store_id', keyData.store_id);

    // Update last_used_at
    await supabase
      .from('translation_api_keys')
      .update({ last_used_at: new Date().toISOString() })
      .eq('id', keyData.id);

    // Log successful request
    await supabase.from('translation_api_logs').insert({
      api_key_id: keyData.id,
      endpoint: '/translate-api',
      products_count: products.length,
      languages_count: targetLanguages.length,
      ai_calls_used: totalAICalls,
      response_time_ms: Date.now() - startTime,
      success: true,
      ip_address: req.headers.get('x-forwarded-for') || 'unknown',
      user_agent: req.headers.get('user-agent') || 'unknown'
    });

    return new Response(
      JSON.stringify({ 
        success: true,
        results,
        meta: {
          products_processed: products.length,
          languages: targetLanguages,
          ai_calls_used: totalAICalls,
          api_usage: {
            current: (branding?.current_api_usage || 0) + totalAICalls,
            quota: branding?.monthly_api_quota || 10000
          }
        }
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in translate-api:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Translation failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});