-- Wincova 360° Safe Deploy - Database Schema

-- 1. Tabla de diagnósticos de sitios web
CREATE TABLE public.wincova_diagnoses (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Cliente info
  user_id UUID REFERENCES auth.users(id),
  client_name TEXT NOT NULL,
  site_url TEXT NOT NULL,
  platform TEXT, -- 'wordpress', 'shopify', 'custom', etc.
  
  -- Diagnosis data
  diagnosis_data JSONB NOT NULL DEFAULT '{}',
  
  -- Scores (0-100)
  performance_score NUMERIC,
  seo_score NUMERIC,
  security_score NUMERIC,
  accessibility_score NUMERIC,
  compliance_score NUMERIC,
  overall_score NUMERIC,
  
  -- Competitive intelligence
  competitors_data JSONB DEFAULT '[]',
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'analyzing', 'completed', 'failed'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 2. Tabla de cambios propuestos/aplicados
CREATE TABLE public.wincova_changes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  diagnosis_id UUID NOT NULL REFERENCES public.wincova_diagnoses(id) ON DELETE CASCADE,
  
  -- Change details
  category TEXT NOT NULL, -- 'performance', 'seo', 'security', 'accessibility', 'design'
  title TEXT NOT NULL,
  description TEXT,
  technical_details TEXT,
  
  -- AI Guardian scores
  safety_score NUMERIC NOT NULL, -- 0-100 (100 = muy seguro)
  impact_score NUMERIC NOT NULL, -- 0-100 (100 = alto impacto)
  complexity_score NUMERIC NOT NULL, -- 0-100 (100 = muy complejo)
  confidence_score NUMERIC NOT NULL, -- 0-100 (confianza de la IA)
  
  -- Risk classification
  risk_level TEXT NOT NULL DEFAULT 'low', -- 'low', 'medium', 'high', 'critical'
  
  -- Approval workflow
  approval_required BOOLEAN NOT NULL DEFAULT true,
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  approval_notes TEXT,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'proposed', -- 'proposed', 'approved', 'rejected', 'applied', 'failed', 'rolled_back'
  
  -- Predictive impact
  estimated_performance_gain NUMERIC, -- Porcentaje estimado de mejora
  estimated_seo_gain NUMERIC,
  estimated_conversion_gain NUMERIC,
  estimated_revenue_impact NUMERIC, -- Impacto en dólares/mes
  
  -- Code/implementation
  code_changes JSONB DEFAULT '[]',
  implementation_method TEXT, -- 'api', 'plugin', 'manual', 'ftp'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 3. Tabla de despliegues
CREATE TABLE public.wincova_deployments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  diagnosis_id UUID NOT NULL REFERENCES public.wincova_diagnoses(id) ON DELETE CASCADE,
  
  -- Deployment info
  changes_deployed JSONB NOT NULL DEFAULT '[]', -- Array de change_ids
  deployment_method TEXT NOT NULL, -- 'sandbox', 'staged', 'full'
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'deploying', 'testing', 'live', 'rolled_back', 'failed'
  
  -- Rollback info
  rollback_enabled BOOLEAN NOT NULL DEFAULT true,
  rollback_at TIMESTAMP WITH TIME ZONE,
  rollback_reason TEXT,
  
  -- Monitoring
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  -- Pre/post metrics
  metrics_before JSONB DEFAULT '{}',
  metrics_after JSONB DEFAULT '{}',
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 4. Tabla de pruebas A/B (Smart A/B Testing)
CREATE TABLE public.wincova_ab_tests (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  deployment_id UUID NOT NULL REFERENCES public.wincova_deployments(id) ON DELETE CASCADE,
  
  -- Test configuration
  test_name TEXT NOT NULL,
  traffic_percentage NUMERIC NOT NULL DEFAULT 10, -- % de tráfico para prueba
  duration_hours INTEGER NOT NULL DEFAULT 48,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'running', 'completed', 'stopped'
  
  -- Results
  started_at TIMESTAMP WITH TIME ZONE,
  completed_at TIMESTAMP WITH TIME ZONE,
  
  control_metrics JSONB DEFAULT '{}', -- Métricas del grupo de control
  variant_metrics JSONB DEFAULT '{}', -- Métricas del grupo de prueba
  
  statistical_significance NUMERIC, -- 0-100
  winner TEXT, -- 'control', 'variant', 'inconclusive'
  
  -- Decision
  auto_deploy_on_success BOOLEAN NOT NULL DEFAULT true,
  deployed BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 5. Tabla de auditorías de compliance
CREATE TABLE public.wincova_compliance_checks (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  diagnosis_id UUID NOT NULL REFERENCES public.wincova_diagnoses(id) ON DELETE CASCADE,
  
  -- Compliance areas
  gdpr_compliant BOOLEAN,
  gdpr_issues JSONB DEFAULT '[]',
  
  wcag_compliant BOOLEAN,
  wcag_level TEXT, -- 'A', 'AA', 'AAA'
  wcag_issues JSONB DEFAULT '[]',
  
  ssl_secure BOOLEAN,
  ssl_issues JSONB DEFAULT '[]',
  
  core_web_vitals_pass BOOLEAN,
  core_web_vitals_metrics JSONB DEFAULT '{}',
  
  -- Overall
  compliance_score NUMERIC, -- 0-100
  critical_issues_count INTEGER DEFAULT 0,
  
  -- Status
  status TEXT NOT NULL DEFAULT 'pending', -- 'pending', 'checking', 'completed', 'failed'
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 6. Tabla de inteligencia colectiva (Intelligence Network)
CREATE TABLE public.wincova_intelligence_data (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  -- Anonymized data
  industry TEXT, -- 'ecommerce', 'saas', 'blog', etc.
  platform TEXT,
  
  -- Change info (anonymized)
  change_category TEXT NOT NULL,
  change_type TEXT NOT NULL,
  
  -- Results
  success BOOLEAN NOT NULL,
  performance_improvement NUMERIC,
  seo_improvement NUMERIC,
  conversion_improvement NUMERIC,
  revenue_impact NUMERIC,
  
  -- Context
  site_size TEXT, -- 'small', 'medium', 'large'
  initial_score NUMERIC,
  
  -- Metadata
  metadata JSONB DEFAULT '{}'
);

-- 7. Tabla de cambios log (Change Log Transparente)
CREATE TABLE public.wincova_change_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  
  diagnosis_id UUID NOT NULL REFERENCES public.wincova_diagnoses(id) ON DELETE CASCADE,
  change_id UUID REFERENCES public.wincova_changes(id) ON DELETE CASCADE,
  
  -- Log info
  action TEXT NOT NULL, -- 'proposed', 'approved', 'deployed', 'rolled_back', 'failed'
  performed_by UUID REFERENCES auth.users(id),
  performed_by_name TEXT, -- Puede ser 'AI' o nombre de usuario
  
  -- Details
  details TEXT,
  metadata JSONB DEFAULT '{}'
);

-- Enable RLS
ALTER TABLE public.wincova_diagnoses ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wincova_changes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wincova_deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wincova_ab_tests ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wincova_compliance_checks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wincova_intelligence_data ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wincova_change_logs ENABLE ROW LEVEL SECURITY;

-- RLS Policies

-- wincova_diagnoses
CREATE POLICY "Users can view their own diagnoses"
  ON public.wincova_diagnoses FOR SELECT
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can create their own diagnoses"
  ON public.wincova_diagnoses FOR INSERT
  WITH CHECK (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Users can update their own diagnoses"
  ON public.wincova_diagnoses FOR UPDATE
  USING (auth.uid() = user_id OR has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can manage all diagnoses"
  ON public.wincova_diagnoses FOR ALL
  USING (has_role(auth.uid(), 'admin'));

-- wincova_changes
CREATE POLICY "Users can view changes for their diagnoses"
  ON public.wincova_changes FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wincova_diagnoses
      WHERE id = wincova_changes.diagnosis_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System can create changes"
  ON public.wincova_changes FOR INSERT
  WITH CHECK (true);

CREATE POLICY "Users can approve changes"
  ON public.wincova_changes FOR UPDATE
  USING (
    EXISTS (
      SELECT 1 FROM public.wincova_diagnoses
      WHERE id = wincova_changes.diagnosis_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

-- wincova_deployments
CREATE POLICY "Users can view their deployments"
  ON public.wincova_deployments FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wincova_diagnoses
      WHERE id = wincova_deployments.diagnosis_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System can manage deployments"
  ON public.wincova_deployments FOR ALL
  USING (true);

-- wincova_ab_tests
CREATE POLICY "Users can view their ab tests"
  ON public.wincova_ab_tests FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wincova_deployments d
      JOIN public.wincova_diagnoses diag ON d.diagnosis_id = diag.id
      WHERE d.id = wincova_ab_tests.deployment_id
      AND (diag.user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System can manage ab tests"
  ON public.wincova_ab_tests FOR ALL
  USING (true);

-- wincova_compliance_checks
CREATE POLICY "Users can view their compliance checks"
  ON public.wincova_compliance_checks FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wincova_diagnoses
      WHERE id = wincova_compliance_checks.diagnosis_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System can manage compliance checks"
  ON public.wincova_compliance_checks FOR ALL
  USING (true);

-- wincova_intelligence_data (anonymized, readable by all)
CREATE POLICY "Anyone can view intelligence data"
  ON public.wincova_intelligence_data FOR SELECT
  USING (true);

CREATE POLICY "System can create intelligence data"
  ON public.wincova_intelligence_data FOR INSERT
  WITH CHECK (true);

-- wincova_change_logs
CREATE POLICY "Users can view their change logs"
  ON public.wincova_change_logs FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.wincova_diagnoses
      WHERE id = wincova_change_logs.diagnosis_id
      AND (user_id = auth.uid() OR has_role(auth.uid(), 'admin'))
    )
  );

CREATE POLICY "System can create change logs"
  ON public.wincova_change_logs FOR INSERT
  WITH CHECK (true);

-- Indexes for performance
CREATE INDEX idx_wincova_diagnoses_user_id ON public.wincova_diagnoses(user_id);
CREATE INDEX idx_wincova_diagnoses_status ON public.wincova_diagnoses(status);
CREATE INDEX idx_wincova_changes_diagnosis_id ON public.wincova_changes(diagnosis_id);
CREATE INDEX idx_wincova_changes_status ON public.wincova_changes(status);
CREATE INDEX idx_wincova_deployments_diagnosis_id ON public.wincova_deployments(diagnosis_id);
CREATE INDEX idx_wincova_ab_tests_deployment_id ON public.wincova_ab_tests(deployment_id);
CREATE INDEX idx_wincova_compliance_diagnosis_id ON public.wincova_compliance_checks(diagnosis_id);
CREATE INDEX idx_wincova_intelligence_industry ON public.wincova_intelligence_data(industry);
CREATE INDEX idx_wincova_change_logs_diagnosis_id ON public.wincova_change_logs(diagnosis_id);

-- Triggers for updated_at
CREATE TRIGGER update_wincova_diagnoses_updated_at
  BEFORE UPDATE ON public.wincova_diagnoses
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wincova_changes_updated_at
  BEFORE UPDATE ON public.wincova_changes
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wincova_deployments_updated_at
  BEFORE UPDATE ON public.wincova_deployments
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wincova_ab_tests_updated_at
  BEFORE UPDATE ON public.wincova_ab_tests
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_wincova_compliance_updated_at
  BEFORE UPDATE ON public.wincova_compliance_checks
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();