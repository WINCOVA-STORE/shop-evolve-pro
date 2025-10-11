import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { 
      table_name, 
      record_id, 
      source_text_name, 
      source_text_description 
    } = await req.json();

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    console.log(`Auto-translating ${table_name} record ${record_id}`);

    // Initialize Supabase client with service role
    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    // Target languages (all except English which is source)
    const targetLanguages = ['es', 'fr', 'pt', 'zh'];
    const languageNames: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      pt: 'Portuguese',
      zh: 'Chinese'
    };

    const translations: Record<string, any> = {};

    // Translate to each language
    for (const lang of targetLanguages) {
      const targetLangName = languageNames[lang];

      const systemPrompt = `You are a professional translator for e-commerce content.
Translate the product name and description to ${targetLangName}.
Maintain:
- Marketing appeal and clarity
- Natural, friendly tone
- Cultural appropriateness
- Customer benefit focus

Return ONLY a JSON object with this structure:
{
  "name": "translated name",
  "description": "translated description"
}`;

      const userPrompt = `Translate this product to ${targetLangName}:

Name: ${source_text_name}
Description: ${source_text_description || 'No description'}

Keep it natural and appealing for ${targetLangName} speakers.`;

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
            ]
          })
        });

        if (response.ok) {
          const data = await response.json();
          const content = data.choices?.[0]?.message?.content;
          
          if (content) {
            const parsed = JSON.parse(content);
            translations[`name_${lang}`] = parsed.name || source_text_name;
            translations[`description_${lang}`] = parsed.description || source_text_description;
            console.log(`✓ Translated to ${lang}`);
          }
        }
      } catch (error) {
        console.error(`Error translating to ${lang}:`, error);
        // Fallback to original text
        translations[`name_${lang}`] = source_text_name;
        translations[`description_${lang}`] = source_text_description;
      }
    }

    // Update database with translations
    const { error: updateError } = await supabase
      .from(table_name)
      .update(translations)
      .eq('id', record_id);

    if (updateError) {
      console.error('Error updating translations:', updateError);
      throw updateError;
    }

    console.log(`✓ Auto-translation complete for ${table_name} ${record_id}`);

    return new Response(
      JSON.stringify({ 
        success: true, 
        translations,
        message: 'Content translated successfully' 
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-translate-content:', error);
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