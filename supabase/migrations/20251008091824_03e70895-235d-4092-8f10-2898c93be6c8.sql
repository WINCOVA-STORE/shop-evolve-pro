-- =====================================================
-- REWARDS CONFIGURATION SYSTEM - FASE 1 + BUDGET CONTROL
-- =====================================================

-- 1. CREATE ENUMS
CREATE TYPE public.earning_type AS ENUM ('percentage', 'fixed');
CREATE TYPE public.campaign_type AS ENUM (
  'welcome',
  'review', 
  'referral',
  'purchase',
  'birthday',
  'share',
  'social_follow',
  'custom'
);
CREATE TYPE public.campaign_frequency AS ENUM ('once', 'daily', 'per_event', 'unlimited');
CREATE TYPE public.campaign_status AS ENUM ('active', 'paused', 'completed', 'scheduled');

-- 2. REWARDS CONFIG TABLE (Global settings)
CREATE TABLE public.rewards_config (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL DEFAULT 'wincova_main',
  
  -- Earning configuration
  earning_type earning_type NOT NULL DEFAULT 'percentage',
  earning_percentage NUMERIC(5,2) DEFAULT 1.00, -- 1% default
  earning_fixed_amount NUMERIC(10,2) DEFAULT NULL,
  
  -- Conversion rates
  points_per_dollar NUMERIC(10,2) NOT NULL DEFAULT 1000, -- 1000 points = $1
  
  -- Usage limits
  max_usage_percentage NUMERIC(5,2) NOT NULL DEFAULT 2.00, -- Max 2% of purchase
  min_points_to_use INTEGER NOT NULL DEFAULT 1000, -- Min 1000 points to redeem
  
  -- Bonus multipliers (for future use)
  vip_multiplier NUMERIC(5,2) DEFAULT 1.00,
  seasonal_multiplier NUMERIC(5,2) DEFAULT 1.00,
  
  -- Point expiration
  default_expiration_days INTEGER DEFAULT 365,
  
  -- Display settings
  show_percentage_to_users BOOLEAN NOT NULL DEFAULT false,
  show_conversion_rate BOOLEAN NOT NULL DEFAULT false,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  last_changed_by UUID REFERENCES auth.users(id),
  
  UNIQUE(store_id)
);

-- 3. REWARDS CAMPAIGNS TABLE
CREATE TABLE public.rewards_campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  store_id TEXT NOT NULL DEFAULT 'wincova_main',
  
  -- Campaign basics
  name TEXT NOT NULL,
  description TEXT,
  campaign_type campaign_type NOT NULL,
  status campaign_status NOT NULL DEFAULT 'active',
  
  -- Reward value
  reward_value NUMERIC(10,2) NOT NULL, -- Can be % or fixed based on value_type
  value_type earning_type NOT NULL DEFAULT 'fixed',
  
  -- Frequency & limits
  frequency campaign_frequency NOT NULL DEFAULT 'per_event',
  max_uses_per_user INTEGER DEFAULT NULL, -- NULL = unlimited
  max_uses_total INTEGER DEFAULT NULL,
  current_uses INTEGER DEFAULT 0,
  
  -- Budget control (CRITICAL)
  budget_limit_dollars NUMERIC(10,2) DEFAULT NULL, -- Max $ in points to give
  budget_spent_dollars NUMERIC(10,2) DEFAULT 0,
  budget_alert_threshold NUMERIC(5,2) DEFAULT 0.80, -- Alert at 80%
  auto_pause_on_budget BOOLEAN DEFAULT true,
  
  -- Scheduling
  start_date TIMESTAMPTZ DEFAULT now(),
  end_date TIMESTAMPTZ DEFAULT NULL,
  
  -- Conditions (JSON for flexibility)
  conditions JSONB DEFAULT '{}'::jsonb,
  -- Example: {"min_purchase": 50, "categories": ["electronics"], "new_users_only": true}
  
  -- Priority (for stacking rules)
  priority INTEGER DEFAULT 0,
  allow_stacking BOOLEAN DEFAULT true,
  
  -- Metadata
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  created_by UUID REFERENCES auth.users(id),
  
  -- Indexes
  CONSTRAINT valid_budget CHECK (budget_spent_dollars <= budget_limit_dollars OR budget_limit_dollars IS NULL),
  CONSTRAINT valid_dates CHECK (end_date IS NULL OR end_date > start_date)
);

-- 4. ENABLE RLS
ALTER TABLE public.rewards_config ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.rewards_campaigns ENABLE ROW LEVEL SECURITY;

-- 5. RLS POLICIES - rewards_config
CREATE POLICY "Anyone can view rewards config"
  ON public.rewards_config FOR SELECT
  USING (true);

CREATE POLICY "Admins can manage rewards config"
  ON public.rewards_config FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 6. RLS POLICIES - rewards_campaigns
CREATE POLICY "Anyone can view active campaigns"
  ON public.rewards_campaigns FOR SELECT
  USING (status = 'active' AND (start_date <= now()) AND (end_date IS NULL OR end_date > now()));

