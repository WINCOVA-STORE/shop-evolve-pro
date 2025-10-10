-- Tabla para almacenar código generado por Wincova
CREATE TABLE IF NOT EXISTS public.wincova_code_deployments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  roadmap_item_id UUID NOT NULL REFERENCES public.ecommerce_roadmap_items(id) ON DELETE CASCADE,
  generated_code JSONB NOT NULL, -- { files: [{path, content}], instructions: [] }
  deployment_mode TEXT NOT NULL DEFAULT 'manual', -- 'manual' o 'automatic'
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'reviewing', 'applied', 'failed', 'rejected'
  applied_at TIMESTAMP WITH TIME ZONE,
  applied_by UUID REFERENCES auth.users(id),
  github_commit_sha TEXT,
  github_pr_url TEXT,
  error_message TEXT,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Índices para mejor performance
CREATE INDEX idx_wincova_deployments_roadmap_item ON public.wincova_code_deployments(roadmap_item_id);
CREATE INDEX idx_wincova_deployments_status ON public.wincova_code_deployments(status);
CREATE INDEX idx_wincova_deployments_created ON public.wincova_code_deployments(created_at DESC);

-- RLS Policies
ALTER TABLE public.wincova_code_deployments ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins can manage deployments"
  ON public.wincova_code_deployments
  FOR ALL
  USING (has_role(auth.uid(), 'admin'));

CREATE POLICY "System can create deployments"
  ON public.wincova_code_deployments
  FOR INSERT
  WITH CHECK (true);

-- Agregar columna de modo de ejecución a roadmap items
ALTER TABLE public.ecommerce_roadmap_items
ADD COLUMN IF NOT EXISTS execution_mode TEXT DEFAULT 'manual'; -- 'manual' o 'automatic'

-- Trigger para actualizar updated_at
CREATE TRIGGER update_wincova_deployments_updated_at
  BEFORE UPDATE ON public.wincova_code_deployments
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();