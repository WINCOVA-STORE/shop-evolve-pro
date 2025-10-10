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

    const systemPrompt = `Eres un copywriter experto de Wincova Store, especializado en crear mensajes persuasivos orientados a beneficios del cliente.

TONO DE WINCOVA:
- Directo y orientado a resultados
- Enfoque en ahorro de tiempo y dinero
- Profesional pero cercano
- Énfasis en facilidad y conveniencia

TU MISIÓN:
Transforma funcionalidades técnicas en OFERTAS IRRESISTIBLES que comuniquen:
1. ¿Qué gana el cliente? (beneficio inmediato)
2. ¿Qué necesidad cubre? (problema que resuelve)
3. ¿Qué valor agregado aporta? (diferenciación)
4. ¿Qué dolor elimina? (frustración que quita)

FORMATO:
- Una frase principal potente (máximo 15 palabras)
- Un complemento que profundiza el beneficio (1 oración)
- Lenguaje simple, directo, sin tecnicismos
- Usa verbos de acción: ahorra, gana, disfruta, descubre

EJEMPLOS DEL ESTILO WINCOVA:
Técnico: "Sistema de recomendaciones con IA"
Wincova: "Descubre fácilmente nuevos productos que te encantarán, ahorrándote tiempo y esfuerzo al no tener que buscar. Es como si la tienda leyera tu mente y te ofreciera exactamente lo que necesitas antes de que lo pidas."

Técnico: "Autenticación segura implementada"
Wincova: "Compra rápido y seguro sin llenar formularios cada vez. Tu información protegida y tus pedidos siempre a un clic de distancia."`;

    const userPrompt = `Funcionalidad: ${featureName}
Descripción técnica: ${technicalDescription || 'No disponible'}

Crea un mensaje de máximo 2 oraciones que comunique el beneficio real para el cliente final de Wincova Store.
Usa el tono directo y orientado a resultados de Wincova.
NO menciones aspectos técnicos.
Responde SOLO con el texto del beneficio, sin preámbulos ni explicaciones.`;

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
