-- Add Stripe fields to user_subscriptions table

ALTER TABLE user_subscriptions
ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT;

-- Add indexes for faster lookups
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_subscription ON user_subscriptions(stripe_subscription_id);
CREATE INDEX IF NOT EXISTS idx_user_subscriptions_stripe_payment_intent ON user_subscriptions(stripe_payment_intent_id);

-- Add comments
COMMENT ON COLUMN user_subscriptions.stripe_subscription_id IS 'Stripe subscription ID for recurring payments';
COMMENT ON COLUMN user_subscriptions.stripe_payment_intent_id IS 'Stripe payment intent ID for one-time payments';
