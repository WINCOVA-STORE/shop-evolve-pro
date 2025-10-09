-- =====================================================
-- WINCOVA PROJECT MANAGEMENT SYSTEM (Multi-tenant SaaS Ready)
-- Fase 1: Schema + Triggers + Functions
-- =====================================================

-- 1. ORGANIZATIONS (Multi-tenant core)
CREATE TABLE public.organizations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  plan_tier TEXT NOT NULL DEFAULT 'free' CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
  stripe_subscription_id TEXT,
  max_phases INT NOT NULL DEFAULT 2,
  max_tasks_per_phase INT NOT NULL DEFAULT 50,
  max_users INT NOT NULL DEFAULT 3,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. ORGANIZATION MEMBERS (Roles and permissions)
CREATE TYPE project_role AS ENUM ('owner', 'admin', 'dev', 'viewer');

CREATE TABLE public.organization_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  role project_role NOT NULL DEFAULT 'viewer',
  permissions JSONB DEFAULT '{"phases": ["read"], "tasks": ["read"]}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(organization_id, user_id)
);

-- 3. PHASES (Project phases with progress tracking)
CREATE TYPE phase_status AS ENUM ('planned', 'in_progress', 'blocked', 'completed');
CREATE TYPE risk_level AS ENUM ('low', 'medium', 'high', 'critical');

CREATE TABLE public.phases (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  goal TEXT,
  status phase_status NOT NULL DEFAULT 'planned',
  start_date DATE,
  end_date DATE,
  owner_user_id UUID,
  progress_pct NUMERIC(5,2) DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  risk_level risk_level DEFAULT 'low',
  order_index INT NOT NULL DEFAULT 0,
  notes TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- 4. TASKS (Granular task management)
CREATE TYPE task_status AS ENUM ('todo', 'in_progress', 'blocked', 'done', 'cancelled');
CREATE TYPE task_priority AS ENUM ('low', 'medium', 'high', 'urgent');

CREATE TABLE public.tasks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id UUID NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  phase_id UUID NOT NULL REFERENCES public.phases(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  status task_status NOT NULL DEFAULT 'todo',
  priority task_priority NOT NULL DEFAULT 'medium',
  assignee_user_id UUID,
  estimate_hours NUMERIC(6,2),
  due_date DATE,
  progress_pct NUMERIC(5,2) DEFAULT 0 CHECK (progress_pct >= 0 AND progress_pct <= 100),
  tags TEXT[] DEFAULT '{}',
  links JSONB DEFAULT '[]',
  blocked_by UUID[],
  risk_level risk_level DEFAULT 'low',
  order_index INT NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID,
  updated_by UUID
);

-- 5. TASK COMMENTS (Collaboration)
CREATE TABLE public.task_comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  author_user_id UUID NOT NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. TASK TIME LOGS (Time tracking)
CREATE TABLE public.task_timelogs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  user_id UUID NOT NULL,
  hours NUMERIC(6,2) NOT NULL CHECK (hours > 0),
  note TEXT,
  logged_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. TASK HISTORY (Audit trail)
CREATE TABLE public.task_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  task_id UUID NOT NULL REFERENCES public.tasks(id) ON DELETE CASCADE,
  changed_by UUID NOT NULL,
  field_name TEXT NOT NULL,
  old_value TEXT,
  new_value TEXT,
  changed_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. PLAN FEATURES (Monetization)
CREATE TABLE public.plan_features (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_tier TEXT NOT NULL UNIQUE CHECK (plan_tier IN ('free', 'pro', 'enterprise')),
  max_phases INT NOT NULL,
  max_tasks_per_phase INT NOT NULL,
  max_users_per_org INT NOT NULL,
  enable_time_tracking BOOLEAN NOT NULL DEFAULT false,
  enable_gantt BOOLEAN NOT NULL DEFAULT false,
  enable_webhooks BOOLEAN NOT NULL DEFAULT false,
  enable_api_access BOOLEAN NOT NULL DEFAULT false,
  enable_ai_assistant BOOLEAN NOT NULL DEFAULT false,
  price_monthly_usd NUMERIC(10,2) NOT NULL DEFAULT 0
);

-- Insert default plan features
INSERT INTO public.plan_features (plan_tier, max_phases, max_tasks_per_phase, max_users_per_org, enable_time_tracking, enable_gantt, enable_webhooks, enable_api_access, enable_ai_assistant, price_monthly_usd) VALUES
('free', 2, 50, 3, false, false, false, false, false, 0),
('pro', 10, 500, 10, true, true, false, true, false, 49),
('enterprise', 999, 9999, 100, true, true, true, true, true, 199);

-- =====================================================
-- INDICES FOR PERFORMANCE (Optimización mundial)
-- =====================================================

-- Organizations
CREATE INDEX idx_orgs_plan ON public.organizations(plan_tier);

-- Organization members
CREATE INDEX idx_org_members_org ON public.organization_members(organization_id);
CREATE INDEX idx_org_members_user ON public.organization_members(user_id);

-- Phases
CREATE INDEX idx_phases_org ON public.phases(organization_id);
CREATE INDEX idx_phases_status ON public.phases(status);
CREATE INDEX idx_phases_owner ON public.phases(owner_user_id);
CREATE INDEX idx_phases_order ON public.phases(organization_id, order_index);

-- Tasks (CRÍTICOS para queries rápidas)
CREATE INDEX idx_tasks_org ON public.tasks(organization_id);
CREATE INDEX idx_tasks_phase ON public.tasks(phase_id);
CREATE INDEX idx_tasks_phase_status ON public.tasks(phase_id, status);
CREATE INDEX idx_tasks_assignee ON public.tasks(assignee_user_id);
CREATE INDEX idx_tasks_status ON public.tasks(status);
CREATE INDEX idx_tasks_priority ON public.tasks(priority);
CREATE INDEX idx_tasks_due ON public.tasks(due_date);
CREATE INDEX idx_tasks_tags ON public.tasks USING GIN(tags);

-- Comments & Logs
CREATE INDEX idx_comments_task ON public.task_comments(task_id);
CREATE INDEX idx_timelogs_task ON public.task_timelogs(task_id);
CREATE INDEX idx_timelogs_user ON public.task_timelogs(user_id);
CREATE INDEX idx_history_task ON public.task_history(task_id);

-- =====================================================
-- TRIGGERS (Auto-update progress_pct)
-- =====================================================

-- Update phase progress when tasks change
CREATE OR REPLACE FUNCTION update_phase_progress()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE public.phases
  SET 
    progress_pct = (
      SELECT COALESCE(
        AVG(CASE 
          WHEN status = 'done' THEN 100 
          WHEN status = 'cancelled' THEN 0
          ELSE progress_pct 
        END), 
        0
      )
      FROM public.tasks
      WHERE phase_id = COALESCE(NEW.phase_id, OLD.phase_id)
    ),
    updated_at = now()
  WHERE id = COALESCE(NEW.phase_id, OLD.phase_id);
  
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

CREATE TRIGGER task_progress_update
AFTER INSERT OR UPDATE OR DELETE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_phase_progress();

-- Update timestamps automatically
CREATE TRIGGER update_phases_updated_at
BEFORE UPDATE ON public.phases
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_tasks_updated_at
BEFORE UPDATE ON public.tasks
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_orgs_updated_at
BEFORE UPDATE ON public.organizations
FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- =====================================================
-- SECURITY FUNCTIONS
-- =====================================================

-- Check if user has access to organization
CREATE OR REPLACE FUNCTION user_has_org_access(_user_id UUID, _org_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- Get user role in organization
CREATE OR REPLACE FUNCTION get_user_org_role(_user_id UUID, _org_id UUID)
RETURNS project_role AS $$
BEGIN
  RETURN (
    SELECT role FROM public.organization_members
    WHERE user_id = _user_id AND organization_id = _org_id
    LIMIT 1
  );
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER SET search_path = public;

-- =====================================================
-- ROW LEVEL SECURITY POLICIES (Multi-tenant isolation)
-- =====================================================

ALTER TABLE public.organizations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.organization_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phases ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.tasks ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_timelogs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.task_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.plan_features ENABLE ROW LEVEL SECURITY;

-- Organizations: users can only see their orgs
CREATE POLICY "Users can view their organizations"
ON public.organizations FOR SELECT
USING (user_has_org_access(auth.uid(), id));

CREATE POLICY "Owners can update organizations"
ON public.organizations FOR UPDATE
USING (get_user_org_role(auth.uid(), id) IN ('owner', 'admin'));

-- Organization members
CREATE POLICY "Users can view org members"
ON public.organization_members FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Admins can manage members"
ON public.organization_members FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin'));

-- Phases: org members can view
CREATE POLICY "Users can view phases"
ON public.phases FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Devs can manage phases"
ON public.phases FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'dev'));

