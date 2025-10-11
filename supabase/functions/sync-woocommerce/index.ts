import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.7.1';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface WooProduct {
  id: number;
  name: string;
  description: string;
  short_description: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  images: Array<{ src: string }>;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ name: string }>;
  sku: string;
  status: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    );

    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      throw new Error('No authorization header');
    }

    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: authError } = await supabaseClient.auth.getUser(token);
    
    if (authError || !user) {
      throw new Error('Unauthorized');
    }

    // Check if user is admin
    const { data: roles } = await supabaseClient
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .eq('role', 'admin')
      .single();

    if (!roles) {
      throw new Error('Unauthorized: Admin access required');
    }

    // Get request parameters
    const { syncType = 'manual' } = await req.json().catch(() => ({ syncType: 'manual' }));

    // Create sync log
    const { data: syncLog, error: logError } = await supabaseClient
      .from('woocommerce_sync_logs')
      .insert({
        sync_type: syncType,
        status: 'running',
        started_at: new Date().toISOString()
      })
      .select()
      .single();

    if (logError) {
      console.error('Error creating sync log:', logError);
      throw new Error('Failed to create sync log');
    }

    console.log('Starting WooCommerce sync...', syncLog.id);

    let productsCreated = 0;
    let productsUpdated = 0;
    let productsFailed = 0;
    let productsSynced = 0;

    try {
      // WooCommerce credentials
      const wooUrl = Deno.env.get('WOOCOMMERCE_URL');
      const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
      const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

      if (!wooUrl || !consumerKey || !consumerSecret) {
        throw new Error('WooCommerce credentials not configured');
      }

      // Fetch products from WooCommerce
      console.log('Fetching products from WooCommerce...');
      const wooProductsUrl = `${wooUrl}/wp-json/wc/v3/products?per_page=100&status=publish`;
      const wooAuth = btoa(`${consumerKey}:${consumerSecret}`);
      
      const wooResponse = await fetch(wooProductsUrl, {
        headers: {
          'Authorization': `Basic ${wooAuth}`,
          'Content-Type': 'application/json',
        },
      });

      if (!wooResponse.ok) {
        throw new Error(`WooCommerce API error: ${wooResponse.status} ${wooResponse.statusText}`);
      }

      const wooProducts: WooProduct[] = await wooResponse.json();
      console.log(`Fetched ${wooProducts.length} products from WooCommerce`);

      // Get existing Lovable categories
      const { data: lovableCategories } = await supabaseClient
        .from('categories')
        .select('id, name');

      const categoryMap = new Map(lovableCategories?.map(cat => [cat.name.toLowerCase(), cat.id]) || []);

      // Get existing product mappings
      const { data: existingMappings } = await supabaseClient
        .from('woocommerce_product_mapping')
        .select('woocommerce_product_id, lovable_product_id');

      const mappingMap = new Map(existingMappings?.map(m => [m.woocommerce_product_id, m.lovable_product_id]) || []);

      // Process each product
      for (const wooProduct of wooProducts) {
        try {
          productsSynced++;

          // Map category
          let categoryId = null;
          if (wooProduct.categories && wooProduct.categories.length > 0) {
            const firstCategory = wooProduct.categories[0];
            const categoryName = firstCategory.name.toLowerCase();
            
            if (categoryMap.has(categoryName)) {
              categoryId = categoryMap.get(categoryName);
            } else {
              // Create new category in Lovable
              const { data: newCategory } = await supabaseClient
                .from('categories')
                .insert({
                  name: firstCategory.name,
                  description: `Synced from WooCommerce`
                })
                .select()
                .single();

              if (newCategory) {
                categoryId = newCategory.id;
                categoryMap.set(categoryName, categoryId);

                // Save category mapping
                await supabaseClient
                  .from('woocommerce_category_mapping')
                  .insert({
                    lovable_category_id: categoryId,
                    woocommerce_category_id: String(firstCategory.id),
                    woocommerce_category_name: firstCategory.name
                  });
              }
            }
          }

          // Prepare product data
          const price = parseFloat(wooProduct.price || wooProduct.regular_price || '0');
          const compareAtPrice = wooProduct.sale_price 
            ? parseFloat(wooProduct.regular_price || '0')
            : null;

          const productData = {
            name: wooProduct.name,
            description: wooProduct.description || wooProduct.short_description || null,
            price: price,
            compare_at_price: compareAtPrice,
            category_id: categoryId,
            images: wooProduct.images?.map(img => img.src) || [],
            stock: wooProduct.stock_quantity || 0,
            is_active: wooProduct.status === 'publish',
            sku: wooProduct.sku || null,
            tags: wooProduct.tags?.map(tag => tag.name) || [],
            reward_percentage: 1.00,
            updated_at: new Date().toISOString()
          };

          // Check if product exists in mapping
          const wooProductId = String(wooProduct.id);
          const existingProductId = mappingMap.get(wooProductId);

          if (existingProductId) {
            // Update existing product
            const { error: updateError } = await supabaseClient
              .from('products')
              .update(productData)
              .eq('id', existingProductId);

            if (updateError) {
              console.error(`Error updating product ${wooProduct.name}:`, updateError);
              productsFailed++;
            } else {
              console.log(`Updated product: ${wooProduct.name}`);
              productsUpdated++;
            }
          } else {
            // Create new product
            const { data: newProduct, error: insertError } = await supabaseClient
              .from('products')
              .insert(productData)
              .select()
              .single();

            if (insertError || !newProduct) {
              console.error(`Error creating product ${wooProduct.name}:`, insertError);
              productsFailed++;
            } else {
              console.log(`Created product: ${wooProduct.name}`);
              
              // Create mapping
              await supabaseClient
                .from('woocommerce_product_mapping')
                .insert({
                  lovable_product_id: newProduct.id,
                  woocommerce_product_id: wooProductId
                });

              productsCreated++;
            }
          }
        } catch (error) {
          console.error(`Error processing product ${wooProduct.id}:`, error);
          productsFailed++;
        }
      }

      // Update sync log with success
      await supabaseClient
        .from('woocommerce_sync_logs')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          products_synced: productsSynced,
          products_created: productsCreated,
          products_updated: productsUpdated,
          products_failed: productsFailed
        })
        .eq('id', syncLog.id);

      console.log('Sync completed successfully');

      // 🌍 AUTO-TRANSLATE: Trigger batch translation after import
      console.log('🔄 Triggering automatic batch translation...');
      try {
        const translateResponse = await supabaseClient.functions.invoke('batch-translate-products');
        if (translateResponse.data?.success) {
          console.log(`✅ Auto-translation completed: ${translateResponse.data.translated} products translated`);
        }
      } catch (translateError) {
        console.error('⚠️ Auto-translation failed (non-critical):', translateError);
        // Don't fail the import if translation fails
      }

      return new Response(
        JSON.stringify({
          success: true,
          syncLogId: syncLog.id,
          stats: {
            synced: productsSynced,
            created: productsCreated,
            updated: productsUpdated,
            failed: productsFailed
          },
          message: `Successfully synced ${productsSynced} products and triggered auto-translation`
        }),
        { 
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
          status: 200 
        }
      );

    } catch (error) {
      // Update sync log with failure
      await supabaseClient
        .from('woocommerce_sync_logs')
        .update({
          status: 'failed',
          completed_at: new Date().toISOString(),
          products_synced: productsSynced,
          products_created: productsCreated,
          products_updated: productsUpdated,
          products_failed: productsFailed,
          error_message: error instanceof Error ? error.message : String(error)
        })
        .eq('id', syncLog.id);

      throw error;
    }

  } catch (error) {
    console.error('Error in sync-woocommerce function:', error);
    return new Response(
      JSON.stringify({ 
        error: error instanceof Error ? error.message : String(error),
        details: 'Check function logs for more information'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});
