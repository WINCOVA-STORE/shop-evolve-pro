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
    const { featureName, description } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY not configured');
    }

    console.log('Generating image for feature:', featureName);

    // Create a photorealistic prompt focused on emotional connection
    const imagePrompt = `Create a professional, photorealistic image showing REAL PEOPLE using/benefiting from: ${featureName}.
    
    Customer benefit: ${description}
    
    CRITICAL REQUIREMENTS:
    - PHOTOREALISTIC style (not illustration, not cartoon, not 3D render)
    - Show REAL PEOPLE (diverse, happy, satisfied customers)
    - People should be smiling, enjoying the experience, showing satisfaction
    - Capture the EMOTIONAL benefit: relief, joy, convenience, empowerment
    - Modern, clean e-commerce setting with warm orange/amber lighting (Wincova brand)
    - Show the person actively using or enjoying the feature benefit
    - Professional photography quality, natural lighting, authentic expressions
    - Background should be clean, uncluttered, modern
    - Convey: This makes my life easier and better
    - 16:9 landscape format, high resolution
    - NO text, logos, or graphics overlaid
    - Focus on human connection and positive emotions
    
    Examples of good scenarios:
    - Smart shopping: Person confidently selecting products with filters on tablet, satisfied smile
    - Rewards: Happy customer checking phone showing points and benefits, excited expression
    - Fast checkout: Relaxed person completing purchase easily, peaceful satisfaction
    - Personalized experience: Customer discovering perfect products, delighted surprise
    
    The image should make viewers think: I want that experience! That looks so easy and satisfying!`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash-image-preview',
        messages: [
          {
            role: 'user',
            content: imagePrompt
          }
        ],
        modalities: ['image', 'text']
      })
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI Gateway error:', response.status, errorText);
      throw new Error(`AI Gateway error: ${response.status}`);
    }

    const data = await response.json();
    const imageUrl = data.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!imageUrl) {
      console.error('No image URL in response:', JSON.stringify(data));
      throw new Error('No image generated');
    }

    console.log('Image generated successfully');

    return new Response(
      JSON.stringify({ imageUrl }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        } 
      }
    );
  } catch (error) {
    console.error('Error generating image:', error);
    const errorMessage = error instanceof Error ? error.message : 'Failed to generate image';
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        imageUrl: null // Return null so we can fallback to emoji
      }),
      { 
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 500
      }
    );
  }
});
