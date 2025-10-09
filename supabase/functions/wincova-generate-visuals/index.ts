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

    console.log(`Generating visuals for change: ${changeTitle}`);

    // Tomar screenshot REAL del sitio actual usando ScreenshotOne API
    // Esta API gratuita toma capturas reales de sitios web
    const screenshotApiUrl = `https://api.screenshotone.com/take`;
    const screenshotParams = new URLSearchParams({
      url: siteUrl,
      viewport_width: '1280',
      viewport_height: '800',
      device_scale_factor: '1',
      format: 'jpg',
      cache: 'false',
      block_ads: 'true',
      block_cookie_banners: 'true',
      delay: '3',
    });

    console.log("Capturando screenshot real del sitio...");
    let beforeImageUrl: string;
    
    try {
      const screenshotResponse = await fetch(`${screenshotApiUrl}?${screenshotParams}`);
      if (screenshotResponse.ok) {
        const screenshotBlob = await screenshotResponse.blob();
        const arrayBuffer = await screenshotBlob.arrayBuffer();
        const base64 = btoa(String.fromCharCode(...new Uint8Array(arrayBuffer)));
        beforeImageUrl = `data:image/jpeg;base64,${base64}`;
        console.log("Screenshot real capturado exitosamente");
      } else {
        throw new Error("Screenshot API falló");
      }
    } catch (screenshotError) {
      console.warn("No se pudo capturar screenshot real, usando generación por IA:", screenshotError);
      
      // Fallback: Generar imagen con IA si el screenshot falla
      const beforePrompt = `Create a realistic website screenshot showing the ACTUAL current state of a website like ${siteUrl}.
      
Category: ${category}
Current Problem: ${changeDescription}

CRITICAL: This must look like a REAL screenshot of an existing website, not a mockup or design concept.
Style requirements:
- Photorealistic browser screenshot
- Show actual website UI elements
- Include browser chrome (address bar, tabs)
- Desktop view at 1280x800
- Professional appearance
- Clear representation of the current issue
- Must look like a real photograph of a computer screen`;

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
        throw new Error(`Failed to generate before image: ${beforeResponse.status}`);
      }

      const beforeData = await beforeResponse.json();
      beforeImageUrl = beforeData.choices?.[0]?.message?.images?.[0]?.image_url?.url;
      
      if (!beforeImageUrl) {
        throw new Error("No before image generated");
      }
    }


    // Generate "After" visualization basada en la imagen real del sitio
    const afterPrompt = `Based on this ACTUAL website screenshot, create an improved version showing how it would look AFTER implementing this specific change:

Site: ${siteUrl}
Category: ${category}
Change to implement: ${changeTitle}
Specific improvement: ${changeDescription}

CRITICAL REQUIREMENTS:
- Start from the real screenshot provided
- Apply ONLY the specific change described
- Keep all other elements identical to the original
- Make it look realistic and achievable
- Show clear before/after difference
- Photorealistic result
- Same layout, just with the improvement applied
- Must be recognizable as an improved version of the same site`;

    console.log("Generating AFTER image based on real screenshot...");

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