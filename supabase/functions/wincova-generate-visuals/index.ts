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

    // ESTRATEGIA ÚNICA: Solo screenshots REALES
    // NO generamos imágenes con IA para el "antes"
    let beforeImageUrl: string;
    
    console.log("Capturando screenshot REAL del sitio...");
    
    // API de screenshots (screenshotapi.net)
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
    beforeImageUrl = `data:image/png;base64,${base64}`;
    console.log("✅ Screenshot REAL capturado exitosamente");


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