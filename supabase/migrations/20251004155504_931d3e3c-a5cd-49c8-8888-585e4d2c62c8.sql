-- Add tracking fields to orders table
ALTER TABLE public.orders 
ADD COLUMN IF NOT EXISTS tracking_number TEXT,
ADD COLUMN IF NOT EXISTS carrier TEXT,
ADD COLUMN IF NOT EXISTS estimated_delivery_date DATE;

-- Add comment for clarity
COMMENT ON COLUMN public.orders.tracking_number IS 'Tracking number provided by shipping carrier (USPS, UPS, FedEx, etc.)';
COMMENT ON COLUMN public.orders.carrier IS 'Shipping carrier name (USPS, UPS, FedEx, DHL, etc.)';
COMMENT ON COLUMN public.orders.estimated_delivery_date IS 'Estimated delivery date provided by carrier';

-- Create index for faster tracking number lookups
CREATE INDEX IF NOT EXISTS idx_orders_tracking_number ON public.orders(tracking_number) WHERE tracking_number IS NOT NULL;