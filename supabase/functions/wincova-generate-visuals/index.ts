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
    const afterPrompt = `You are a professional web design expert creating a VISUAL SIMULATION showing how this website will look AFTER implementing a specific change.

🎯 YOUR MISSION: Make the improvement VISUALLY OBVIOUS and COMPELLING to sell the change to the client.

BEFORE IMAGE: Current state of ${siteUrl}

CHANGE TO IMPLEMENT:
📌 Title: ${changeTitle}
📋 Details: ${changeDescription}
🏷️ Category: ${category}

⚠️ CRITICAL INSTRUCTIONS - THIS IS A SALES TOOL:

1. **MAKE THE CHANGE OBVIOUS**: The client must immediately see the difference
   - If improving titles/descriptions → Show MORE DESCRIPTIVE, KEYWORD-RICH text that's clearly better
   - If improving CTAs → Make buttons MORE PROMINENT, better positioned, with action-oriented text
   - If improving layout → Show CLEARER hierarchy, better spacing, improved flow
   - If improving colors → Apply PROFESSIONAL color scheme that enhances conversion
   - If improving images → Use HIGHER QUALITY, more relevant imagery

2. **SPECIFIC IMPROVEMENTS BY CATEGORY**:
   ${category === 'SEO' ? `
   - Add/improve H1 tags with clear hierarchy
   - Show meta descriptions and title tags more prominently
   - Display structured data, breadcrumbs, or schema markup visually
   - Enhance heading structure with proper H2, H3 tags
   ` : ''}
   ${category === 'Conversión' ? `
   - Make CTAs larger, better colored, more prominent
   - Add trust signals (testimonials, ratings, guarantees)
   - Improve form layouts and reduce friction
   - Show clearer value propositions
   ` : ''}
   ${category === 'Diseño' ? `
   - Apply modern design patterns and trends
   - Improve spacing, typography, and visual hierarchy
   - Add professional color schemes
   - Enhance visual appeal dramatically
   ` : ''}

3. **KEEP UNCHANGED**: Everything else must remain identical
   - Same layout structure
   - Same images (unless the change is specifically about images)
   - Same general positioning
   - Same overall design language

4. **QUALITY REQUIREMENTS**:
   - Photorealistic website screenshot quality
   - Professional implementation (as if done by expert developer)
   - 1280x800 viewport, same browser chrome if visible
   - The change must look ACHIEVABLE and REALISTIC

5. **PSYCHOLOGICAL IMPACT**:
   - The client should think: "Wow, that's clearly better!"
   - Make them feel they NEED this improvement
   - Show the VALUE visually

EXAMPLES OF GOOD CHANGES:
❌ BAD: Showing identical image with no visible change
✅ GOOD: "Improve meta descriptions" → Show longer, more descriptive, keyword-rich titles and descriptions
✅ GOOD: "Add CTA button" → Show prominent, well-colored button in strategic location
✅ GOOD: "Improve typography" → Show clearer, more readable fonts with better hierarchy
✅ GOOD: "Enhance product images" → Show higher quality, better positioned product photos

This simulation will be shown to a PAYING CLIENT who needs to be CONVINCED to invest in these changes. Make the improvement UNDENIABLY better.`;

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