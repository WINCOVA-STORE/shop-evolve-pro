import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  // Handle CORS preflight
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { cartItems, availableProducts } = await req.json();

    // Validate input
    if (!cartItems || !Array.isArray(cartItems) || cartItems.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          error: 'No cart items provided' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 400 
        }
      );
    }

    if (!availableProducts || !Array.isArray(availableProducts) || availableProducts.length === 0) {
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          error: 'No available products for suggestions' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );
    }

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      console.error('LOVABLE_API_KEY not configured');
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          error: 'AI service not configured' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    // Prepare prompt for AI
    const cartDescription = cartItems
      .map(item => `${item.name} (${item.category_id || 'uncategorized'}) - $${item.price}`)
      .join(', ');

    const productsDescription = availableProducts
      .slice(0, 50) // Limit to avoid token overflow
      .map((p, idx) => 
        `${idx + 1}. ${p.name} (ID: ${p.id}, Category: ${p.category_id || 'none'}, Price: $${p.price}${p.compare_at_price ? `, Was: $${p.compare_at_price}` : ''}, Stock: ${p.stock})`
      )
      .join('\n');

    const systemPrompt = `You are a highly intelligent e-commerce recommendation engine for WINCOVA, an international-standard marketplace. Your goal is to maximize conversion, cross-selling, and customer satisfaction.

Analyze the user's cart and suggest 3-5 complementary products that:
1. Create value bundles (items that work together)
2. Offer strategic upsells (higher-value alternatives or upgrades)
3. Include best deals (discounted items that provide savings)
4. Match user preferences based on cart contents
5. Prioritize items with good stock availability

Return ONLY a JSON object with this exact structure:
{
  "suggestions": [
    { "id": "product_id_1", "reason": "brief explanation" },
    { "id": "product_id_2", "reason": "brief explanation" },
    { "id": "product_id_3", "reason": "brief explanation" }
  ]
}

Rules:
- Suggest 3-5 products maximum
- Prioritize complementary items over random suggestions
- Consider price balance (don't only suggest expensive items)
- Factor in discounts (items with compare_at_price are on sale)
- Each reason should be customer-focused and compelling
- Use ONLY product IDs from the available products list`;

    const userPrompt = `Cart Contents:
${cartDescription}

Available Products:
${productsDescription}

Provide smart recommendations to increase cart value and customer satisfaction.`;

    console.log('Calling Lovable AI for cart suggestions...');

    const aiResponse = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
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
        temperature: 0.7,
        max_tokens: 1000,
      }),
    });

    if (!aiResponse.ok) {
      const errorText = await aiResponse.text();
      console.error('AI API Error:', aiResponse.status, errorText);
      
      return new Response(
        JSON.stringify({ 
          suggestions: [],
          error: 'AI suggestion service temporarily unavailable' 
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 500 
        }
      );
    }

    const aiData = await aiResponse.json();
    const aiContent = aiData.choices?.[0]?.message?.content;

    if (!aiContent) {
      console.error('No content in AI response');
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Parse AI response
    let parsedSuggestions;
    try {
      // Try to extract JSON from response
      const jsonMatch = aiContent.match(/\{[\s\S]*"suggestions"[\s\S]*\}/);
      if (jsonMatch) {
        parsedSuggestions = JSON.parse(jsonMatch[0]);
      } else {
        parsedSuggestions = JSON.parse(aiContent);
      }
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      return new Response(
        JSON.stringify({ suggestions: [] }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Validate and enrich suggestions with product data
    const validSuggestions = (parsedSuggestions.suggestions || [])
      .map((suggestion: any) => {
        const product = availableProducts.find(p => p.id === suggestion.id);
        return product ? { ...product, reason: suggestion.reason } : null;
      })
      .filter(Boolean)
      .slice(0, 5);

    console.log(`AI provided ${validSuggestions.length} valid suggestions`);

    return new Response(
      JSON.stringify({ 
        suggestions: validSuggestions,
        powered_by: 'WINCOVA AI Engine'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error('Error in ai-cart-suggestions:', error);
    return new Response(
      JSON.stringify({ 
        suggestions: [],
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
