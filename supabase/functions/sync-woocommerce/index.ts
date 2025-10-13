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
  stock_status: string;
  images: Array<{ src: string; name?: string; alt?: string }>;
  categories: Array<{ id: number; name: string }>;
  tags: Array<{ name: string }>;
  attributes: Array<{ id: number; name: string; options: string[] }>;
  sku: string;
  status: string;
  type: string; // 'simple' | 'variable' | 'grouped' | 'external'
  weight?: string;
  dimensions?: { length: string; width: string; height: string };
  meta_data?: Array<{ key: string; value: any }>;
}

interface WooVariation {
  id: number;
  sku: string;
  price: string;
  regular_price: string;
  sale_price: string;
  stock_quantity: number | null;
  stock_status: string;
  image: { src: string } | null;
  attributes: Array<{ name: string; option: string }>;
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
    let productsSkipped = 0;

    try {
      // WooCommerce credentials
      const wooUrl = Deno.env.get('WOOCOMMERCE_URL');
      const consumerKey = Deno.env.get('WOOCOMMERCE_CONSUMER_KEY');
      const consumerSecret = Deno.env.get('WOOCOMMERCE_CONSUMER_SECRET');

      if (!wooUrl || !consumerKey || !consumerSecret) {
        throw new Error('WooCommerce credentials not configured');
      }

      const baseUrl = wooUrl.replace(/\/$/, '');
      const hasApiPath = /\/wp-json\/wc\/v\d+$/i.test(baseUrl);
      const apiBase = hasApiPath ? baseUrl : `${baseUrl}/wp-json/wc/v3`;

      // Helper: Make authenticated request
      const makeRequest = async (url: string, useBasic: boolean, timeoutMs: number) => {
        const controller = new AbortController();
        const timeout = setTimeout(() => controller.abort(), timeoutMs);
        
        try {
          const headers: Record<string, string> = { 
            'Accept': 'application/json', 
            'Content-Type': 'application/json',
            'User-Agent': 'WincovaSync/2.0'
          };
          
          if (useBasic) {
            const wooAuth = btoa(`${consumerKey}:${consumerSecret}`);
            headers['Authorization'] = `Basic ${wooAuth}`;
          }
          
          return await fetch(url, { headers, signal: controller.signal });
        } finally {
          clearTimeout(timeout);
        }
      };

      const parseJson = async (res: Response) => {
        const ct = res.headers.get('content-type') || '';
        if (!ct.includes('application/json')) {
          const text = await res.text();
          throw new Error(`Non-JSON response (${res.status}): ${text.slice(0, 200)}`);
        }
        return await res.json();
      };

      console.log('🚀 Fetching products from WooCommerce...');
      
      // 🔥 STEP 1: Get first page to determine total pages
      const perPage = 100;
      const firstPageUrl = `${apiBase}/products?per_page=${perPage}&page=1&status=publish`;
      
      let firstRes = await makeRequest(firstPageUrl, true, 45000);
      if (!firstRes.ok && (firstRes.status === 401 || firstRes.status === 403)) {
        const urlWithQuery = `${firstPageUrl}&consumer_key=${encodeURIComponent(consumerKey)}&consumer_secret=${encodeURIComponent(consumerSecret)}`;
        firstRes = await makeRequest(urlWithQuery, false, 45000);
      }
      
      if (!firstRes.ok) {
        throw new Error(`Failed to fetch first page: ${firstRes.status}`);
      }
      
      const allProducts: WooProduct[] = await parseJson(firstRes);
      const totalPages = parseInt(firstRes.headers.get('X-WP-TotalPages') || '1');
      const totalProducts = parseInt(firstRes.headers.get('X-WP-Total') || String(allProducts.length));
      
      console.log(`📦 Total: ${totalProducts} products across ${totalPages} pages`);
      console.log(`✓ Page 1/${totalPages}: ${allProducts.length} products`);

      // 🚀 STEP 2: Fetch remaining pages IN PARALLEL
      if (totalPages > 1) {
        const pagePromises: Promise<WooProduct[]>[] = [];
        
        for (let page = 2; page <= totalPages; page++) {
          const pageUrl = `${apiBase}/products?per_page=${perPage}&page=${page}&status=publish`;
          
          const pagePromise = (async () => {
            try {
              let res = await makeRequest(pageUrl, true, 45000);
              
              if (!res.ok && (res.status === 401 || res.status === 403)) {
                const urlWithQuery = `${pageUrl}&consumer_key=${encodeURIComponent(consumerKey)}&consumer_secret=${encodeURIComponent(consumerSecret)}`;
                res = await makeRequest(urlWithQuery, false, 45000);
              }
              
              if (!res.ok) {
                console.warn(`⚠️ Page ${page} failed: ${res.status}`);
                return [];
              }
              
              const pageData = await parseJson(res) as WooProduct[];
              console.log(`✓ Page ${page}/${totalPages}: ${pageData.length} products`);
              return pageData;
            } catch (err) {
              console.error(`❌ Page ${page} error:`, err);
              return [];
            }
          })();
          
          pagePromises.push(pagePromise);
        }
        
        console.log(`🚀 Fetching ${totalPages - 1} pages in PARALLEL...`);
        const pagesData = await Promise.all(pagePromises);
        pagesData.forEach(pageData => allProducts.push(...pageData));
      }

      console.log(`✅ Fetched ${allProducts.length} products`);

      // 🔥 STEP 3: Fetch variations for variable products IN PARALLEL
      const variableProducts = allProducts.filter(p => p.type === 'variable');
      if (variableProducts.length > 0) {
        console.log(`🔄 Fetching variations for ${variableProducts.length} variable products...`);
        
        const variationPromises = variableProducts.map(async (product) => {
          try {
            const varUrl = `${apiBase}/products/${product.id}/variations?per_page=100`;
            let res = await makeRequest(varUrl, true, 30000);
            
            if (!res.ok && (res.status === 401 || res.status === 403)) {
              const urlWithQuery = `${varUrl}&consumer_key=${encodeURIComponent(consumerKey)}&consumer_secret=${encodeURIComponent(consumerSecret)}`;
              res = await makeRequest(urlWithQuery, false, 30000);
            }
            
            if (!res.ok) {
              console.warn(`⚠️ Variations for product ${product.id} failed: ${res.status}`);
              return { productId: product.id, variations: [] };
            }
            
            const variations = await parseJson(res) as WooVariation[];
            return { productId: product.id, variations };
          } catch (err) {
            console.error(`❌ Variations for product ${product.id} error:`, err);
            return { productId: product.id, variations: [] };
          }
        });
        
        const variationsData = await Promise.all(variationPromises);
        
        // Add variations as additional products
        let variationsCount = 0;
        variationsData.forEach(({ productId, variations }) => {
          const parentProduct = allProducts.find(p => p.id === productId);
          if (!parentProduct) return;
          
          variations.forEach((variation) => {
            const variantProduct: WooProduct = {
              ...parentProduct,
              id: variation.id,
              sku: variation.sku || `${parentProduct.sku}-var-${variation.id}`,
              price: variation.price || parentProduct.price,
              regular_price: variation.regular_price || parentProduct.regular_price,
              sale_price: variation.sale_price || parentProduct.sale_price,
              stock_quantity: variation.stock_quantity,
              stock_status: variation.stock_status,
              name: `${parentProduct.name} - ${variation.attributes.map(a => a.option).join(', ')}`,
              type: 'variation',
              images: variation.image ? [variation.image] : parentProduct.images
            };
            allProducts.push(variantProduct);
            variationsCount++;
          });
        });
        
        console.log(`✅ Added ${variationsCount} variations (total: ${allProducts.length} products)`);
      }

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

      // 🗑️ STEP 4: Deactivate deleted products
      console.log('🔍 Checking for deleted products...');
      const wooProductIds = new Set(allProducts.map(p => String(p.id)));
      const mappedProductIds = Array.from(mappingMap.keys());
      
      const existingProductIds = Array.from(mappingMap.values());
      const { data: existingProducts } = await supabaseClient
        .from('products')
        .select('id, price, compare_at_price, stock, is_active, images, sku, tags')
        .in('id', existingProductIds);
      
      const existingProductsMap = new Map(
        existingProducts?.map(p => [p.id, p]) || []
      );
      
      for (const mappedWooId of mappedProductIds) {
        if (!wooProductIds.has(mappedWooId)) {
          const lovableProductId = mappingMap.get(mappedWooId);
          console.log(`⚠️ Product ${mappedWooId} deleted in WooCommerce`);
          
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
        console.log(`✅ Deactivated ${productsDeactivated} products`);
      }

      // 🔄 STEP 5: Process products (create/update)
      console.log('🔄 Processing products...');
      
      for (const wooProduct of allProducts) {
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

          // Prepare product data with ALL fields
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
            is_active: wooProduct.status === 'publish' && wooProduct.stock_status !== 'outofstock',
            sku: wooProduct.sku || null,
            tags: wooProduct.tags?.map(tag => tag.name) || [],
            reward_percentage: 1.00,
            updated_at: new Date().toISOString()
          };

          // Check if product exists
          const wooProductId = String(wooProduct.id);
          const existingProductId = mappingMap.get(wooProductId);

          if (existingProductId) {
            // 🔍 SMART UPDATE: Only update changed fields
            const currentProduct = existingProductsMap.get(existingProductId);
            
            if (!currentProduct) {
              productsFailed++;
              continue;
            }

            const updateData: any = {};
            let hasChanges = false;

            if (currentProduct.price !== price) {
              updateData.price = price;
              hasChanges = true;
            }

            if (currentProduct.compare_at_price !== compareAtPrice) {
              updateData.compare_at_price = compareAtPrice;
              hasChanges = true;
            }

            const newStock = wooProduct.stock_quantity || 0;
            if (currentProduct.stock !== newStock) {
              updateData.stock = newStock;
              hasChanges = true;
            }

            const newIsActive = wooProduct.status === 'publish' && wooProduct.stock_status !== 'outofstock';
            if (currentProduct.is_active !== newIsActive) {
              updateData.is_active = newIsActive;
              hasChanges = true;
            }

            const newImages = wooProduct.images?.map(img => img.src) || [];
            if (JSON.stringify(currentProduct.images) !== JSON.stringify(newImages)) {
              updateData.images = newImages;
              hasChanges = true;
            }

            const newSku = wooProduct.sku || null;
            if (currentProduct.sku !== newSku) {
              updateData.sku = newSku;
              hasChanges = true;
            }

            const newTags = wooProduct.tags?.map(tag => tag.name) || [];
            if (JSON.stringify(currentProduct.tags) !== JSON.stringify(newTags)) {
              updateData.tags = newTags;
              hasChanges = true;
            }

            if (!hasChanges) {
              productsSkipped++;
              continue;
            }

            updateData.updated_at = new Date().toISOString();

            const { error: updateError } = await supabaseClient
              .from('products')
              .update(updateData)
              .eq('id', existingProductId);

            if (updateError) {
              console.error(`Error updating product ${wooProduct.name}:`, updateError);
              productsFailed++;
            } else {
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
              console.log(`✨ Created: ${wooProduct.name}`);
              
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

      // Update sync log
      await supabaseClient
        .from('woocommerce_sync_logs')
        .update({
          status: 'success',
          completed_at: new Date().toISOString(),
          products_synced: productsSynced,
          products_created: productsCreated,
          products_updated: productsUpdated,
          products_failed: productsFailed,
          products_skipped: productsSkipped,
          products_deleted: productsDeactivated
        })
        .eq('id', syncLog.id);

      console.log(`✅ SYNC COMPLETE:`);
      console.log(`   📊 Total: ${productsSynced} products`);
      console.log(`   ✨ Created: ${productsCreated}`);
      console.log(`   🔄 Updated: ${productsUpdated}`);
      console.log(`   ⚡ Skipped: ${productsSkipped}`);
      console.log(`   🗑️ Deactivated: ${productsDeactivated}`);
      console.log(`   ❌ Failed: ${productsFailed}`);
      console.log(`   💰 Saved: ${(productsUpdated * 4) + productsSkipped} operations`);

      // Auto-translate NEW products only
      if (productsCreated > 0) {
        console.log(`🔄 Auto-translating ${productsCreated} new products...`);
        try {
          const translateResponse = await supabaseClient.functions.invoke('batch-translate-products');
          if (translateResponse.error) {
            console.error('⚠️ Translation error:', translateResponse.error);
          } else {
            console.log(`✅ Translation completed`);
          }
        } catch (translateError) {
          console.error('⚠️ Translation failed (non-critical):', translateError);
        }
      }

      return new Response(
        JSON.stringify({
          success: true,
          syncLogId: syncLog.id,
          stats: {
            synced: productsSynced,
            created: productsCreated,
            updated: productsUpdated,
            skipped: productsSkipped,
            deactivated: productsDeactivated,
            failed: productsFailed
          }
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
          products_skipped: productsSkipped,
          products_deleted: productsDeactivated,
          error_message: error instanceof Error ? error.message : String(error)
        })
        .eq('id', syncLog.id);

      throw error;
    }
  } catch (error) {
    console.error('Sync error:', error);
    return new Response(
      JSON.stringify({
        error: error instanceof Error ? error.message : 'Unknown error'
      }),
      { 
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500 
      }
    );
  }
});