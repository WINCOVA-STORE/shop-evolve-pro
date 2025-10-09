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
    const { changeTitle, changeDescription, category, siteUrl } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");

    if (!LOVABLE_API_KEY) {
      throw new Error("LOVABLE_API_KEY not configured");
    }

    console.log(`Generating visuals for change: ${changeTitle}`);

    // Generate "Before" visualization
    const beforePrompt = `Create a clean, professional website mockup screenshot showing the CURRENT STATE with the following issue:

Site: ${siteUrl}
Category: ${category}
Problem: ${changeDescription}

Style requirements:
- Modern website interface
- Show the problem clearly
- Professional UI design
- Desktop view
- Realistic website appearance
- Clear visual representation of the current issue`;

    console.log("Generating BEFORE image...");
    const beforeResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
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
            content: beforePrompt
          }
        ],
        modalities: ["image", "text"]
      })
    });

    if (!beforeResponse.ok) {
      const errorText = await beforeResponse.text();
      console.error("Error generating before image:", beforeResponse.status, errorText);
      throw new Error(`Failed to generate before image: ${beforeResponse.status}`);
    }

    const beforeData = await beforeResponse.json();
    const beforeImageUrl = beforeData.choices?.[0]?.message?.images?.[0]?.image_url?.url;

    if (!beforeImageUrl) {
      console.error("No before image in response:", JSON.stringify(beforeData));
      throw new Error("No before image generated");
    }

    console.log("Before image generated successfully");

    // Generate "After" visualization
    const afterPrompt = `Create a clean, professional website mockup screenshot showing the IMPROVED STATE after implementing:

Site: ${siteUrl}
Category: ${category}
Improvement: ${changeTitle}
Solution: ${changeDescription}

Style requirements:
- Same website interface as before but improved
- Show the solution clearly implemented
- Professional UI design
- Desktop view
- Realistic website appearance
- Clear visual improvement from the before state
- Highlight the positive change`;

    console.log("Generating AFTER image...");
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
            content: afterPrompt
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