
-- Eliminar el trigger antiguo
DROP TRIGGER IF EXISTS grant_purchase_points_trigger ON orders;

-- Actualizar la función para usar 'completed' en lugar de 'paid'
CREATE OR REPLACE FUNCTION public.grant_purchase_points()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
DECLARE
  points_earned NUMERIC;
BEGIN
  -- Only grant points when payment is completed (cambiado de 'paid' a 'completed')
  IF NEW.payment_status = 'completed' AND (OLD.payment_status IS NULL OR OLD.payment_status != 'completed') THEN
    -- Calculate 1% of total as points
    points_earned := ROUND(NEW.total * 0.01);
    
    INSERT INTO public.rewards (user_id, type, amount, description, order_id)
    VALUES (
      NEW.user_id, 
      'purchase', 
      points_earned, 
      'Puntos por compra #' || NEW.order_number,
      NEW.id
    );
  END IF;
  
  RETURN NEW;
END;
$function$;

-- Recrear el trigger
CREATE TRIGGER grant_purchase_points_trigger
  AFTER INSERT OR UPDATE ON orders
  FOR EACH ROW
  EXECUTE FUNCTION grant_purchase_points();
