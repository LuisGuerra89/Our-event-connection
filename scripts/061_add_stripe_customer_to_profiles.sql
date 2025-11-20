-- Add Stripe customer ID field to profiles table

ALTER TABLE profiles
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Add index for faster lookups
CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON profiles(stripe_customer_id);

-- Add comment
COMMENT ON COLUMN profiles.stripe_customer_id IS 'Stripe customer ID for payment processing';
