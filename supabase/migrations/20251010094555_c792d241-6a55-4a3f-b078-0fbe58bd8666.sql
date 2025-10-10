-- Secure function + trigger for updated_at on roadmap items
CREATE OR REPLACE FUNCTION public.update_roadmap_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

-- Attach trigger to keep updated_at fresh on updates
DROP TRIGGER IF EXISTS trg_ecommerce_roadmap_items_updated_at ON public.ecommerce_roadmap_items;
CREATE TRIGGER trg_ecommerce_roadmap_items_updated_at
BEFORE UPDATE ON public.ecommerce_roadmap_items
FOR EACH ROW
EXECUTE FUNCTION public.update_roadmap_updated_at();