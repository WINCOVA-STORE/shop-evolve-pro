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
    // Generate secure random CSRF token
    const token = crypto.randomUUID() + crypto.randomUUID().replace(/-/g, '');

    // In production, store this token server-side with session
    // For now, return it to be stored client-side (better than nothing)
    
    return new Response(JSON.stringify({ 
      token,
      expiresAt: Date.now() + (1000 * 60 * 60) // 1 hour
    }), {
      status: 200,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('get-csrf-token error:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to generate CSRF token' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
