import { serve } from 'https://deno.land/std@0.177.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.5';
import OpenAI from 'https://deno.land/x/openai@v4.24.1/mod.ts';

// Configura tu cliente OpenAI
// Asegúrate de establecer OPENAI_API_KEY en tus secretos de Supabase
const openai = new OpenAI({
  apiKey: Deno.env.get('OPENAI_API_KEY'),
});

serve(async (req) => {
  if (req.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method Not Allowed' }), {
      headers: { 'Content-Type': 'application/json' },
      status: 405,
    });
  }

  try {
    const { userId, browsingHistory, purchaseHistory } = await req.json();

    if (!userId) {
      return new Response(JSON.stringify({ error: 'userId is required' }), {
        headers: { 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '', // Usar SERVICE_ROLE_KEY para acceso a tablas sensibles
      {
        auth: {
          persistSession: false,
          autoRefreshToken: false,
          detectSessionInUrl: false,
        },
      }
    );

    let prompt = `Generate product recommendations for a user. `;

    if (browsingHistory && browsingHistory.length > 0) {
      prompt += `User's recent browsing history includes: ${browsingHistory.map((p: any) => p.name).join(', ')}. `;
    }
    if (purchaseHistory && purchaseHistory.length > 0) {
      prompt += `User's purchase history includes: ${purchaseHistory.map((p: any) => p.name).join(', ')}. `;
    }

    prompt += `Based on this, suggest 5 product IDs that the user might be interested in. Respond only with a JSON array of product IDs, e.g., ["prod_123", "prod_456"].`;

    console.log('AI Prompt:', prompt);

    // Simulamos una llamada a OpenAI para obtener recomendaciones
    // En un entorno real, la respuesta del LLM debería ser parseada y validada
    // Aquí asumimos que el LLM devuelve un JSON válido de product IDs
    const chatCompletion = await openai.chat.completions.create({
      model: 'gpt-3.5-turbo', // Puedes usar un modelo más avanzado si es necesario
      messages: [{ role: 'user', content: prompt }],
      temperature: 0.7,
      max_tokens: 150,
      response_format: { type: 'json_object' },
    });

    const aiResponse = chatCompletion.choices[0].message.content;
    console.log('AI Raw Response:', aiResponse);

    let recommendedProductIds: string[] = [];
    try {
      const parsedResponse = JSON.parse(aiResponse || '{}');
      if (Array.isArray(parsedResponse) && parsedResponse.every(item => typeof item === 'string')) {
        recommendedProductIds = parsedResponse;
      } else if (typeof parsedResponse === 'object' && parsedResponse.product_ids && Array.isArray(parsedResponse.product_ids)) {
        recommendedProductIds = parsedResponse.product_ids;
      } else {
        console.warn('AI response not in expected array format, attempting to extract from string.');
        // Fallback para intentar parsear si el formato no es estrictamente un array JSON
        const match = aiResponse?.match(/\[(.*?)\]/);
        if (match && match[1]) {
          recommendedProductIds = match[1].split(',').map(id => id.trim().replace(/"/g, ''));
        }
      }
    } catch (parseError) {
      console.error('Error parsing AI response:', parseError);
      // Fallback si el parseo falla completamente
      const match = aiResponse?.match(/\[(.*?)\]/);
        if (match && match[1]) {
          recommendedProductIds = match[1].split(',').map(id => id.trim().replace(/"/g, ''));
        }
    }
    
    // Opcional: Recuperar los detalles completos de los productos desde Supabase
    // Esto es más eficiente que pedir al LLM los detalles completos
    if (recommendedProductIds.length > 0) {
      const { data: products, error: productsError } = await supabaseClient
        .from('products')
        .select('*')
        .in('id', recommendedProductIds);

      if (productsError) {
        console.error('Error fetching recommended products from DB:', productsError);
        return new Response(JSON.stringify({ error: 'Failed to fetch product details' }), {
          headers: { 'Content-Type': 'application/json' },
          status: 500,
        });
      }

      // Ordenar los productos según el orden de las IDs devueltas por la IA
      const orderedProducts = recommendedProductIds
        .map(id => products?.find(p => p.id === id))
        .filter(Boolean); // Eliminar posibles nulos si un producto no se encuentra

      return new Response(JSON.stringify({ recommendations: orderedProducts }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    } else {
      return new Response(JSON.stringify({ recommendations: [] }), {
        headers: { 'Content-Type': 'application/json' },
        status: 200,
      });
    }

  } catch (error) {
    console.error('Error in AI recommendation function:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});