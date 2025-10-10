-- Crear tabla para items del roadmap del e-commerce
CREATE TABLE IF NOT EXISTS public.ecommerce_roadmap_items (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  phase_number INTEGER NOT NULL, -- 1-5
  phase_name TEXT NOT NULL,
  sprint_number TEXT NOT NULL, -- ej: "1.1", "1.2"
  sprint_name TEXT NOT NULL,
  item_number TEXT NOT NULL, -- ej: "1.1.1", "1.1.2"
  feature_name TEXT NOT NULL,
  description TEXT,
  files_affected TEXT[],
  priority TEXT NOT NULL DEFAULT 'medium', -- critical, high, medium, low
  impact TEXT NOT NULL DEFAULT 'medium', -- very_high, high, medium, low
  effort TEXT NOT NULL DEFAULT 'medium', -- high, medium, low
  status TEXT NOT NULL DEFAULT 'todo', -- todo, in_progress, done, blocked
  assigned_to UUID, -- user_id
  completed_by UUID, -- user_id
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  blocked_reason TEXT,
  notes TEXT,
  acceptance_criteria JSONB DEFAULT '[]'::jsonb,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Índices para optimizar consultas
CREATE INDEX IF NOT EXISTS idx_roadmap_phase ON public.ecommerce_roadmap_items(phase_number);
CREATE INDEX IF NOT EXISTS idx_roadmap_sprint ON public.ecommerce_roadmap_items(sprint_number);
CREATE INDEX IF NOT EXISTS idx_roadmap_status ON public.ecommerce_roadmap_items(status);
CREATE INDEX IF NOT EXISTS idx_roadmap_assigned ON public.ecommerce_roadmap_items(assigned_to);

-- Trigger para actualizar updated_at
CREATE OR REPLACE FUNCTION update_roadmap_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_roadmap_updated_at
  BEFORE UPDATE ON public.ecommerce_roadmap_items
  FOR EACH ROW
  EXECUTE FUNCTION update_roadmap_updated_at();

-- Enable Row Level Security
ALTER TABLE public.ecommerce_roadmap_items ENABLE ROW LEVEL SECURITY;

-- Políticas RLS: Solo admins pueden gestionar
CREATE POLICY "Admins can manage roadmap"
  ON public.ecommerce_roadmap_items
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Cualquiera puede ver (para equipo)
CREATE POLICY "Anyone can view roadmap"
  ON public.ecommerce_roadmap_items
  FOR SELECT
  USING (true);

-- Habilitar Realtime
ALTER PUBLICATION supabase_realtime ADD TABLE public.ecommerce_roadmap_items;

-- Función para calcular progreso global
CREATE OR REPLACE FUNCTION get_roadmap_progress()
RETURNS TABLE(
  total_items INTEGER,
  completed_items INTEGER,
  in_progress_items INTEGER,
  blocked_items INTEGER,
  progress_percentage NUMERIC
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    COUNT(*)::INTEGER as total_items,
    COUNT(*) FILTER (WHERE status = 'done')::INTEGER as completed_items,
    COUNT(*) FILTER (WHERE status = 'in_progress')::INTEGER as in_progress_items,
    COUNT(*) FILTER (WHERE status = 'blocked')::INTEGER as blocked_items,
    ROUND((COUNT(*) FILTER (WHERE status = 'done')::NUMERIC / NULLIF(COUNT(*), 0)) * 100, 2) as progress_percentage
  FROM public.ecommerce_roadmap_items;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;