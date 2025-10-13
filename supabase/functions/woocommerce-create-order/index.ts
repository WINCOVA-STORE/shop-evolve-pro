import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { orderId } = await req.json();
    console.log('Creating WooCommerce order for Lovable order:', orderId);

    // Get order details from Supabase
    const { data: order, error: orderError } = await supabase
      .from('orders')
      .select(`
        *,
        order_items (
          id,
          product_id,
          product_name,
          product_price,
          quantity,
          subtotal
        )
      `)
      .eq('id', orderId)
      .single();

    if (orderError || !order) {
      throw new Error(`Order not found: ${orderId}`);
    }

    // Get user profile
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', order.user_id)
      .single();

    // Get WooCommerce credentials
    const wooUrl = Deno.env.get('WOOCOMMERCE_URL');
    const wooKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
    const wooSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

    if (!wooUrl || !wooKey || !wooSecret) {
      throw new Error('WooCommerce credentials not configured');
    }

    // Parse shipping address
    let shippingAddress: any = {};
    try {
      if (order.shipping_address) {
        const addr = typeof order.shipping_address === 'string' 
          ? JSON.parse(order.shipping_address) 
          : order.shipping_address;
        shippingAddress = {
          first_name: addr.firstName || profile?.full_name?.split(' ')[0] || '',
          last_name: addr.lastName || profile?.full_name?.split(' ').slice(1).join(' ') || '',
          address_1: addr.address || addr.street || '',
          city: addr.city || '',
          state: addr.state || '',
          postcode: addr.postalCode || addr.zip || '',
          country: addr.country || '',
          phone: addr.phone || profile?.phone || '',
        };
      }
    } catch (e) {
      console.error('Error parsing shipping address:', e);
    }

    // Prepare WooCommerce order data
    const wooOrderData = {
      payment_method: 'stripe',
      payment_method_title: 'Stripe',
      set_paid: order.payment_status === 'completed',
      status: order.payment_status === 'completed' ? 'processing' : 'pending',
      customer_note: order.notes || '',
      meta_data: [
        { key: '_lovable_order_id', value: order.id },
        { key: '_lovable_order_number', value: order.order_number },
      ],
      billing: {
        first_name: profile?.full_name?.split(' ')[0] || '',
        last_name: profile?.full_name?.split(' ').slice(1).join(' ') || '',
        email: profile?.email || '',
        phone: profile?.phone || '',
        ...shippingAddress,
      },
      shipping: shippingAddress,
      line_items: order.order_items.map((item: any) => ({
        product_id: parseInt(item.product_id) || 0,
        quantity: item.quantity,
        total: item.subtotal.toString(),
      })),
      shipping_lines: order.shipping > 0 ? [{
        method_id: 'flat_rate',
        method_title: 'Envío',
        total: order.shipping.toString(),
      }] : [],
    };

    console.log('Creating WooCommerce order with data:', JSON.stringify(wooOrderData, null, 2));

    // Create order in WooCommerce
    const baseUrl = wooUrl.replace(/\/$/, '');
    const hasApiPath = /\/wp-json\/wc\/v\d+$/i.test(baseUrl);
    const apiBase = hasApiPath ? baseUrl : `${baseUrl}/wp-json/wc/v3`;
    const ordersUrl = `${apiBase}/orders`;

    const authString = btoa(`${wooKey}:${wooSecret}`);
    
    const response = await fetch(ordersUrl, {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${authString}`,
        'Content-Type': 'application/json',
        'User-Agent': 'WincovaLovable/1.0',
      },
      body: JSON.stringify(wooOrderData),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('WooCommerce API error:', response.status, errorText);
      throw new Error(`WooCommerce API error: ${response.status} - ${errorText}`);
    }

    const wooOrder = await response.json();
    console.log('WooCommerce order created:', wooOrder.id);

    // Update Lovable order with WooCommerce order ID
    await supabase
      .from('orders')
      .update({
        notes: `${order.notes || ''}\n[WooCommerce Order ID: ${wooOrder.id}]`.trim(),
        updated_at: new Date().toISOString(),
      })
      .eq('id', orderId);

    return new Response(
      JSON.stringify({ 
        success: true, 
        woocommerceOrderId: wooOrder.id,
        message: 'Order sent to WooCommerce successfully. AutoDS/Spocket will process it automatically.',
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error creating WooCommerce order:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ 
        error: errorMessage,
        success: false,
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
