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
    const { changeTitle, changeDescription, category, siteUrl, beforeImageUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Generating REAL visuals for change: ${changeTitle}`);

    // ESTRATEGIA: Solo screenshots REALES o imágenes subidas por el usuario
    let finalBeforeImageUrl: string;
    
    // Si el cliente ya proporcionó una imagen "antes", usarla directamente
    if (beforeImageUrl) {
      console.log("✅ Usando imagen 'antes' proporcionada por el cliente");
      finalBeforeImageUrl = beforeImageUrl;
    } else {
      // Si no, intentar capturar screenshot REAL
      console.log("Capturando screenshot REAL del sitio...");
      
      const screenshotUrl = `https://shot.screenshotapi.net/screenshot`;
      const params = new URLSearchParams({
        url: siteUrl,
        output: 'image',
        file_type: 'png',
        wait_for_event: 'load',
        delay: '2000',
        full_page: 'false',
        fresh: 'true',
        width: '1280',
        height: '800',
      });

      const screenshotResponse = await fetch(`${screenshotUrl}?${params}`, {
        method: 'GET',
        headers: {
          'Accept': 'image/png',
        },
      });

      if (!screenshotResponse.ok) {
        // Si falla, devolver error para que el cliente pueda subir su imagen
        throw new Error(`NO_SCREENSHOT: No se pudo capturar el screenshot del sitio. El cliente debe subir una imagen real de su sitio.`);
      }

      const arrayBuffer = await screenshotResponse.arrayBuffer();
      const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
      finalBeforeImageUrl = `data:image/png;base64,${base64}`;
      console.log("✅ Screenshot REAL capturado exitosamente");
    }


    // GENERAR IMAGEN "DESPUÉS" basada en la imagen REAL del sitio
    const afterPrompt = `You are a professional web design assistant creating an IMPROVED VERSION of this website screenshot.

BEFORE IMAGE: This is the ACTUAL current state of ${siteUrl}

SPECIFIC IMPROVEMENT TO APPLY:
Title: ${changeTitle}
Details: ${changeDescription}
Category: ${category}

CRITICAL INSTRUCTIONS - FOLLOW EXACTLY:
1. START with the exact screenshot provided (before image) - maintain EVERYTHING unchanged
2. ONLY modify the specific element/aspect mentioned in "${changeTitle}"
3. Apply the improvement described in: "${changeDescription}"
4. KEEP 100% IDENTICAL: layout, structure, other colors, fonts, images, text, positioning, spacing
5. The change must be REALISTIC and look like it was actually implemented by a developer
6. NO artistic interpretation - this must look like a real before/after screenshot comparison
7. Maintain photorealistic quality - must look like a real website screenshot
8. Same viewport dimensions (1280x800), same browser chrome if visible
9. The improvement should be CLEAR and VISIBLE but PROFESSIONAL
10. Match the exact visual style and design language of the original site

EXAMPLE:
- If the change is "Add red CTA button", only the button color changes to red
- If it's "Improve typography", only font styling changes
- If it's "Add hero image", only add that specific image in that location
- If it's "Change background to blue", only the background color changes to blue

This is for a real client presentation - accuracy and professionalism are critical.`;

    console.log("Generando imagen DESPUÉS basada en screenshot real...");
    console.log(`Aplicando cambio específico: ${changeTitle}`);

    const afterResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
      method: "POST",
      headers: {
        "Authorization": `Bearer ${LOVABLE_API_KEY}`,
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        model: "google/gemini-2.5-flash-image-preview",
        messages: [
          {
            role: "user",
            content: [
              { type: "text", text: afterPrompt },
              { type: "image_url", image_url: { url: finalBeforeImageUrl } }
            ]
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!afterResponse.ok) {
      const errorText = await afterResponse.text();
      console.error("Error generating after image:", afterResponse.status, errorText);
      throw new Error(`Failed to generate after image: ${afterResponse.status}`);
    }

    const afterData = await afterResponse.json();
    const afterImageUrl = afterData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!afterImageUrl) {
      console.error("No after image in response:", JSON.stringify(afterData));
      throw new Error("No after image generated");
    }

    console.log("After image generated successfully");

    return new Response(
      JSON.stringify({
        beforeImageUrl: finalBeforeImageUrl,
        afterImageUrl,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200 
      }
    );

  } catch (error) {
    console.error("Error in wincova-generate-visuals:", error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : "Unknown error",
        details: error instanceof Error ? error.stack : undefined
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});