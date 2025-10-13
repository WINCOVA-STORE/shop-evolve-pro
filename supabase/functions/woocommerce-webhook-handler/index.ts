import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.39.3";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type, x-wc-webhook-signature',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const webhookData = await req.json();
    const topic = req.headers.get('x-wc-webhook-topic');
    const signature = req.headers.get('x-wc-webhook-signature');

    console.log('Received WooCommerce webhook:', topic, 'Order ID:', webhookData.id);

    // Validate webhook signature (opcional pero recomendado)
    // const wooSecret = Deno.env.get('WOOCOMMERCE_WEBHOOK_SECRET');
    // if (wooSecret) {
    //   const computedSignature = await crypto.subtle.digest(
    //     'SHA-256',
    //     new TextEncoder().encode(JSON.stringify(webhookData) + wooSecret)
    //   );
    //   // Validar signature
    // }

    // Handle different webhook topics
    if (topic === 'order.updated' || topic === 'order.completed') {
      // Find corresponding Lovable order
      const lovableOrderId = webhookData.meta_data?.find(
        (meta: any) => meta.key === '_lovable_order_id'
      )?.value;

      if (!lovableOrderId) {
        console.log('No Lovable order ID found in WooCommerce order meta');
        return new Response(JSON.stringify({ message: 'No matching Lovable order' }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200,
        });
      }

      // Update Lovable order status and tracking
      const updateData: any = {
        updated_at: new Date().toISOString(),
      };

      // Map WooCommerce status to Lovable status
      const statusMap: Record<string, string> = {
        'processing': 'processing',
        'completed': 'delivered',
        'on-hold': 'pending',
        'cancelled': 'cancelled',
        'refunded': 'cancelled',
        'failed': 'cancelled',
      };

      if (webhookData.status && statusMap[webhookData.status]) {
        updateData.status = statusMap[webhookData.status];
      }

      // Extract tracking information from meta_data or shipping lines
      const trackingMeta = webhookData.meta_data?.find(
        (meta: any) => meta.key === '_tracking_number' || meta.key === 'tracking_number'
      );
      
      const carrierMeta = webhookData.meta_data?.find(
        (meta: any) => meta.key === '_tracking_carrier' || meta.key === 'carrier'
      );

      if (trackingMeta?.value) {
        updateData.tracking_number = trackingMeta.value;
      }

      if (carrierMeta?.value) {
        updateData.carrier = carrierMeta.value;
      }

      console.log('Updating Lovable order:', lovableOrderId, updateData);

      const { error } = await supabase
        .from('orders')
        .update(updateData)
        .eq('id', lovableOrderId);

      if (error) {
        console.error('Error updating Lovable order:', error);
        throw error;
      }

      console.log('✅ Order updated successfully in Lovable');
    }

    return new Response(
      JSON.stringify({ success: true, message: 'Webhook processed' }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      }
    );

  } catch (error) {
    console.error('Error processing webhook:', error);
    const errorMessage = error instanceof Error ? error.message : String(error);
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      }
    );
  }
});