CREATE POLICY "Admins can view all campaigns"
  ON public.rewards_campaigns FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage campaigns"
  ON public.rewards_campaigns FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- 7. HELPER FUNCTION - Get active config
CREATE OR REPLACE FUNCTION public.get_active_rewards_config(p_store_id TEXT DEFAULT 'wincova_main')
RETURNS TABLE (
  id UUID,
  earning_type earning_type,
  earning_percentage NUMERIC,
  earning_fixed_amount NUMERIC,
  points_per_dollar NUMERIC,
  max_usage_percentage NUMERIC,
  min_points_to_use INTEGER,
  default_expiration_days INTEGER
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    rc.id,
    rc.earning_type,
    rc.earning_percentage,
    rc.earning_fixed_amount,
    rc.points_per_dollar,
    rc.max_usage_percentage,
    rc.min_points_to_use,
    rc.default_expiration_days
  FROM public.rewards_config rc
  WHERE rc.store_id = p_store_id
  LIMIT 1;
END;
$$;

-- 8. HELPER FUNCTION - Get active campaign by type
CREATE OR REPLACE FUNCTION public.get_active_campaign(
  p_campaign_type campaign_type,
  p_store_id TEXT DEFAULT 'wincova_main'
)
RETURNS TABLE (
  id UUID,
  name TEXT,
  reward_value NUMERIC,
  value_type earning_type,
  frequency campaign_frequency,
  conditions JSONB
)
LANGUAGE plpgsql
STABLE SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.name,
    c.reward_value,
    c.value_type,
    c.frequency,
    c.conditions
  FROM public.rewards_campaigns c
  WHERE c.campaign_type = p_campaign_type
    AND c.store_id = p_store_id
    AND c.status = 'active'
    AND c.start_date <= now()
    AND (c.end_date IS NULL OR c.end_date > now())
    AND (c.max_uses_total IS NULL OR c.current_uses < c.max_uses_total)
    AND (c.budget_limit_dollars IS NULL OR c.budget_spent_dollars < c.budget_limit_dollars)
  ORDER BY c.priority DESC
  LIMIT 1;
END;
$$;

-- 9. FUNCTION - Track campaign usage and budget
CREATE OR REPLACE FUNCTION public.track_campaign_usage(
  p_campaign_id UUID,
  p_points_awarded NUMERIC
)
RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_config RECORD;
  v_dollars_spent NUMERIC;
  v_campaign RECORD;
BEGIN
  -- Get conversion rate
  SELECT points_per_dollar INTO v_config
  FROM public.rewards_config
  LIMIT 1;
  
  -- Calculate dollars spent
  v_dollars_spent := p_points_awarded / v_config.points_per_dollar;
  
  -- Update campaign
  UPDATE public.rewards_campaigns
  SET 
    current_uses = current_uses + 1,
    budget_spent_dollars = budget_spent_dollars + v_dollars_spent,
    updated_at = now()
  WHERE id = p_campaign_id
  RETURNING * INTO v_campaign;
  
  -- Auto-pause if budget reached
  IF v_campaign.auto_pause_on_budget 
     AND v_campaign.budget_limit_dollars IS NOT NULL 
     AND v_campaign.budget_spent_dollars >= v_campaign.budget_limit_dollars THEN
    UPDATE public.rewards_campaigns
    SET status = 'paused'
    WHERE id = p_campaign_id;
  END IF;
END;
$$;

-- 10. TRIGGERS - updated_at
CREATE TRIGGER update_rewards_config_updated_at
  BEFORE UPDATE ON public.rewards_config
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_rewards_campaigns_updated_at
  BEFORE UPDATE ON public.rewards_campaigns
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- 11. DEFAULT DATA
INSERT INTO public.rewards_config (
  store_id,
  earning_type,
  earning_percentage,
  points_per_dollar,
  max_usage_percentage,
  min_points_to_use,
  default_expiration_days,
  show_percentage_to_users,
  show_conversion_rate
) VALUES (
  'wincova_main',
  'percentage',
  1.00,
  1000,
  2.00,
  1000,
  365,
  false,
  false
);

-- 12. DEFAULT CAMPAIGNS
INSERT INTO public.rewards_campaigns (name, campaign_type, reward_value, value_type, description, budget_limit_dollars) VALUES
  ('Bono de Bienvenida', 'welcome', 2000, 'fixed', 'Puntos por registrarte en Wincova', 500),
  ('Reseña de Producto', 'review', 100, 'fixed', 'Puntos por dejar una reseña', 200),
  ('Puntos por Compra', 'purchase', 1.00, 'percentage', 'Gana el 1% en puntos de cada compra', NULL),
  ('Cumpleaños Especial', 'birthday', 500, 'fixed', 'Puntos en tu cumpleaños', 100);

-- 13. CREATE INDEXES for performance
CREATE INDEX idx_rewards_campaigns_type_status ON public.rewards_campaigns(campaign_type, status);
CREATE INDEX idx_rewards_campaigns_dates ON public.rewards_campaigns(start_date, end_date);
CREATE INDEX idx_rewards_campaigns_budget ON public.rewards_campaigns(budget_spent_dollars, budget_limit_dollars);