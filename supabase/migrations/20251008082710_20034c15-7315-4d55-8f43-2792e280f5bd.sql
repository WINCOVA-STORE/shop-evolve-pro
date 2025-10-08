-- Corregir search_path de función validate_shipping_config
CREATE OR REPLACE FUNCTION public.validate_shipping_config()
RETURNS TRIGGER 
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
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
$$;