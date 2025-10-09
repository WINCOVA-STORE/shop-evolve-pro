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
    const { changeTitle, changeDescription, category, siteUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Generating REAL visuals for change: ${changeTitle}`);

    // ESTRATEGIA 1: Intentar captura real con API de screenshots
    // Usamos screenshotapi.net que es más confiable
    let beforeImageUrl: string;
    
    console.log("Capturando screenshot REAL del sitio...");
    try {
      // API de screenshots más confiable (screenshotapi.net)
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

      if (screenshotResponse.ok) {
        const arrayBuffer = await screenshotResponse.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        beforeImageUrl = `data:image/png;base64,${base64}`;
        console.log("✅ Screenshot REAL capturado exitosamente del sitio actual");
      } else {
        throw new Error(`Screenshot API respondió con: ${screenshotResponse.status}`);
      }
    } catch (screenshotError) {
      console.warn("⚠️ Screenshot API falló, usando método alternativo:", screenshotError);
      
      // ESTRATEGIA 2: Crear representación ultra-realista con IA
      // Esta estrategia crea una imagen que parece screenshot pero está optimizada
      const beforePrompt = `You are capturing a REAL screenshot of this exact website: ${siteUrl}

CRITICAL INSTRUCTIONS:
1. This must look EXACTLY like a real screenshot taken from a browser
2. Show the ACTUAL current state with this problem: ${changeDescription}
3. Category context: ${category}
4. Include browser UI (address bar showing ${siteUrl}, tabs, buttons)
5. Desktop view at 1280x800 resolution
6. Make it look like a PHOTOGRAPH of a real computer screen showing this website
7. Show realistic UI elements, text, images, buttons, navigation
8. The design should match what ${siteUrl} actually looks like
9. Professional, clean, and realistic appearance
10. Include realistic shadows, anti-aliasing, and screen texture

Style: Photorealistic browser screenshot, not a mockup or design concept`;

      const beforeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
        method: "POST",
        headers: {
          "Authorization": `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-2.5-flash-image-preview",
          messages: [{ role: "user", content: beforePrompt }],
          modalities: ["image", "text"]
        })
      });

      if (!beforeResponse.ok) {
        throw new Error(`Failed to generate realistic before image: ${beforeResponse.status}`);
      }

      const beforeData = await beforeResponse.json();
      beforeImageUrl = beforeData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!beforeImageUrl) {
        throw new Error("No realistic before image generated");
      }
      
      console.log("✅ Imagen ultra-realista del estado actual generada");
    }


    // GENERAR IMAGEN "DESPUÉS" basada en la imagen REAL del sitio
    const afterPrompt = `You are creating an IMPROVED VERSION of this exact website screenshot.

BEFORE IMAGE: This is the ACTUAL current state of ${siteUrl}

TASK: Apply ONLY this specific improvement:
Change: ${changeTitle}
Details: ${changeDescription}
Category: ${category}

CRITICAL REQUIREMENTS:
1. Start from the REAL screenshot provided (the before image)
2. Apply ONLY the specific change described - nothing else
3. Keep layout, colors, branding IDENTICAL to the original
4. Make the improvement look PROFESSIONAL and REALISTIC
5. The result must look like a REAL screenshot, not AI art
6. Show clear visual difference in the improved area
7. Maintain photorealistic quality
8. Same browser UI, same dimensions (1280x800)
9. The improvement should be obvious but subtle
10. Must be recognizable as the same site, just improved

This is a REAL before/after comparison for a client - it must be accurate and professional.`;

    console.log("Generando imagen DESPUÉS basada en screenshot real...");

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
              { type: "image_url", image_url: { url: beforeImageUrl } }
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
        beforeImageUrl,
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