-- Create table for WooCommerce sync logs
CREATE TABLE IF NOT EXISTS public.woocommerce_sync_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  started_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  completed_at TIMESTAMP WITH TIME ZONE,
  status TEXT NOT NULL DEFAULT 'running',
  products_synced INTEGER DEFAULT 0,
  products_created INTEGER DEFAULT 0,
  products_updated INTEGER DEFAULT 0,
  products_failed INTEGER DEFAULT 0,
  error_message TEXT,
  sync_type TEXT NOT NULL DEFAULT 'manual',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create table for WooCommerce product mapping
CREATE TABLE IF NOT EXISTS public.woocommerce_product_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lovable_product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  woocommerce_product_id TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(woocommerce_product_id)
);

-- Create table for WooCommerce category mapping
CREATE TABLE IF NOT EXISTS public.woocommerce_category_mapping (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  lovable_category_id UUID NOT NULL REFERENCES public.categories(id) ON DELETE CASCADE,
  woocommerce_category_id TEXT NOT NULL,
  woocommerce_category_name TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(woocommerce_category_id)
);

-- Enable RLS
ALTER TABLE public.woocommerce_sync_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.woocommerce_product_mapping ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.woocommerce_category_mapping ENABLE ROW LEVEL SECURITY;

-- RLS Policies for sync logs (admins only)
CREATE POLICY "Admins can view sync logs" 
ON public.woocommerce_sync_logs 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage sync logs" 
ON public.woocommerce_sync_logs 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for product mapping (admins only)
CREATE POLICY "Admins can view product mapping" 
ON public.woocommerce_product_mapping 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage product mapping" 
ON public.woocommerce_product_mapping 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- RLS Policies for category mapping (admins only)
CREATE POLICY "Admins can view category mapping" 
ON public.woocommerce_category_mapping 
FOR SELECT 
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage category mapping" 
ON public.woocommerce_category_mapping 
FOR ALL 
USING (has_role(auth.uid(), 'admin'::app_role));

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS idx_woo_product_mapping_lovable ON public.woocommerce_product_mapping(lovable_product_id);
CREATE INDEX IF NOT EXISTS idx_woo_product_mapping_woo ON public.woocommerce_product_mapping(woocommerce_product_id);
CREATE INDEX IF NOT EXISTS idx_woo_category_mapping_lovable ON public.woocommerce_category_mapping(lovable_category_id);
CREATE INDEX IF NOT EXISTS idx_woo_category_mapping_woo ON public.woocommerce_category_mapping(woocommerce_category_id);
CREATE INDEX IF NOT EXISTS idx_sync_logs_status ON public.woocommerce_sync_logs(status);
CREATE INDEX IF NOT EXISTS idx_sync_logs_created ON public.woocommerce_sync_logs(created_at DESC);