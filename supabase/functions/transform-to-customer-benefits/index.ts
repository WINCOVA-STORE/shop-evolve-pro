import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { featureName, technicalDescription, impact } = await req.json();
    
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY no configurada");
    }

    const systemPrompt = `Eres un experto en marketing y comunicación con clientes. 
Tu tarea es transformar descripciones técnicas de funcionalidades de ecommerce en beneficios tangibles para el cliente final.

REGLAS IMPORTANTES:
1. Enfócate en QUÉ GANA el cliente, no en cómo funciona técnicamente
2. Responde estas preguntas: ¿Qué dolor le quita? ¿Qué necesidad cubre? ¿Cómo mejora su experiencia?
3. Usa lenguaje emocional y persuasivo, no técnico
4. Sé conciso pero impactante (máximo 2-3 oraciones)
5. Usa verbos de acción y enfócate en resultados

EJEMPLOS:
Técnico: "Sistema de filtros inteligentes con algoritmos de ML"
Cliente: "Encuentra exactamente lo que buscas en segundos, sin perder tiempo navegando. La tienda aprende de ti y te muestra solo lo relevante."

Técnico: "Autenticación de usuarios implementada"
Cliente: "Compra rápido y seguro sin tener que llenar formularios cada vez. Tu información está protegida y tus pedidos siempre a un clic."`;

    const userPrompt = `Funcionalidad: ${featureName}
Descripción técnica: ${technicalDescription || 'No disponible'}
Nivel de impacto: ${impact}

Transforma esto en un beneficio persuasivo para el cliente. Responde SOLO con el texto del beneficio, sin explicaciones adicionales.`;

    const response = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash",
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user", content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error("Error de Lovable AI:", response.status, errorText);
      throw new Error(`Error de Lovable AI: ${response.status}`);
    }

    const data = await response.json();
    const customerBenefit = data.choices[0].message.content;

    return new Response(
      JSON.stringify({ customerBenefit }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );

  } catch (error) {
    console.error("Error:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : String(error) }),
      { 
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" }
      }
    );
  }
});
