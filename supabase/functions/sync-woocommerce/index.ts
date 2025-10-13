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
    let productsDeactivated = 0;

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

      // Normalize base URL: accept either domain or full /wp-json/wc/v3 path
      const baseUrl = wooUrl.replace(/\/$/, '');
      const hasApiPath = /\/wp-json\/wc\/v\d+$/i.test(baseUrl);
      const apiBase = hasApiPath ? baseUrl : `${baseUrl}/wp-json/wc/v3`;
      let productsUrlBase = `${apiBase}/products?per_page=100&status=publish`;

      // Try Basic Auth first (may be blocked by some hosts)
      const wooAuth = btoa(`${consumerKey}:${consumerSecret}`);
      let wooResponse = await fetch(productsUrlBase, {
        headers: {
          'Authorization': `Basic ${wooAuth}`,
          'Content-Type': 'application/json',
        },
      });

      // If unauthorized or forbidden, retry using query params auth (recommended over HTTPs)
      if (!wooResponse.ok && (wooResponse.status === 401 || wooResponse.status === 403)) {
        const urlWithQuery = `${productsUrlBase}&consumer_key=${encodeURIComponent(consumerKey)}&consumer_secret=${encodeURIComponent(consumerSecret)}`;
        console.warn(`Basic auth rejected (${wooResponse.status}). Retrying with query auth at: ${apiBase}/products?...`);
        wooResponse = await fetch(urlWithQuery, {
          headers: { 'Content-Type': 'application/json' },
        });
      }

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

      // 🗑️ STEP 1: Detect and deactivate deleted products
      console.log('🔍 Checking for deleted products...');
      const wooProductIds = new Set(wooProducts.map(p => String(p.id)));
      const mappedProductIds = Array.from(mappingMap.keys());
      
      let productsDeactivated = 0;
      for (const mappedWooId of mappedProductIds) {
        if (!wooProductIds.has(mappedWooId)) {
          // Product exists in our DB but not in WooCommerce anymore
          const lovableProductId = mappingMap.get(mappedWooId);
          console.log(`⚠️ Product ${mappedWooId} no longer exists in WooCommerce, deactivating...`);
          
          const { error: deactivateError } = await supabaseClient
            .from('products')
            .update({ is_active: false })
            .eq('id', lovableProductId);
          
          if (!deactivateError) {
            productsDeactivated++;
          }
        }
      }
      
      if (productsDeactivated > 0) {
        console.log(`✅ Deactivated ${productsDeactivated} deleted products`);
      }

      // 🔄 STEP 2: Process each product from WooCommerce
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
            // Update existing product - ONLY update stock, prices, images, status
            // DO NOT update name/description (already optimized with AI)
            const updateData = {
              price: price,
              compare_at_price: compareAtPrice,
              stock: wooProduct.stock_quantity || 0,
              is_active: wooProduct.status === 'publish',
              images: wooProduct.images?.map(img => img.src) || [],
              sku: wooProduct.sku || null,
              tags: wooProduct.tags?.map(tag => tag.name) || [],
              updated_at: new Date().toISOString()
            };

            const { error: updateError } = await supabaseClient
              .from('products')
              .update(updateData)
              .eq('id', existingProductId);

            if (updateError) {
              console.error(`Error updating product ${wooProduct.name}:`, updateError);
              productsFailed++;
            } else {
              console.log(`✅ Updated product (stock/price): ${wooProduct.name}`);
              productsUpdated++;
            }
          } else {
            // Create new product - includes ALL data for AI optimization
            const { data: newProduct, error: insertError } = await supabaseClient
              .from('products')
              .insert(productData)
              .select()
              .single();

            if (insertError || !newProduct) {
              console.error(`Error creating product ${wooProduct.name}:`, insertError);
              productsFailed++;
            } else {
              console.log(`✨ Created NEW product: ${wooProduct.name} (will be translated)`);
              
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
          products_failed: productsFailed,
          products_deleted: productsDeactivated
        })
        .eq('id', syncLog.id);

      console.log(`✅ Sync completed successfully:`);
      console.log(`   📊 Total WooCommerce products: ${productsSynced}`);
      console.log(`   ✨ NEW products created: ${productsCreated} (will be auto-translated)`);
      console.log(`   ♻️ Existing updated (stock/price only): ${productsUpdated}`);
      console.log(`   🗑️ Deactivated (deleted in WooCommerce): ${productsDeactivated}`);
      console.log(`   ❌ Failed: ${productsFailed}`);
      console.log(`   💰 AI tokens saved: ${productsUpdated * 4} translations (name/desc preserved)`);

      // 🌍 AUTO-TRANSLATE: Only translate NEW products (resource optimization)
      if (productsCreated > 0) {
        console.log(`🔄 Auto-translating ${productsCreated} NEW products only...`);
        try {
          const translateResponse = await supabaseClient.functions.invoke('batch-translate-products');
          if (translateResponse.error) {
            console.error('⚠️ Auto-translation error:', translateResponse.error);
          } else if (translateResponse.data?.success) {
            console.log(`✅ Auto-translation completed: ${translateResponse.data.translated} products translated`);
          }
        } catch (translateError) {
          console.error('⚠️ Auto-translation failed (non-critical):', translateError);
        }
      } else {
        console.log('⚡ No new products - skipping translation (resource optimization)');
      }

      return new Response(
        JSON.stringify({
          success: true,
          syncLogId: syncLog.id,
          stats: {
            synced: productsSynced,
            created: productsCreated,
            updated: productsUpdated,
            deactivated: productsDeactivated,
            failed: productsFailed,
            tokensOptimized: productsUpdated * 4 // AI translations saved
          },
          message: `✅ Optimized sync: ${productsCreated} new (translated), ${productsUpdated} updated (preserved), ${productsDeactivated} deactivated`
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
          products_deleted: productsDeactivated,
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
