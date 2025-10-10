-- Arreglar el warning de seguridad: agregar search_path explícito a la función
DROP FUNCTION IF EXISTS update_market_sources_health_updated_at() CASCADE;

CREATE OR REPLACE FUNCTION public.update_market_sources_health_updated_at()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Recrear el trigger
DROP TRIGGER IF EXISTS trigger_update_market_sources_health_updated_at ON public.wincova_market_sources_health;

CREATE TRIGGER trigger_update_market_sources_health_updated_at
  BEFORE UPDATE ON public.wincova_market_sources_health
  FOR EACH ROW
  EXECUTE FUNCTION public.update_market_sources_health_updated_at();