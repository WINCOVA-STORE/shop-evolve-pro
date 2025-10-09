-- =====================================================
-- WINCOVA PROJECT PANEL - VALUE-ADDED FEATURES
-- AI Assistant + Analytics + Webhooks
-- =====================================================

-- 1. WEBHOOKS CONFIGURATION
CREATE TABLE public.webhooks_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  url TEXT NOT NULL,
  events TEXT[] NOT NULL DEFAULT '{}', -- ['task.created', 'task.completed', 'phase.completed', 'risk.detected']
  headers JSONB DEFAULT '{}',
  is_active BOOLEAN NOT NULL DEFAULT true,
  retry_count INT NOT NULL DEFAULT 3,
  timeout_seconds INT NOT NULL DEFAULT 30,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID
);

-- 2. WEBHOOK DELIVERY LOGS
CREATE TABLE public.webhook_deliveries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  webhook_id UUID NOT NULL REFERENCES public.webhooks_config(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  payload JSONB NOT NULL,
  response_status INT,
  response_body TEXT,
  attempt_count INT NOT NULL DEFAULT 1,
  delivered_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. ANALYTICS SNAPSHOTS (para métricas históricas)
CREATE TABLE public.analytics_snapshots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  snapshot_date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_tasks INT NOT NULL DEFAULT 0,
  completed_tasks INT NOT NULL DEFAULT 0,
  blocked_tasks INT NOT NULL DEFAULT 0,
  overdue_tasks INT NOT NULL DEFAULT 0,
  avg_completion_time_hours NUMERIC(10,2),
  velocity_tasks_per_day NUMERIC(10,2),
  team_utilization_pct NUMERIC(5,2),
  risk_score NUMERIC(5,2),
  metrics_json JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, snapshot_date)
);

-- 4. AI ASSISTANT HISTORY
CREATE TABLE public.ai_assistant_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  action_type TEXT NOT NULL, -- 'suggest_tasks', 'detect_risks', 'prioritize', 'generate_report'
  input_data JSONB NOT NULL,
  output_data JSONB NOT NULL,
  model_used TEXT,
  tokens_used INT,
  execution_time_ms INT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- =====================================================
-- INDICES FOR PERFORMANCE
-- =====================================================

CREATE INDEX idx_webhooks_org ON public.webhooks_config(organization_id);
CREATE INDEX idx_webhooks_active ON public.webhooks_config(is_active) WHERE is_active = true;
CREATE INDEX idx_webhook_deliveries_webhook ON public.webhook_deliveries(webhook_id);
CREATE INDEX idx_webhook_deliveries_created ON public.webhook_deliveries(created_at);
CREATE INDEX idx_analytics_org_date ON public.analytics_snapshots(organization_id, snapshot_date DESC);
CREATE INDEX idx_ai_logs_org ON public.ai_assistant_logs(organization_id);
CREATE INDEX idx_ai_logs_created ON public.ai_assistant_logs(created_at DESC);

-- =====================================================
-- TRIGGERS
-- =====================================================

CREATE TRIGGER update_webhooks_updated_at
BEFORE UPDATE ON public.webhooks_config
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- ROW LEVEL SECURITY
-- =====================================================

ALTER TABLE public.webhooks_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.webhook_deliveries ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_snapshots ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ai_assistant_logs ENABLE ROW LEVEL SECURITY;

-- Webhooks config: admins can manage
CREATE POLICY "Admins can manage webhooks"
ON public.webhooks_config FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- Webhook deliveries: admins can view
CREATE POLICY "Admins can view webhook deliveries"
ON public.webhook_deliveries FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.webhooks_config wc
  WHERE wc.id = webhook_deliveries.webhook_id 
    AND get_user_org_role(auth.uid(), wc.organization_id) IN ('owner', 'admin')
));

-- Analytics snapshots: org members can view
CREATE POLICY "Org members can view analytics"
ON public.analytics_snapshots FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));

-- AI logs: org members can view their org's logs
CREATE POLICY "Org members can view AI logs"
ON public.ai_assistant_logs FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));