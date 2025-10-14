import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Credentials': 'true',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { action, code } = await req.json();

    // Get existing referral cookie
    const cookies = req.headers.get('Cookie') || '';
    const referralMatch = cookies.match(/referral_code=([^;]+)/);
    const existingCode = referralMatch ? referralMatch[1] : null;

    if (action === 'save') {
      if (!code) {
        return new Response(JSON.stringify({ error: 'Code required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Set HttpOnly, Secure, SameSite cookie
      const setCookieHeader = `referral_code=${code}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/`;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': setCookieHeader
        },
      });
    }

    if (action === 'get') {
      return new Response(JSON.stringify({ 
        code: existingCode 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'clear') {
      // Clear cookie
      const setCookieHeader = `referral_code=; HttpOnly; Secure; SameSite=Strict; Max-Age=0; Path=/`;

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': setCookieHeader
        },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('referral-storage error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
