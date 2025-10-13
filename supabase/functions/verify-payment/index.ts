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
    Deno.env.get("SUPABASE_SERVICE_ROLE_KEY") ?? "",
    { auth: { persistSession: false } }
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
      
      // Extraer metadata
      const subtotal = parseFloat(session.metadata?.subtotal || "0");
      const shippingCost = parseFloat(session.metadata?.shipping_cost || "0");
      const taxAmount = parseFloat(session.metadata?.tax_amount || "0");
      const pointsUsed = parseInt(session.metadata?.points_used || "0");
      const pointsDiscount = parseFloat(session.metadata?.points_discount || "0");
      const shippingConfigSnapshot = session.metadata?.shipping_config_snapshot 
        ? JSON.parse(session.metadata.shipping_config_snapshot)
        : null;

      // Determinar user_id
      let userId = session.metadata?.user_id;
      if (!userId || userId === 'guest') {
        const authHeader = req.headers.get("Authorization");
        if (authHeader) {
          const token = authHeader.replace("Bearer ", "");
          const { data: { user } } = await supabaseClient.auth.getUser(token);
          userId = user?.id || null;
        }
      }

      if (!userId) {
        throw new Error("User ID is required to create an order");
      }

      // Generar order number
      const orderNumber = `WCV-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`;

      // Crear orden con snapshot de configuración
      const { data: order, error: orderError } = await supabaseClient
        .from("orders")
        .insert({
          user_id: userId,
          order_number: orderNumber,
          subtotal: subtotal,
          tax: taxAmount,
          shipping: shippingCost,
          total: session.amount_total! / 100,
          status: "processing",
          payment_status: "completed",
          stripe_payment_intent_id: session.payment_intent as string,
          currency: session.currency?.toUpperCase() || "USD",
          shipping_config_snapshot: shippingConfigSnapshot,
        })
        .select()
        .single();

      if (orderError) throw orderError;

      // Insertar order items (excluir envío del listado de productos)
      const productItems = lineItems.data.filter(
        (item: any) => !item.description?.toLowerCase().includes("envío")
      );

      for (const item of productItems) {
        await supabaseClient.from("order_items").insert({
          order_id: order.id,
          product_name: item.description || "Product",
          product_price: (item.amount_total || 0) / 100 / (item.quantity || 1),
          quantity: item.quantity || 1,
          subtotal: (item.amount_total || 0) / 100,
        });
      }

      // Deducir puntos usados
      if (pointsUsed > 0) {
        await supabaseClient.from("rewards").insert({
          user_id: userId,
          type: "purchase",
          amount: -pointsUsed,
          description: `Puntos usados en pedido ${orderNumber}`,
          order_id: order.id,
        });
      }

      // 🚀 Enviar orden a WooCommerce para que AutoDS/Spocket la procesen
      try {
        console.log('📦 Sending order to WooCommerce for dropshipping...', order.id);
        const wooResponse = await supabaseClient.functions.invoke('woocommerce-create-order', {
          body: { orderId: order.id }
        });

        if (wooResponse.error) {
          console.error('⚠️ Error sending to WooCommerce:', wooResponse.error);
          // No throw - queremos que la orden se complete aunque WooCommerce falle
        } else {
          console.log('✅ Order sent to WooCommerce successfully:', wooResponse.data);
        }
      } catch (wooError) {
        console.error('⚠️ WooCommerce integration error:', wooError);
        // Continuamos - la orden está creada en Lovable
      }

      // Verificar si es primera compra para bono de bienvenida
      const { data: previousOrders } = await supabaseClient
        .from("orders")
        .select("id")
        .eq("user_id", userId)
        .neq("id", order.id)
        .limit(1);

      if (!previousOrders || previousOrders.length === 0) {
        // Primera compra - otorgar bono de bienvenida si no lo ha recibido
        const { data: profile } = await supabaseClient
          .from("profiles")
          .select("welcome_bonus_claimed")
          .eq("id", userId)
          .single();

        if (!profile?.welcome_bonus_claimed) {
          await supabaseClient.from("rewards").insert({
            user_id: userId,
            type: "welcome",
            amount: 2000,
            description: "Bono de bienvenida por tu primera compra",
            order_id: order.id,
          });

          await supabaseClient
            .from("profiles")
            .update({ welcome_bonus_claimed: true })
            .eq("id", userId);
        }
      }

      // Calcular puntos usando la función de base de datos (configuración dinámica)
      const { data: pointsData, error: pointsError } = await supabaseClient
        .rpc('calculate_purchase_points', {
          p_subtotal: subtotal,
          p_tax: taxAmount,
          p_shipping: shippingCost,
          p_store_id: 'wincova_main'
        });

      if (pointsError) {
        console.error('Error calculating points:', pointsError);
      }

      const purchasePoints = pointsData || 0;
      
      if (purchasePoints > 0) {
        await supabaseClient.from("rewards").insert({
          user_id: userId,
          type: "purchase",
          amount: purchasePoints,
          description: `Puntos por compra ${orderNumber}`,
          order_id: order.id,
        });
      }

      return new Response(
        JSON.stringify({
          success: true,
          order_id: order.id,
          order_number: orderNumber,
          points_earned: purchasePoints,
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