-- Tasks: org members can view
CREATE POLICY "Users can view tasks"
ON public.tasks FOR SELECT
USING (user_has_org_access(auth.uid(), organization_id));

CREATE POLICY "Devs can manage tasks"
ON public.tasks FOR ALL
USING (get_user_org_role(auth.uid(), organization_id) IN ('owner', 'admin', 'dev'));

-- Comments: authenticated users in org
CREATE POLICY "Users can view comments"
ON public.task_comments FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_id AND user_has_org_access(auth.uid(), t.organization_id)
));

CREATE POLICY "Users can create comments"
ON public.task_comments FOR INSERT
WITH CHECK (
  auth.uid() = author_user_id AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id AND user_has_org_access(auth.uid(), t.organization_id)
  )
);

-- Time logs
CREATE POLICY "Users can view timelogs"
ON public.task_timelogs FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_id AND user_has_org_access(auth.uid(), t.organization_id)
));

CREATE POLICY "Users can create timelogs"
ON public.task_timelogs FOR INSERT
WITH CHECK (
  auth.uid() = user_id AND
  EXISTS (
    SELECT 1 FROM public.tasks t
    WHERE t.id = task_id AND user_has_org_access(auth.uid(), t.organization_id)
  )
);

-- History: read-only for org members
CREATE POLICY "Users can view history"
ON public.task_history FOR SELECT
USING (EXISTS (
  SELECT 1 FROM public.tasks t
  WHERE t.id = task_id AND user_has_org_access(auth.uid(), t.organization_id)
));

-- Plan features: public read
CREATE POLICY "Anyone can view plan features"
ON public.plan_features FOR SELECT
USING (true);