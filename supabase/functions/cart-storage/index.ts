import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

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
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_ANON_KEY') ?? ''
    );

    // Get session from auth header
    const authHeader = req.headers.get('Authorization');
    let sessionId: string | null = null;
    let userId: string | null = null;

    if (authHeader) {
      const token = authHeader.replace('Bearer ', '');
      const { data: { user } } = await supabaseClient.auth.getUser(token);
      userId = user?.id || null;
    }

    // If no user, use anonymous session from cookie
    if (!userId) {
      const cookies = req.headers.get('Cookie') || '';
      const sessionMatch = cookies.match(/cart_session=([^;]+)/);
      sessionId = sessionMatch ? sessionMatch[1] : crypto.randomUUID();
    }

    const { action, items } = await req.json();

    // Create response with HttpOnly, Secure, SameSite cookie
    const setCookieHeader = `cart_session=${sessionId}; HttpOnly; Secure; SameSite=Strict; Max-Age=2592000; Path=/`;

    if (action === 'save') {
      // Save cart to database or encrypted storage
      const cartData = {
        user_id: userId,
        session_id: sessionId,
        items: items,
        updated_at: new Date().toISOString()
      };

      const { error } = await supabaseClient
        .from('carts')
        .upsert(cartData, { 
          onConflict: userId ? 'user_id' : 'session_id' 
        });

      if (error) {
        console.error('Cart save error:', error);
        return new Response(JSON.stringify({ error: 'Failed to save cart' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': setCookieHeader
        },
      });
    }

    if (action === 'load') {
      const { data, error } = await supabaseClient
        .from('carts')
        .select('items')
        .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`)
        .single();

      if (error && error.code !== 'PGRST116') {
        console.error('Cart load error:', error);
      }

      return new Response(JSON.stringify({ 
        items: data?.items || [] 
      }), {
        status: 200,
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json',
          'Set-Cookie': setCookieHeader
        },
      });
    }

    if (action === 'clear') {
      const { error } = await supabaseClient
        .from('carts')
        .delete()
        .or(userId ? `user_id.eq.${userId}` : `session_id.eq.${sessionId}`);

      if (error) {
        console.error('Cart clear error:', error);
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('cart-storage error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error' 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
