-- Add products_deleted column to woocommerce_sync_logs if it doesn't exist
ALTER TABLE public.woocommerce_sync_logs 
ADD COLUMN IF NOT EXISTS products_deleted INTEGER DEFAULT 0;