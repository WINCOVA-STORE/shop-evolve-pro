-- Enable pg_net extension for HTTP requests from database
CREATE EXTENSION IF NOT EXISTS pg_net;

-- Function to auto-translate products when inserted or updated
CREATE OR REPLACE FUNCTION public.auto_translate_product()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  supabase_anon_key text;
  function_url text;
BEGIN
  -- Only translate if name or description changed (or new record)
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (OLD.name IS DISTINCT FROM NEW.name OR OLD.description IS DISTINCT FROM NEW.description)) THEN
    
    -- Get Supabase URL from environment
    supabase_url := current_setting('app.settings.supabase_url', true);
    supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    -- Fallback to default if not set
    IF supabase_url IS NULL THEN
      supabase_url := 'https://pduhecmerwvmgbdtathh.supabase.co';
    END IF;
    
    function_url := supabase_url || '/functions/v1/auto-translate-content';
    
    -- Make async HTTP request to translation function
    -- This won't block the INSERT/UPDATE operation
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'table_name', 'products',
        'record_id', NEW.id,
        'source_text_name', NEW.name,
        'source_text_description', COALESCE(NEW.description, '')
      )
    );
    
    RAISE NOTICE 'Auto-translation triggered for product: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Create trigger on products table
DROP TRIGGER IF EXISTS trigger_auto_translate_product ON public.products;
CREATE TRIGGER trigger_auto_translate_product
  AFTER INSERT OR UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_translate_product();

-- Also create trigger for categories (if they have name field)
CREATE OR REPLACE FUNCTION public.auto_translate_category()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  supabase_url text;
  supabase_anon_key text;
  function_url text;
BEGIN
  IF (TG_OP = 'INSERT') OR 
     (TG_OP = 'UPDATE' AND (OLD.name IS DISTINCT FROM NEW.name OR OLD.description IS DISTINCT FROM NEW.description)) THEN
    
    supabase_url := current_setting('app.settings.supabase_url', true);
    supabase_anon_key := current_setting('app.settings.supabase_anon_key', true);
    
    IF supabase_url IS NULL THEN
      supabase_url := 'https://pduhecmerwvmgbdtathh.supabase.co';
    END IF;
    
    function_url := supabase_url || '/functions/v1/auto-translate-content';
    
    PERFORM net.http_post(
      url := function_url,
      headers := jsonb_build_object(
        'Content-Type', 'application/json',
        'Authorization', 'Bearer ' || supabase_anon_key
      ),
      body := jsonb_build_object(
        'table_name', 'categories',
        'record_id', NEW.id,
        'source_text_name', NEW.name,
        'source_text_description', COALESCE(NEW.description, '')
      )
    );
    
    RAISE NOTICE 'Auto-translation triggered for category: %', NEW.id;
  END IF;
  
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS trigger_auto_translate_category ON public.categories;
CREATE TRIGGER trigger_auto_translate_category
  AFTER INSERT OR UPDATE ON public.categories
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_translate_category();

-- Add translation columns to categories if they don't exist
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'name_es') THEN
    ALTER TABLE public.categories ADD COLUMN name_es text;
    ALTER TABLE public.categories ADD COLUMN name_fr text;
    ALTER TABLE public.categories ADD COLUMN name_pt text;
    ALTER TABLE public.categories ADD COLUMN name_zh text;
  END IF;
  
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'categories' AND column_name = 'description_es') THEN
    ALTER TABLE public.categories ADD COLUMN description_es text;
    ALTER TABLE public.categories ADD COLUMN description_fr text;
    ALTER TABLE public.categories ADD COLUMN description_pt text;
    ALTER TABLE public.categories ADD COLUMN description_zh text;
  END IF;
END $$;