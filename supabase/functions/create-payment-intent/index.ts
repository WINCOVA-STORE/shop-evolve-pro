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
    Deno.env.get("SUPABASE_ANON_KEY") ?? ""
  );

  try {
    const authHeader = req.headers.get("Authorization")!;
    const token = authHeader.replace("Bearer ", "");
    const { data } = await supabaseClient.auth.getUser(token);
    const user = data.user;
    
    const { cartItems, total, pointsUsed, pointsDiscount } = await req.json();
    
    if (!cartItems || cartItems.length === 0) {
      throw new Error("Cart is empty");
    }

    // Obtener configuración de envío activa
    const { data: shippingConfig, error: configError } = await supabaseClient
      .from('shipping_config')
      .select('*')
      .eq('store_id', 'wincova_main')
      .single();

    if (configError) {
      console.error("Error fetching shipping config:", configError);
      throw new Error("Failed to load shipping configuration");
    }

    // Calcular subtotal de productos
    const subtotal = cartItems.reduce((sum: number, item: any) => 
      sum + (item.product_price * item.quantity), 0
    );

    // Calcular costo de envío basado en configuración
    let shippingCost = 0;
    if (shippingConfig.mode === 'manual' && shippingConfig.manual_global_cost) {
      shippingCost = shippingConfig.manual_global_cost;
    }

    // Calcular tax (10% del subtotal)
    const taxAmount = subtotal * 0.1;

    // Total final
    const finalTotal = subtotal + taxAmount + shippingCost - (pointsDiscount || 0);

    const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY") || "", {
      apiVersion: "2025-08-27.basil",
    });

    let customerId;
    if (user?.email) {
      const customers = await stripe.customers.list({ email: user.email, limit: 1 });
      if (customers.data.length > 0) {
        customerId = customers.data[0].id;
      }
    }

    // Crear PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
      amount: Math.round(finalTotal * 100), // Convertir a centavos
      currency: 'usd',
      customer: customerId,
      metadata: {
        user_id: user?.id || 'guest',
        points_used: pointsUsed?.toString() || '0',
        points_discount: pointsDiscount?.toString() || '0',
        subtotal: subtotal.toString(),
        shipping_cost: shippingCost.toString(),
        tax_amount: taxAmount.toString(),
        cart_items: JSON.stringify(cartItems),
        shipping_config_snapshot: JSON.stringify({
          mode: shippingConfig.mode,
          cost: shippingCost,
        }),
      },
      automatic_payment_methods: {
        enabled: true,
      },
    });

    return new Response(JSON.stringify({ clientSecret: paymentIntent.client_secret }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 200,
    });
  } catch (error) {
    console.error("Error creating payment intent:", error);
    return new Response(JSON.stringify({ error: error instanceof Error ? error.message : "Unknown error" }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
      status: 500,
    });
  }
});
