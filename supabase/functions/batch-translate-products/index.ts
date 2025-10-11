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
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    const SUPABASE_URL = Deno.env.get('SUPABASE_URL');
    const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');

    if (!LOVABLE_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
      throw new Error('Missing required environment variables');
    }

    const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY);

    console.log('🔍 Finding products that need translation...');

    // Find products missing translations (batch of 50 at a time for efficiency)
    const { data: products, error: fetchError } = await supabase
      .from('products')
      .select('id, name, description, name_es, name_fr, name_pt, name_zh')
      .or('name_es.is.null,name_fr.is.null,name_pt.is.null,name_zh.is.null,description_es.is.null,description_fr.is.null,description_pt.is.null,description_zh.is.null')
      .limit(50);

    if (fetchError) throw fetchError;

    if (!products || products.length === 0) {
      console.log('✅ All products are already translated!');
      return new Response(
        JSON.stringify({ 
          success: true, 
          message: 'No products need translation',
          translated: 0 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log(`📦 Found ${products.length} products needing translation`);

    const targetLanguages = ['es', 'fr', 'pt', 'zh'];
    const languageNames: Record<string, string> = {
      es: 'Spanish',
      fr: 'French',
      pt: 'Portuguese',
      zh: 'Chinese (Simplified)'
    };

    let totalTranslated = 0;

    // Process each language
    for (const lang of targetLanguages) {
      const nameKey = `name_${lang}` as keyof typeof products[0];
      const descKey = `description_${lang}` as keyof typeof products[0];

      // Filter products missing this specific language
      const missingInLang = products.filter(p => !p[nameKey] || !p[descKey]);
      
      if (missingInLang.length === 0) {
        console.log(`✓ ${lang}: All products already translated`);
        continue;
      }

      console.log(`🔧 ${lang}: Translating ${missingInLang.length} products in ONE batch call...`);

      // Build batch prompt (translate all products at once)
      const batchData = missingInLang.map((p, idx) => ({
        id: idx,
        product_id: p.id,
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

      const userPrompt = `Translate these ${missingInLang.length} products to ${languageNames[lang]}:\n\n${JSON.stringify(batchData, null, 2)}`;

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
          const errorText = await response.text();
          console.error(`❌ ${lang}: AI call failed:`, errorText);
          continue;
        }

        const data = await response.json();
        let content = data.choices?.[0]?.message?.content;
        
        if (!content) {
          console.error(`❌ ${lang}: No content in response`);
          continue;
        }

        // Clean response
        content = content.replace(/```json\s*/g, '').replace(/```\s*/g, '').trim();
        const translations = JSON.parse(content);

        // Update all products in batch
        let updated = 0;
        for (const translation of translations) {
          const productData = batchData.find(p => p.id === translation.id);
          if (!productData) continue;

          const updateData: any = {};
          updateData[nameKey] = translation.name;
          updateData[descKey] = translation.description;

          const { error: updateError } = await supabase
            .from('products')
            .update(updateData)
            .eq('id', productData.product_id);

          if (!updateError) {
            updated++;
          } else {
            console.error(`Error updating product ${productData.product_id}:`, updateError);
          }
        }

        totalTranslated += updated;
        console.log(`✅ ${lang}: Translated ${updated} products in 1 AI call!`);

      } catch (error) {
        console.error(`❌ ${lang}: Translation error:`, error);
      }
    }

    console.log(`\n🎉 Batch translation complete! Translated ${totalTranslated} products`);
    console.log(`💰 Cost: ${Math.ceil(targetLanguages.length)} AI calls (vs ${products.length * 4} without batching)`);

    return new Response(
      JSON.stringify({ 
        success: true,
        translated: totalTranslated,
        productsProcessed: products.length,
        aiCallsMade: targetLanguages.length,
        message: `Translated ${totalTranslated} products using only ${targetLanguages.length} AI calls`
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in batch-translate-products:', error);
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
