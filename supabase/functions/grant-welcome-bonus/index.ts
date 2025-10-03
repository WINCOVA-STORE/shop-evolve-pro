import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.57.2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const supabaseClient = createClient(
    Deno.env.get("SUPABASE_URL") ?? "",
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? ""
  );

  try {
    const { user_id } = await req.json();

    if (!user_id) {
      throw new Error("User ID is required");
    }

    console.log("Processing welcome bonus for user:", user_id);

    // Check if user already received welcome bonus
    const { data: profile, error: profileError } = await supabaseClient
      .from("profiles")
      .select("welcome_bonus_claimed")
      .eq("id", user_id)
      .single();

    if (profileError) {
      console.error("Error fetching profile:", profileError);
      throw profileError;
    }

    if (profile.welcome_bonus_claimed) {
      console.log("Welcome bonus already claimed");
      return new Response(
        JSON.stringify({ success: true, message: "Bonus already claimed" }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    // Grant welcome bonus: 2000 points
    const { error: rewardError } = await supabaseClient
      .from("rewards")
      .insert({
        user_id: user_id,
        type: "welcome",
        amount: 2000,
        description: "Bono de bienvenida por registrarte en Wincova",
      });

    if (rewardError) {
      console.error("Error creating welcome reward:", rewardError);
      throw rewardError;
    }

    // Mark bonus as claimed
    const { error: updateError } = await supabaseClient
      .from("profiles")
      .update({ welcome_bonus_claimed: true })
      .eq("id", user_id);

    if (updateError) {
      console.error("Error updating profile:", updateError);
      throw updateError;
    }

    console.log("Welcome bonus granted successfully: 2000 points");

    return new Response(
      JSON.stringify({ success: true, points: 2000 }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error granting welcome bonus:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
