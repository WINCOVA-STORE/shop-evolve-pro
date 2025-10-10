-- Tabla para tracking automático del estado de fuentes de mercado
CREATE TABLE IF NOT EXISTS public.wincova_market_sources_health (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  source_key TEXT NOT NULL, -- 'performance', 'seo', 'conversion', 'development'
  source_name TEXT NOT NULL,
  source_url TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending', -- 'active', 'warning', 'error', 'pending'
  last_check_at TIMESTAMP WITH TIME ZONE,
  last_success_at TIMESTAMP WITH TIME ZONE,
  last_error TEXT,
  response_time_ms INTEGER,
  http_status_code INTEGER,
  consecutive_failures INTEGER DEFAULT 0,
  metadata JSONB,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(source_key, source_url)
);

-- Índices para performance
CREATE INDEX IF NOT EXISTS idx_market_sources_health_status ON public.wincova_market_sources_health(status);
CREATE INDEX IF NOT EXISTS idx_market_sources_health_last_check ON public.wincova_market_sources_health(last_check_at DESC);

-- Trigger para updated_at
CREATE OR REPLACE FUNCTION update_market_sources_health_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_market_sources_health_updated_at
  BEFORE UPDATE ON public.wincova_market_sources_health
  FOR EACH ROW
  EXECUTE FUNCTION update_market_sources_health_updated_at();

-- RLS Policies (solo admins pueden ver el estado de las fuentes)
ALTER TABLE public.wincova_market_sources_health ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can view all source health data"
  ON public.wincova_market_sources_health
  FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM auth.users
      WHERE auth.uid() = id
      AND raw_user_meta_data->>'role' = 'admin'
    )
  );

CREATE POLICY "System can insert and update source health"
  ON public.wincova_market_sources_health
  FOR ALL
  USING (true)
  WITH CHECK (true);

-- Insertar fuentes iniciales para tracking
INSERT INTO public.wincova_market_sources_health (source_key, source_name, source_url, status)
VALUES 
  ('performance', 'Google Web Performance Studies', 'https://web.dev/performance', 'pending'),
  ('seo', 'Industry SEO Analysis', 'https://backlinko.com/search-engine-ranking', 'pending'),
  ('conversion', 'Baymard Institute eCommerce Research', 'https://baymard.com/lists/cart-abandonment-rate', 'pending')
ON CONFLICT (source_key, source_url) DO NOTHING;