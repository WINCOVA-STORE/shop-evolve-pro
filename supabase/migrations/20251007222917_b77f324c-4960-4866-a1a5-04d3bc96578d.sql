-- Drop the old constraint
ALTER TABLE public.rewards DROP CONSTRAINT IF EXISTS rewards_type_check;

-- Add the updated constraint with all reward types
ALTER TABLE public.rewards ADD CONSTRAINT rewards_type_check 
CHECK (type = ANY (ARRAY['purchase'::text, 'referral'::text, 'welcome'::text, 'review'::text, 'birthday'::text]));