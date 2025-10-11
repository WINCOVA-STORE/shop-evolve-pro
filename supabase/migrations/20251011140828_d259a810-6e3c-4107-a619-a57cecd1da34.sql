-- 1. Tabla de analytics de traducciones
CREATE TABLE IF NOT EXISTS public.translation_analytics (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  language TEXT NOT NULL,
  products_translated INTEGER NOT NULL DEFAULT 0,
  ai_calls_used INTEGER NOT NULL DEFAULT 0,
  cost_saved_usd NUMERIC NOT NULL DEFAULT 0,
  total_cost_usd NUMERIC NOT NULL DEFAULT 0,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index para consultas rápidas por fecha y lenguaje
CREATE INDEX IF NOT EXISTS idx_translation_analytics_date ON public.translation_analytics(date);
CREATE INDEX IF NOT EXISTS idx_translation_analytics_language ON public.translation_analytics(language);

-- 2. Tabla de configuración white-label
CREATE TABLE IF NOT EXISTS public.translation_branding (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL DEFAULT 'wincova_main',
  product_name TEXT NOT NULL DEFAULT 'Wincova Translate',
  product_logo_url TEXT,
  primary_color TEXT DEFAULT '#2563eb',
  show_powered_by BOOLEAN NOT NULL DEFAULT true,
  custom_domain TEXT,
  api_enabled BOOLEAN NOT NULL DEFAULT false,
  monthly_api_quota INTEGER DEFAULT 10000,
  current_api_usage INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(store_id)
);

-- Insert default config
INSERT INTO public.translation_branding (store_id, product_name)
VALUES ('wincova_main', 'Wincova Translate')
ON CONFLICT (store_id) DO NOTHING;

-- 3. Tabla de API keys para integraciones externas
CREATE TABLE IF NOT EXISTS public.translation_api_keys (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL DEFAULT 'wincova_main',
  api_key TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  is_active BOOLEAN NOT NULL DEFAULT true,
  rate_limit_per_minute INTEGER DEFAULT 60,
  allowed_domains TEXT[] DEFAULT '{}',
  metadata JSONB DEFAULT '{}',
  last_used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  expires_at TIMESTAMPTZ
);

CREATE INDEX IF NOT EXISTS idx_translation_api_keys_key ON public.translation_api_keys(api_key);
CREATE INDEX IF NOT EXISTS idx_translation_api_keys_store ON public.translation_api_keys(store_id);

-- 4. Tabla de logs de uso de API
CREATE TABLE IF NOT EXISTS public.translation_api_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  api_key_id UUID REFERENCES public.translation_api_keys(id) ON DELETE CASCADE,
  endpoint TEXT NOT NULL,
  products_count INTEGER NOT NULL DEFAULT 0,
  languages_count INTEGER NOT NULL DEFAULT 0,
  ai_calls_used INTEGER NOT NULL DEFAULT 0,
  response_time_ms INTEGER,
  success BOOLEAN NOT NULL DEFAULT true,
  error_message TEXT,
  ip_address TEXT,
  user_agent TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_translation_api_logs_key ON public.translation_api_logs(api_key_id);
CREATE INDEX IF NOT EXISTS idx_translation_api_logs_date ON public.translation_api_logs(created_at);

-- RLS Policies

-- translation_analytics: Solo admins
ALTER TABLE public.translation_analytics ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage translation analytics"
ON public.translation_analytics
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- translation_branding: Admins pueden modificar, todos pueden ver
ALTER TABLE public.translation_branding ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage branding"
ON public.translation_branding
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "Anyone can view branding"
ON public.translation_branding
FOR SELECT
TO authenticated
USING (true);

-- translation_api_keys: Solo admins
ALTER TABLE public.translation_api_keys ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage API keys"
ON public.translation_api_keys
FOR ALL
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- translation_api_logs: Solo admins pueden ver logs
ALTER TABLE public.translation_api_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view API logs"
ON public.translation_api_logs
FOR SELECT
TO authenticated
USING (has_role(auth.uid(), 'admin'));

-- Trigger para actualizar updated_at en branding
CREATE OR REPLACE FUNCTION update_translation_branding_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_translation_branding_timestamp
BEFORE UPDATE ON public.translation_branding
FOR EACH ROW
EXECUTE FUNCTION update_translation_branding_updated_at();