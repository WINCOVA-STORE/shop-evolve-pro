import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Rate limiting map (in-memory for this function instance)
const rateLimitMap = new Map<string, { count: number; resetTime: number }>();
const RATE_LIMIT = 100; // requests per window
const WINDOW_MS = 60000; // 1 minute

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    // Authentication required
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Check admin role
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      return new Response(JSON.stringify({ error: 'Forbidden: Admin access required' }), {
        status: 403,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Rate limiting per user
    const now = Date.now();
    const userLimit = rateLimitMap.get(user.id);
    
    if (userLimit) {
      if (now < userLimit.resetTime) {
        if (userLimit.count >= RATE_LIMIT) {
          return new Response(JSON.stringify({ 
            error: 'Rate limit exceeded', 
            retryAfter: Math.ceil((userLimit.resetTime - now) / 1000) 
          }), {
            status: 429,
            headers: { 
              ...corsHeaders, 
              'Content-Type': 'application/json',
              'Retry-After': String(Math.ceil((userLimit.resetTime - now) / 1000))
            },
          });
        }
        userLimit.count++;
      } else {
        rateLimitMap.set(user.id, { count: 1, resetTime: now + WINDOW_MS });
      }
    } else {
      rateLimitMap.set(user.id, { count: 1, resetTime: now + WINDOW_MS });
    }

    // Get request body
    const { action, keyId } = await req.json();

    if (action === 'create-key') {
      // Create new API key
      const { name } = await req.json();
      
      if (!name || name.trim().length === 0) {
        return new Response(JSON.stringify({ error: 'Key name required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Generate secure random key
      const randomKey = `wt_${crypto.randomUUID().replace(/-/g, '')}`;

      const { data, error } = await supabaseClient
        .from('translation_api_keys')
        .insert({
          store_id: 'wincova_main',
          api_key: randomKey,
          name: name.trim(),
          is_active: true,
          rate_limit_per_minute: 60,
          created_by: user.id
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating key:', error);
        return new Response(JSON.stringify({ error: 'Failed to create key' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Return masked key for security (only show once)
      return new Response(JSON.stringify({ 
        success: true, 
        key: randomKey, // Only returned once
        id: data.id 
      }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'delete-key') {
      if (!keyId) {
        return new Response(JSON.stringify({ error: 'Key ID required' }), {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      const { error } = await supabaseClient
        .from('translation_api_keys')
        .delete()
        .eq('id', keyId);

      if (error) {
        console.error('Error deleting key:', error);
        return new Response(JSON.stringify({ error: 'Failed to delete key' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      return new Response(JSON.stringify({ success: true }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    if (action === 'list-keys') {
      const { data, error } = await supabaseClient
        .from('translation_api_keys')
        .select('id, name, created_at, last_used_at, is_active, rate_limit_per_minute')
        .eq('store_id', 'wincova_main')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error listing keys:', error);
        return new Response(JSON.stringify({ error: 'Failed to list keys' }), {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        });
      }

      // Never return actual API keys
      return new Response(JSON.stringify({ success: true, keys: data }), {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    return new Response(JSON.stringify({ error: 'Invalid action' }), {
      status: 400,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });

  } catch (error) {
    console.error('translate-secure error:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error instanceof Error ? error.message : 'Unknown error'
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
