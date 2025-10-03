-- Update rewards table structure for new points system
-- 1000 points = $1 USD
-- Welcome bonus: 2000 points on registration
-- Purchase rewards: 1% of purchase amount

-- Add column to track if user received welcome bonus
ALTER TABLE profiles ADD COLUMN IF NOT EXISTS welcome_bonus_claimed boolean DEFAULT false;

-- Add index for better query performance
CREATE INDEX IF NOT EXISTS idx_rewards_user_type ON rewards(user_id, type);
CREATE INDEX IF NOT EXISTS idx_rewards_created ON rewards(created_at DESC);

-- Update reward types to be more specific
COMMENT ON COLUMN rewards.type IS 'Types: welcome, purchase, referral, birthday, review, social_share, social_follow';
COMMENT ON COLUMN rewards.amount IS 'Amount in points (1000 points = $1 USD)';

-- Add expiration tracking for points (12 months validity)
ALTER TABLE rewards ADD COLUMN IF NOT EXISTS expires_at timestamp with time zone DEFAULT (now() + interval '12 months');
CREATE INDEX IF NOT EXISTS idx_rewards_expires ON rewards(expires_at) WHERE expires_at IS NOT NULL;