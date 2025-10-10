-- Add customer-facing fields to ecommerce_roadmap_items
ALTER TABLE public.ecommerce_roadmap_items 
ADD COLUMN IF NOT EXISTS customer_facing_title TEXT,
ADD COLUMN IF NOT EXISTS customer_facing_description TEXT,
ADD COLUMN IF NOT EXISTS notify_customers BOOLEAN DEFAULT false;

-- Add index for faster queries of customer-notifiable items
CREATE INDEX IF NOT EXISTS idx_roadmap_notify_customers 
ON public.ecommerce_roadmap_items(notify_customers, completed_at) 
WHERE notify_customers = true AND status = 'done';

-- Add comment for documentation
COMMENT ON COLUMN public.ecommerce_roadmap_items.customer_facing_title IS 'Título orientado al consumidor final de la tienda';
COMMENT ON COLUMN public.ecommerce_roadmap_items.customer_facing_description IS 'Descripción de beneficios para el consumidor final';
COMMENT ON COLUMN public.ecommerce_roadmap_items.notify_customers IS 'Si true, se notificará a los consumidores cuando se complete';