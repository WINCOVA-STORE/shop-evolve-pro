-- Add unique constraint to woocommerce_variation_id for efficient upserts
-- This allows batch syncing of variations without conflicts

-- First, remove any duplicate woocommerce_variation_id if they exist
DELETE FROM public.product_variations a
USING public.product_variations b
WHERE a.id < b.id 
AND a.woocommerce_variation_id IS NOT NULL
AND a.woocommerce_variation_id = b.woocommerce_variation_id;

-- Create unique index on woocommerce_variation_id
CREATE UNIQUE INDEX IF NOT EXISTS product_variations_woo_id_unique 
ON public.product_variations(woocommerce_variation_id) 
WHERE woocommerce_variation_id IS NOT NULL;

-- Add comment
COMMENT ON INDEX public.product_variations_woo_id_unique IS 'Ensures unique WooCommerce variation IDs for efficient batch syncing';