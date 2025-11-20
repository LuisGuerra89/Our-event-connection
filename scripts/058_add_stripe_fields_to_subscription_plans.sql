-- Add Stripe integration fields to subscription_plans table

-- Add Stripe Product ID and Price ID columns
ALTER TABLE subscription_plans 
ADD COLUMN IF NOT EXISTS stripe_product_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_price_id TEXT UNIQUE;

-- Create index for faster Stripe lookups
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_product ON subscription_plans(stripe_product_id);
CREATE INDEX IF NOT EXISTS idx_subscription_plans_stripe_price ON subscription_plans(stripe_price_id);

-- Show updated structure
SELECT 
  id,
  name,
  description,
  plan_type,
  price,
  duration_days,
  auto_renewal,
  status,
  stripe_product_id,
  stripe_price_id,
  created_at
FROM subscription_plans
ORDER BY created_at DESC;
