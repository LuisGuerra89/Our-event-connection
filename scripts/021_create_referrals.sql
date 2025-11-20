-- Referrals table
CREATE TABLE IF NOT EXISTS referrals (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  referrer_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  referred_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  barcode TEXT UNIQUE NOT NULL,
  referral_date TIMESTAMPTZ DEFAULT NOW(),
  status TEXT DEFAULT 'pending' CHECK (status IN ('pending', 'completed', 'rewarded')),
  reward_given BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE referrals ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "referrals_select_own" ON referrals;
DROP POLICY IF EXISTS "referrals_insert_own" ON referrals;
DROP POLICY IF EXISTS "referrals_select_admin" ON referrals;
DROP POLICY IF EXISTS "referrals_update_admin" ON referrals;

-- Policies
CREATE POLICY "referrals_select_own" ON referrals FOR SELECT USING (auth.uid() = referrer_id OR auth.uid() = referred_id);
CREATE POLICY "referrals_insert_own" ON referrals FOR INSERT WITH CHECK (auth.uid() = referrer_id);
CREATE POLICY "referrals_select_admin" ON referrals FOR SELECT USING (is_admin());
CREATE POLICY "referrals_update_admin" ON referrals FOR UPDATE USING (is_admin());

-- Indexes
CREATE INDEX idx_referrals_referrer_id ON referrals(referrer_id);
CREATE INDEX idx_referrals_referred_id ON referrals(referred_id);
CREATE INDEX idx_referrals_barcode ON referrals(barcode);
