-- ================================================
-- MEJORA: Sistema de Recompensas Multi-Plataforma
-- Agrega flexibilidad para Shopify, WooCommerce, Custom
-- ================================================

-- Agregar campos de configuración para cálculo de puntos
ALTER TABLE public.rewards_config 
ADD COLUMN IF NOT EXISTS include_tax_in_points BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS include_shipping_in_points BOOLEAN NOT NULL DEFAULT false,
ADD COLUMN IF NOT EXISTS calculation_notes TEXT;

-- Actualizar la configuración existente con los valores estándar globales
UPDATE public.rewards_config
SET 
  include_tax_in_points = false,
  include_shipping_in_points = false,
  calculation_notes = 'Estándar global: puntos calculados sobre subtotal de productos (excluye impuestos y envío). Compatible con Shopify, WooCommerce, y todas las plataformas.'
WHERE store_id = 'wincova_main';

-- Función helper para calcular puntos de compra (reutilizable en edge functions)
CREATE OR REPLACE FUNCTION public.calculate_purchase_points(
  p_subtotal NUMERIC,
  p_tax NUMERIC DEFAULT 0,
  p_shipping NUMERIC DEFAULT 0,
  p_store_id TEXT DEFAULT 'wincova_main'
) RETURNS NUMERIC
LANGUAGE plpgsql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_base_amount NUMERIC;
  v_percentage NUMERIC;
  v_points NUMERIC;
BEGIN
  -- Obtener configuración
  SELECT 
    earning_type,
    earning_percentage,
    earning_fixed_amount,
    points_per_dollar,
    include_tax_in_points,
    include_shipping_in_points,
    vip_multiplier,
    seasonal_multiplier
  INTO v_config
  FROM public.rewards_config
  WHERE store_id = p_store_id
  LIMIT 1;
  
  IF v_config IS NULL THEN
    RAISE EXCEPTION 'No se encontró configuración de recompensas para store_id: %', p_store_id;
  END IF;
  
  -- Calcular monto base según configuración
  v_base_amount := p_subtotal;
  
  IF v_config.include_tax_in_points THEN
    v_base_amount := v_base_amount + p_tax;
  END IF;
  
  IF v_config.include_shipping_in_points THEN
    v_base_amount := v_base_amount + p_shipping;
  END IF;
  
  -- Calcular puntos según tipo de ganancia
  IF v_config.earning_type = 'percentage' THEN
    -- Porcentaje del monto
    v_percentage := COALESCE(v_config.earning_percentage, 1.00) / 100;
    v_points := v_base_amount * v_percentage * v_config.points_per_dollar;
  ELSE
    -- Monto fijo por dólar
    v_points := v_base_amount * COALESCE(v_config.earning_fixed_amount, 10);
  END IF;
  
  -- Aplicar multiplicadores
  v_points := v_points * COALESCE(v_config.vip_multiplier, 1.00);
  v_points := v_points * COALESCE(v_config.seasonal_multiplier, 1.00);
  
  -- Redondear al entero más cercano
  RETURN ROUND(v_points);
END;
$$;

COMMENT ON FUNCTION public.calculate_purchase_points IS 
'Calcula puntos de compra según configuración dinámica. 
Compatible con Shopify, WooCommerce y tiendas personalizadas.
Por defecto: calcula sobre subtotal (excluye tax y shipping) - estándar global.';

-- Grant necesario para que edge functions puedan usar la función
GRANT EXECUTE ON FUNCTION public.calculate_purchase_points TO service_role;
GRANT EXECUTE ON FUNCTION public.calculate_purchase_points TO authenticated;