-- Add Stripe integration fields to payments table

-- Add Stripe Payment Intent ID for synchronization
ALTER TABLE payments 
ADD COLUMN IF NOT EXISTS stripe_payment_intent_id TEXT UNIQUE,
ADD COLUMN IF NOT EXISTS stripe_charge_id TEXT,
ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

-- Update payment_method to allow more specific values
COMMENT ON COLUMN payments.payment_method IS 'Payment method: card, bank_transfer, cash, etc.';

-- Create index for faster Stripe lookups
CREATE INDEX IF NOT EXISTS idx_payments_stripe_payment_intent ON payments(stripe_payment_intent_id);
CREATE INDEX IF NOT EXISTS idx_payments_stripe_customer ON payments(stripe_customer_id);

-- Add payment_date index for filtering by date range
CREATE INDEX IF NOT EXISTS idx_payments_payment_date ON payments(payment_date);

-- Show updated structure
SELECT 
  column_name,
  data_type,
  is_nullable,
  column_default
FROM information_schema.columns
WHERE table_name = 'payments'
ORDER BY ordinal_position;
