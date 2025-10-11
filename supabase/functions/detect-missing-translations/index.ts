import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { localeKeys } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('Missing LOVABLE_API_KEY');
    }

    console.log('Analyzing locale keys for missing translations...');

    // Languages to check
    const languages = ['en', 'es', 'fr', 'pt', 'zh'];
    const missingTranslations: Record<string, string[]> = {};

    // Check each language for completeness
    for (const lang of languages) {
      const missing: string[] = [];
      const langData = localeKeys[lang] || {};

      // Deep check all nested keys
      const checkObject = (obj: any, prefix = '') => {
        for (const key in obj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          if (typeof obj[key] === 'object' && obj[key] !== null) {
            checkObject(obj[key], fullKey);
          } else if (!obj[key] || obj[key].trim() === '') {
            missing.push(fullKey);
          }
        }
      };

      checkObject(langData);
      
      if (missing.length > 0) {
        missingTranslations[lang] = missing;
      }
    }

    // Auto-translate missing keys
    const translations: Record<string, any> = {};

    for (const [lang, keys] of Object.entries(missingTranslations)) {
      if (keys.length === 0) continue;

      const systemPrompt = `You are a professional translator for web applications.
Translate the provided keys to ${lang === 'es' ? 'Spanish' : lang === 'fr' ? 'French' : lang === 'pt' ? 'Portuguese' : lang === 'zh' ? 'Chinese' : 'English'}.
Maintain:
- Natural, professional tone
- UI/UX best practices
- Cultural appropriateness
- Conciseness for UI elements

Return ONLY a JSON object where each key maps to its translation.`;

      const userPrompt = `Translate these UI keys:\n${JSON.stringify(keys, null, 2)}`;

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
          let content = data.choices?.[0]?.message?.content;
          
          if (content) {
            content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const parsed = JSON.parse(content);
            translations[lang] = parsed;
            console.log(`✓ Generated translations for ${lang}`);
          }
        }
      } catch (error) {
        console.error(`Error translating to ${lang}:`, error);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true,
        missingTranslations,
        generatedTranslations: translations,
        message: 'Translation analysis complete'
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in detect-missing-translations:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Detection failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
