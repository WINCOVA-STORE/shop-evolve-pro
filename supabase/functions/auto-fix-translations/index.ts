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
    const { localeData, targetLanguages = ['es', 'fr', 'pt', 'zh'] } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');

    if (!LOVABLE_API_KEY) {
      throw new Error('Missing LOVABLE_API_KEY');
    }

    console.log('🔍 Analyzing translations and auto-fixing...');

    const results: Record<string, any> = {};
    
    // For each target language, find and fix missing translations
    for (const lang of targetLanguages) {
      const missingKeys: Record<string, string> = {};
      
      // Deep scan for missing translations
      const scanObject = (enObj: any, langObj: any, prefix = '') => {
        for (const key in enObj) {
          const fullKey = prefix ? `${prefix}.${key}` : key;
          
          if (typeof enObj[key] === 'object' && enObj[key] !== null) {
            scanObject(
              enObj[key], 
              langObj?.[key] || {}, 
              fullKey
            );
          } else {
            // Check if translation is missing or empty
            if (!langObj?.[key] || langObj[key].trim() === '') {
              missingKeys[fullKey] = enObj[key];
            }
          }
        }
      };

      // Scan from English (source of truth)
      scanObject(localeData.en || {}, localeData[lang] || {});

      if (Object.keys(missingKeys).length === 0) {
        console.log(`✓ ${lang}: No missing translations`);
        continue;
      }

      console.log(`🔧 ${lang}: Found ${Object.keys(missingKeys).length} missing translations. Auto-fixing...`);

      // Translate all missing keys in one AI call
      const languageNames: Record<string, string> = {
        es: 'Spanish',
        fr: 'French',
        pt: 'Portuguese',
        zh: 'Chinese (Simplified)'
      };

      const systemPrompt = `You are a professional translator for web applications and e-commerce platforms.
Translate ALL provided English texts to ${languageNames[lang]}.

CRITICAL REQUIREMENTS:
- Maintain natural, professional tone
- Preserve formatting (HTML tags, placeholders like {0}, {name}, etc.)
- Keep technical terms accurate
- Ensure cultural appropriateness
- Make translations customer-friendly

Return ONLY a JSON object where each key maps to its ${languageNames[lang]} translation.
Use the EXACT same keys as provided.`;

      const userPrompt = `Translate these UI texts to ${languageNames[lang]}:\n\n${JSON.stringify(missingKeys, null, 2)}`;

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
            temperature: 0.3 // Lower temperature for consistency
          })
        });

        if (response.ok) {
          const data = await response.json();
          let content = data.choices?.[0]?.message?.content;
          
          if (content) {
            content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
            const translations = JSON.parse(content);
            
            // Build the fixed locale structure
            const fixedLocale: any = { ...(localeData[lang] || {}) };
            
            for (const [fullKey, translatedValue] of Object.entries(translations)) {
              const keys = fullKey.split('.');
              let current = fixedLocale;
              
              // Navigate/create nested structure
              for (let i = 0; i < keys.length - 1; i++) {
                if (!current[keys[i]]) current[keys[i]] = {};
                current = current[keys[i]];
              }
              
              // Set the translated value
              current[keys[keys.length - 1]] = translatedValue;
            }
            
            results[lang] = {
              fixed: Object.keys(missingKeys).length,
              updatedLocale: fixedLocale
            };
            
            console.log(`✅ ${lang}: Auto-fixed ${Object.keys(missingKeys).length} translations`);
          }
        } else {
          const errorText = await response.text();
          console.error(`❌ ${lang}: AI translation failed:`, errorText);
          results[lang] = { error: 'AI translation failed', fixed: 0 };
        }
      } catch (error) {
        console.error(`❌ ${lang}: Error during translation:`, error);
        results[lang] = { error: error instanceof Error ? error.message : 'Unknown error', fixed: 0 };
      }
    }

    const totalFixed = Object.values(results).reduce((sum: number, r: any) => sum + (r.fixed || 0), 0);
    
    console.log(`\n🎉 Auto-fix complete! Fixed ${totalFixed} translations across ${Object.keys(results).length} languages`);

    return new Response(
      JSON.stringify({ 
        success: true,
        totalFixed,
        results,
        message: `Auto-fixed ${totalFixed} missing translations`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in auto-fix-translations:', error);
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Auto-fix failed' 
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500
      }
    );
  }
});
