-- ==========================================
-- ARQUITECTURA DE VARIACIONES DE PRODUCTOS
-- ==========================================

-- 1. Crear tabla de variaciones
CREATE TABLE IF NOT EXISTS public.product_variations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  woocommerce_variation_id TEXT,
  sku TEXT,
  price NUMERIC NOT NULL,
  regular_price NUMERIC,
  sale_price NUMERIC,
  stock INTEGER DEFAULT 0,
  is_active BOOLEAN DEFAULT true,
  images TEXT[] DEFAULT '{}',
  
  -- Atributos de variación (talla, color, etc)
  attributes JSONB DEFAULT '[]'::jsonb,
  
  -- Metadata adicional
  weight TEXT,
  dimensions JSONB,
  
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  
  -- Constraint único para combinación de atributos por producto
  UNIQUE(product_id, attributes)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_product_variations_product_id ON public.product_variations(product_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_sku ON public.product_variations(sku);
CREATE INDEX IF NOT EXISTS idx_product_variations_woo_id ON public.product_variations(woocommerce_variation_id);
CREATE INDEX IF NOT EXISTS idx_product_variations_attributes ON public.product_variations USING gin(attributes);

-- 2. Habilitar RLS
ALTER TABLE public.product_variations ENABLE ROW LEVEL SECURITY;

-- Políticas RLS
CREATE POLICY "Anyone can view active variations"
ON public.product_variations
FOR SELECT
USING (is_active = true);

CREATE POLICY "Admins can manage variations"
ON public.product_variations
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- 3. Trigger para updated_at
CREATE TRIGGER update_product_variations_updated_at
BEFORE UPDATE ON public.product_variations
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- 4. Agregar columna has_variations a products
ALTER TABLE public.products
ADD COLUMN IF NOT EXISTS has_variations BOOLEAN DEFAULT false;

-- 5. Crear índice
CREATE INDEX IF NOT EXISTS idx_products_has_variations ON public.products(has_variations);

-- 6. Función para calcular precio mínimo de variaciones
CREATE OR REPLACE FUNCTION public.get_product_min_price(p_product_id UUID)
RETURNS NUMERIC
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT COALESCE(
    (SELECT MIN(price) FROM public.product_variations 
     WHERE product_id = p_product_id AND is_active = true),
    (SELECT price FROM public.products WHERE id = p_product_id)
  );
$$;

-- 7. Función para calcular rango de precios
CREATE OR REPLACE FUNCTION public.get_product_price_range(p_product_id UUID)
RETURNS TEXT
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT 
    CASE 
      WHEN COUNT(*) = 0 THEN 
        (SELECT price::TEXT FROM public.products WHERE id = p_product_id)
      WHEN MIN(price) = MAX(price) THEN 
        MIN(price)::TEXT
      ELSE 
        MIN(price)::TEXT || ' - ' || MAX(price)::TEXT
    END
  FROM public.product_variations 
  WHERE product_id = p_product_id AND is_active = true;
$$;

-- 8. COMENTARIOS para documentación
COMMENT ON TABLE public.product_variations IS 
'Variaciones de productos (tallas, colores, etc). Optimiza traducciones: 1 traducción por producto padre, no por variación.';

COMMENT ON COLUMN public.product_variations.attributes IS 
'Atributos de la variación en formato JSON: [{"name": "Size", "value": "M"}, {"name": "Color", "value": "Red"}]';