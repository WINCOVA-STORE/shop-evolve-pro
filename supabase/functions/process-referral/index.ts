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
    const { order_id, user_id } = await req.json();

    if (!order_id || !user_id) {
      throw new Error("Missing required parameters");
    }

    console.log("Processing referral for order:", order_id, "user:", user_id);

    // Get user's metadata to check for referral code
    const { data: userData, error: userError } = await supabaseClient.auth.admin.getUserById(user_id);
    
    if (userError) throw userError;

    const referralCode = userData.user?.user_metadata?.referral_code;

    if (!referralCode) {
      console.log("No referral code found for user");
      return new Response(JSON.stringify({ success: true, message: "No referral code" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    console.log("Found referral code:", referralCode);

    // Extract user ID from referral code (format: REF-USERID)
    const referrerUserId = referralCode.replace("REF-", "").toLowerCase();

    // Find the referrer's full user ID
    const { data: profiles, error: profileError } = await supabaseClient
      .from("profiles")
      .select("id")
      .ilike("id", `${referrerUserId}%`)
      .limit(1);

    if (profileError) throw profileError;

    if (!profiles || profiles.length === 0) {
      console.log("Referrer not found");
      return new Response(JSON.stringify({ success: true, message: "Referrer not found" }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      });
    }

    const referrerId = profiles[0].id;
    console.log("Found referrer:", referrerId);

    // Get order total
    const { data: order, error: orderError } = await supabaseClient
      .from("orders")
      .select("total")
      .eq("id", order_id)
      .single();

    if (orderError) throw orderError;

    const rewardAmount = Number(order.total) * 0.10; // 10% reward

    // Check if referral already exists
    const { data: existingReferral } = await supabaseClient
      .from("referrals")
      .select("id")
      .eq("referrer_id", referrerId)
      .eq("referred_id", user_id)
      .maybeSingle();

    if (!existingReferral) {
      // Create referral record
      const { error: referralError } = await supabaseClient
        .from("referrals")
        .insert({
          referrer_id: referrerId,
          referred_id: user_id,
          referral_code: referralCode,
          order_id: order_id,
          reward_earned: rewardAmount,
        });

      if (referralError) throw referralError;

      // Create reward for referrer
      const { error: rewardError } = await supabaseClient
        .from("rewards")
        .insert({
          user_id: referrerId,
          type: "referral",
          amount: rewardAmount,
          description: `Recompensa por referir un amigo`,
          order_id: order_id,
        });

      if (rewardError) throw rewardError;

      console.log("Referral processed successfully, reward:", rewardAmount);
    } else {
      console.log("Referral already exists");
    }

    return new Response(
      JSON.stringify({ success: true, reward: rewardAmount }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error processing referral:", error);
    return new Response(
      JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 500,
      }
    );
  }
});
