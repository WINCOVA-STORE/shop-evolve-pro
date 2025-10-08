-- =====================================================
-- FASE 1: Módulo Central de Envíos Universal
-- =====================================================

-- 1. Crear ENUM para shipping modes
CREATE TYPE public.shipping_mode AS ENUM ('free', 'manual', 'api', 'dropshipping');

-- 2. Crear tabla shipping_config (configuración global por tienda)
CREATE TABLE public.shipping_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL DEFAULT 'wincova_main', -- Para multi-tenancy futuro
  mode public.shipping_mode NOT NULL DEFAULT 'free',
  manual_global_cost NUMERIC(10, 2),
  manual_rules JSONB DEFAULT '{}'::jsonb, -- Reglas por categoría/proveedor
  show_free_badge BOOLEAN NOT NULL DEFAULT true,
  api_provider TEXT, -- 'easypost', 'shippo', 'ups', 'usps', 'dhl', 'fedex'
  api_credentials JSONB, -- Credenciales cifradas
  dropshipping_includes_shipping BOOLEAN NOT NULL DEFAULT true,
  last_changed_by UUID REFERENCES auth.users(id),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(store_id) -- Una configuración por tienda
);

-- 3. Agregar columna shipping_config_snapshot a orders
ALTER TABLE public.orders 
ADD COLUMN shipping_config_snapshot JSONB;

-- 4. Agregar columna opcional a products para dropshipping
ALTER TABLE public.products 
ADD COLUMN shipping_included_in_price BOOLEAN DEFAULT false;

-- 5. Trigger para validar coherencia de shipping_config
CREATE OR REPLACE FUNCTION public.validate_shipping_config()
RETURNS TRIGGER AS $$
BEGIN
  -- Si mode = 'manual', manual_global_cost no puede ser null
  IF NEW.mode = 'manual' AND NEW.manual_global_cost IS NULL THEN
    RAISE EXCEPTION 'manual_global_cost es requerido cuando mode = manual';
  END IF;
  
  -- Si mode = 'api', api_provider y api_credentials son requeridos
  IF NEW.mode = 'api' AND (NEW.api_provider IS NULL OR NEW.api_credentials IS NULL) THEN
    RAISE EXCEPTION 'api_provider y api_credentials son requeridos cuando mode = api';
  END IF;
  
  -- Actualizar timestamp
  NEW.updated_at = now();
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER validate_shipping_config_trigger
BEFORE INSERT OR UPDATE ON public.shipping_config
FOR EACH ROW
EXECUTE FUNCTION public.validate_shipping_config();

-- 6. Función para obtener configuración de envío activa
CREATE OR REPLACE FUNCTION public.get_active_shipping_config(p_store_id TEXT DEFAULT 'wincova_main')
RETURNS TABLE (
  id UUID,
  mode public.shipping_mode,
  manual_global_cost NUMERIC,
  manual_rules JSONB,
  show_free_badge BOOLEAN,
  api_provider TEXT,
  dropshipping_includes_shipping BOOLEAN
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    sc.id,
    sc.mode,
    sc.manual_global_cost,
    sc.manual_rules,
    sc.show_free_badge,
    sc.api_provider,
    sc.dropshipping_includes_shipping
  FROM public.shipping_config sc
  WHERE sc.store_id = p_store_id
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- 7. Insertar configuración por defecto (onboarding automático)
INSERT INTO public.shipping_config (store_id, mode, show_free_badge, dropshipping_includes_shipping)
VALUES ('wincova_main', 'free', true, true)
ON CONFLICT (store_id) DO NOTHING;

-- 8. Habilitar RLS en shipping_config
ALTER TABLE public.shipping_config ENABLE ROW LEVEL SECURITY;

-- 9. Políticas RLS para shipping_config
CREATE POLICY "Admins can manage shipping config"
ON public.shipping_config
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Anyone can view shipping config"
ON public.shipping_config
FOR SELECT
USING (true);

-- 10. Índices para performance
CREATE INDEX idx_shipping_config_store_id ON public.shipping_config(store_id);
CREATE INDEX idx_products_shipping_included ON public.products(shipping_included_in_price) WHERE shipping_included_in_price = true;