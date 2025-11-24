-- Create coupons/rewards table for referral-earned free activities
CREATE TABLE IF NOT EXISTS public.coupons (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'free_after_work_activity' CHECK (type IN ('free_after_work_activity', 'discount')),
  code TEXT UNIQUE NOT NULL,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'used', 'expired')),
  discount_amount DECIMAL(10, 2) DEFAULT 0.00,
  discount_percentage DECIMAL(5, 2) DEFAULT 0.00,
  generated_at TIMESTAMPTZ DEFAULT NOW(),
  used_at TIMESTAMPTZ,
  event_id UUID REFERENCES events(id) ON DELETE SET NULL,
  created_from_referral_count INTEGER,
  expiration_date TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '1 year'),
  metadata JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.coupons ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "coupons_select_own" ON public.coupons;
DROP POLICY IF EXISTS "coupons_insert_admin" ON public.coupons;
DROP POLICY IF EXISTS "coupons_update_own" ON public.coupons;
DROP POLICY IF EXISTS "coupons_select_admin" ON public.coupons;
DROP POLICY IF EXISTS "coupons_update_admin" ON public.coupons;

-- RLS Policies
-- Users can see their own coupons
CREATE POLICY "coupons_select_own" ON public.coupons FOR SELECT USING (auth.uid() = user_id);

-- System (admin) can insert new coupons
CREATE POLICY "coupons_insert_admin" ON public.coupons FOR INSERT WITH CHECK (is_admin());

-- Users can only update the status of their own coupons to 'used'
CREATE POLICY "coupons_update_own" ON public.coupons FOR UPDATE USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id AND status = 'used');

-- Admins can view all coupons
CREATE POLICY "coupons_select_admin" ON public.coupons FOR SELECT USING (is_admin());

-- Admins can update any coupon
CREATE POLICY "coupons_update_admin" ON public.coupons FOR UPDATE USING (is_admin());

-- Indexes for performance
CREATE INDEX IF NOT EXISTS idx_coupons_user_id ON public.coupons(user_id);
CREATE INDEX IF NOT EXISTS idx_coupons_code ON public.coupons(code);
CREATE INDEX IF NOT EXISTS idx_coupons_status ON public.coupons(status);
CREATE INDEX IF NOT EXISTS idx_coupons_user_status ON public.coupons(user_id, status);
CREATE INDEX IF NOT EXISTS idx_coupons_expiration ON public.coupons(expiration_date);

-- Create index for active coupons (without NOW() function in predicate)
CREATE INDEX IF NOT EXISTS idx_coupons_active ON public.coupons(user_id, status) 
  WHERE status = 'active';
