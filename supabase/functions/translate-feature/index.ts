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
      const { featureName, description, targetLanguage } = await req.json();
      
      const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
      if (!LOVABLE_API_KEY) {
        throw new Error('LOVABLE_API_KEY not configured');
      }

      console.log(`Translating to ${targetLanguage}:`, featureName);

      // Normalize and map language codes to full names
      const baseLang = (targetLanguage || 'en').toLowerCase().split(/[-_]/)[0];
      const languageNames: Record<string, string> = {
        en: 'English',
        es: 'Spanish',
        fr: 'French',
        pt: 'Portuguese',
        zh: 'Chinese'
      };

      const targetLangName = languageNames[baseLang] || 'English';

      // Validate input
      if (!featureName || !description) {
        console.error('Missing required fields');
        return new Response(
          JSON.stringify({ 
            translatedName: featureName || 'Feature',
            translatedDescription: description || 'Description',
            error: 'Missing data'
          }),
          { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }

    const systemPrompt = `You are a professional translator specializing in e-commerce and customer-facing content.
Your task is to translate feature names and descriptions while maintaining:
- The customer benefit focus (not technical jargon)
- Natural, friendly tone appropriate for ${targetLangName} speakers
- Marketing appeal and clarity
- Cultural appropriateness
- If the input is already in ${targetLangName}, return it unchanged.
- Never invent features or details.

Return ONLY a JSON object with this exact structure:
{
  "translatedName": "translated feature name",
  "translatedDescription": "translated description"
 }`;

    const userPrompt = `Translate this e-commerce feature to ${targetLangName}:

Feature Name: ${featureName}
Description: ${description}

Remember: Keep it customer-focused, natural, and appealing. Make it sound like native ${targetLangName} marketing copy.`;

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

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      
      // Return original text if translation fails
      return new Response(
        JSON.stringify({ 
          translatedName: featureName,
          translatedDescription: description,
          error: 'Translation unavailable'
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const data = await response.json();
    const content = data.choices?.[0]?.message?.content;

    if (!content) {
      console.error('No content in AI response, returning original');
      return new Response(
        JSON.stringify({ 
          translatedName: featureName,
          translatedDescription: description 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse the JSON response
    let translationData;
    try {
      translationData = JSON.parse(content);
    } catch (parseError) {
      console.error('Failed to parse AI response, returning original:', parseError);
      return new Response(
        JSON.stringify({ 
          translatedName: featureName,
          translatedDescription: description 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate translation data
    if (!translationData.translatedName || !translationData.translatedDescription) {
      console.error('Invalid translation data, returning original');
      return new Response(
        JSON.stringify({ 
          translatedName: featureName,
          translatedDescription: description 
        }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Translation successful:', translationData.translatedName);

    return new Response(
      JSON.stringify(translationData),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('Error translating feature:', error);
    const errorMessage = error instanceof Error ? error.message : 'Translation failed';
    
    // Always return original text on error - NEVER return empty
    let originalName = 'Feature';
    let originalDesc = 'Description';
    
    try {
      const body = await req.json();
      originalName = body.featureName || 'Feature';
      originalDesc = body.description || 'Description';
    } catch (parseError) {
      console.error('Could not parse request body:', parseError);
    }
    
    return new Response(
      JSON.stringify({ 
        translatedName: originalName,
        translatedDescription: originalDesc,
        error: errorMessage
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 // Return 200 to avoid breaking the UI
      }
    );
  }
});
