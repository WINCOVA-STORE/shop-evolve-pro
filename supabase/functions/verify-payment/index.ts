import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import Stripe from "https://esm.sh/stripe@18.5.0";
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
    const { session_id } = await req.json();
    
    if (!session_id) {
      throw new Error("Session ID is required");
    }

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    const session = await stripe.checkout.sessions.retrieve(session_id);
    
    if (session.payment_status === "paid") {
      // Get line items
      const lineItems = await stripe.checkout.sessions.listLineItems(session_id);
      
      const authHeader = req.headers.get("Authorization");
      let userId = session.metadata?.user_id;
      
      if (authHeader) {
        const token = authHeader.replace("Bearer ", "");
        const { data } = await supabaseClient.auth.getUser(token);
        if (data.user) {
          userId = data.user.id;
        }
      }

      if (!userId || userId === 'guest') {
        throw new Error("User not authenticated");
      }

      // Create order
      const orderNumber = `ORD-${Date.now()}`;
      const { data: order, error: orderError } = await supabaseClient
        .from('orders')
        .insert({
          user_id: userId,
          order_number: orderNumber,
          status: 'confirmed',
          payment_status: 'paid',
          subtotal: session.amount_subtotal! / 100,
          total: session.amount_total! / 100,
          currency: session.currency?.toUpperCase(),
          stripe_payment_intent_id: session.payment_intent as string,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Create order items
      const orderItems = lineItems.data.map((item: any) => ({
        order_id: order.id,
        product_name: item.description || 'Product',
        quantity: item.quantity || 1,
        product_price: (item.amount_total || 0) / 100 / (item.quantity || 1),
        subtotal: (item.amount_total || 0) / 100,
      }));

      const { error: itemsError } = await supabaseClient
        .from('order_items')
        .insert(orderItems);

      if (itemsError) throw itemsError;

      // Deduct points if used
      const pointsUsed = parseInt(session.metadata?.points_used || '0');
      if (pointsUsed > 0 && userId && userId !== 'guest') {
        const { error: pointsError } = await supabaseClient
          .from('rewards')
          .insert({
            user_id: userId,
            type: 'redemption',
            amount: -pointsUsed,
            description: `Puntos usados en orden ${orderNumber}`,
            order_id: order.id,
          });

        if (pointsError) {
          console.error('Error deducting points:', pointsError);
        } else {
          console.log(`Deducted ${pointsUsed} points for order ${orderNumber}`);
        }
      }

      // Process rewards: Welcome bonus + Purchase rewards
      if (userId && userId !== 'guest') {
        try {
          // Check if this is the user's first order
          const { count } = await supabaseClient
            .from('orders')
            .select('id', { count: 'exact', head: true })
            .eq('user_id', userId);

          const orderTotal = Number(session.amount_total! / 100);
          const rewards = [];

          // Welcome bonus: 2000 points on first purchase (only if not claimed)
          if (count === 1) {
            const { data: profile } = await supabaseClient
              .from('profiles')
              .select('welcome_bonus_claimed')
              .eq('id', userId)
              .single();

            if (profile && !profile.welcome_bonus_claimed) {
              rewards.push({
                user_id: userId,
                type: 'welcome',
                amount: 2000,
                description: 'Bono de bienvenida',
                order_id: order.id,
              });

              // Mark welcome bonus as claimed
              await supabaseClient
                .from('profiles')
                .update({ welcome_bonus_claimed: true })
                .eq('id', userId);
            }
          }

          // Purchase reward: 1% of purchase amount in points (1000 points = $1)
          const purchasePoints = Math.floor(orderTotal * 10); // 1% = orderTotal * 0.01 * 1000
          rewards.push({
            user_id: userId,
            type: 'purchase',
            amount: purchasePoints,
            description: `Recompensa por compra de $${orderTotal.toFixed(2)}`,
            order_id: order.id,
          });

          // Insert all rewards
          if (rewards.length > 0) {
            const { error: rewardsError } = await supabaseClient
              .from('rewards')
              .insert(rewards);

            if (rewardsError) {
              console.error('Error creating rewards:', rewardsError);
            } else {
              console.log(`Created ${rewards.length} rewards totaling ${rewards.reduce((sum, r) => sum + r.amount, 0)} points`);
            }
          }
        } catch (rewardError) {
          console.error('Error processing rewards:', rewardError);
          // Don't fail the order if reward processing fails
        }
      }

      return new Response(
        JSON.stringify({ 
          success: true, 
          order_id: order.id,
          order_number: orderNumber 
        }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
          status: 200,
        }
      );
    }

    return new Response(
      JSON.stringify({ success: false, payment_status: session.payment_status }),
      {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
        status: 200,
      }
    );
  } catch (error) {
    console.error("Error verifying payment:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
