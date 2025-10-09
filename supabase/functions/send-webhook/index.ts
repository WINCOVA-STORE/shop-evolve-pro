import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
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

    const { event_type, organization_id, payload } = await req.json();

    console.log('Webhook event:', event_type, 'for org:', organization_id);

    // Fetch active webhooks for this organization and event type
    const { data: webhooks } = await supabase
      .from('webhooks_config')
      .select('*')
      .eq('organization_id', organization_id)
      .eq('is_active', true)
      .contains('events', [event_type]);

    if (!webhooks || webhooks.length === 0) {
      console.log('No active webhooks found for event:', event_type);
      return new Response(JSON.stringify({ sent: 0 }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Send webhooks in parallel
    const deliveryPromises = webhooks.map(async (webhook: any) => {
      const deliveryId = crypto.randomUUID();
      let attempt = 0;
      let delivered = false;
      let responseStatus = 0;
      let responseBody = '';

      while (attempt < webhook.retry_count && !delivered) {
        attempt++;
        try {
          console.log(`Sending webhook to ${webhook.url} (attempt ${attempt})`);

          const response = await fetch(webhook.url, {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
              'X-Webhook-Event': event_type,
              'X-Webhook-ID': deliveryId,
              ...webhook.headers
            },
            body: JSON.stringify(payload),
            signal: AbortSignal.timeout(webhook.timeout_seconds * 1000)
          });

          responseStatus = response.status;
          responseBody = await response.text();
          delivered = response.ok;

          console.log(`Webhook response: ${responseStatus}`);

        } catch (error) {
          console.error(`Webhook delivery failed (attempt ${attempt}):`, error);
          responseStatus = 0;
          responseBody = error instanceof Error ? error.message : 'Unknown error';
        }

        // Wait before retry (exponential backoff)
        if (!delivered && attempt < webhook.retry_count) {
          await new Promise(resolve => setTimeout(resolve, Math.pow(2, attempt) * 1000));
        }
      }

      // Log delivery
      await supabase.from('webhook_deliveries').insert({
        webhook_id: webhook.id,
        event_type,
        payload,
        response_status: responseStatus,
        response_body: responseBody.substring(0, 1000), // Limit to 1000 chars
        attempt_count: attempt,
        delivered_at: delivered ? new Date().toISOString() : null
      });

      return delivered;
    });

    const results = await Promise.all(deliveryPromises);
    const successCount = results.filter(r => r).length;

    console.log(`Webhooks sent: ${successCount}/${webhooks.length}`);

    return new Response(JSON.stringify({ 
      sent: successCount,
      total: webhooks.length 
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('Error in send-webhook:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: errorMessage }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
