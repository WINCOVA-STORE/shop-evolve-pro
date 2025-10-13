-- Add products_skipped column to track products with no changes
ALTER TABLE public.woocommerce_sync_logs 
ADD COLUMN IF NOT EXISTS products_skipped INTEGER DEFAULT 0;