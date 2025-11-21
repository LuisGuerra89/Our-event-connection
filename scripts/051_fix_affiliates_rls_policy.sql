-- Fix RLS policy to allow users to see their own affiliate applications
-- This ensures users can see pending applications while they're being reviewed

-- Drop old policy
DROP POLICY IF EXISTS "affiliates_select_approved" ON affiliates;
DROP POLICY IF EXISTS "affiliates_select_policy" ON affiliates;

-- Create comprehensive select policy
-- Allows:
-- 1. Everyone to view approved affiliates (status = 'approved')
-- 2. Users to view their own applications (regardless of status)
-- 3. Admins to view everything
CREATE POLICY "affiliates_select_comprehensive" ON affiliates 
  FOR SELECT 
  USING (
    approval_status = 'approved'     -- Public approved partners
    OR auth.uid() = user_id          -- Users can see their own
    OR is_admin()                    -- Admins can see all
  );
