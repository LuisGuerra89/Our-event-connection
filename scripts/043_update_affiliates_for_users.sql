-- Update affiliates table to link with user profiles
-- Affiliates are users who joined via referral code and have been approved

ALTER TABLE affiliates 
ADD COLUMN IF NOT EXISTS user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
ADD COLUMN IF NOT EXISTS approval_status TEXT DEFAULT 'pending' CHECK (approval_status IN ('pending', 'approved', 'rejected')),
ADD COLUMN IF NOT EXISTS application_date TIMESTAMPTZ DEFAULT NOW(),
ADD COLUMN IF NOT EXISTS approved_date TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS approved_by UUID REFERENCES profiles(id),
ADD COLUMN IF NOT EXISTS commission_rate DECIMAL(5,2) DEFAULT 0.00,
ADD COLUMN IF NOT EXISTS total_referrals INTEGER DEFAULT 0,
ADD COLUMN IF NOT EXISTS total_earnings DECIMAL(10,2) DEFAULT 0.00;

-- Update RLS policies to allow users to view their own affiliate status
DROP POLICY IF EXISTS "affiliates_select_all" ON affiliates;
DROP POLICY IF EXISTS "affiliates_insert_admin" ON affiliates;
DROP POLICY IF EXISTS "affiliates_update_admin" ON affiliates;
DROP POLICY IF EXISTS "affiliates_delete_admin" ON affiliates;
DROP POLICY IF EXISTS "affiliates_select_approved" ON affiliates;
DROP POLICY IF EXISTS "affiliates_insert_own" ON affiliates;
DROP POLICY IF EXISTS "affiliates_update_own" ON affiliates;
DROP POLICY IF EXISTS "affiliates_admin_all" ON affiliates;

-- Allow everyone to view approved affiliates
CREATE POLICY "affiliates_select_approved" ON affiliates 
  FOR SELECT 
  USING (approval_status = 'approved' OR auth.uid() = user_id OR is_admin());

-- Allow authenticated users to insert (apply to become affiliate)
CREATE POLICY "affiliates_insert_own" ON affiliates 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Allow users to update their own pending applications
CREATE POLICY "affiliates_update_own" ON affiliates 
  FOR UPDATE 
  USING (auth.uid() = user_id AND approval_status = 'pending');

-- Admins can do everything
CREATE POLICY "affiliates_admin_all" ON affiliates 
  FOR ALL 
  USING (is_admin());

-- Create index for performance
CREATE INDEX IF NOT EXISTS affiliates_user_id_idx ON affiliates(user_id);
CREATE INDEX IF NOT EXISTS affiliates_approval_status_idx ON affiliates(approval_status);
CREATE INDEX IF NOT EXISTS affiliates_barcode_idx ON affiliates(barcode);

-- Function to sync affiliate referral count with profile referral count
CREATE OR REPLACE FUNCTION sync_affiliate_referrals()
RETURNS TRIGGER AS $$
BEGIN
  -- Update affiliate total_referrals when profile referral_count changes
  UPDATE affiliates
  SET total_referrals = NEW.referral_count,
      updated_at = NOW()
  WHERE user_id = NEW.id
    AND approval_status = 'approved';
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS sync_affiliate_referrals_trigger ON profiles;

-- Create trigger to sync referral counts
CREATE TRIGGER sync_affiliate_referrals_trigger
  AFTER UPDATE OF referral_count ON profiles
  FOR EACH ROW
  WHEN (NEW.referral_count IS DISTINCT FROM OLD.referral_count)
  EXECUTE FUNCTION sync_affiliate_referrals();
