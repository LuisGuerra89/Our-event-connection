-- Functions to manage coupon validation and redemption

-- Drop existing functions if they exist (with old signatures)
DROP FUNCTION IF EXISTS public.get_available_coupons(UUID);
DROP FUNCTION IF EXISTS public.validate_coupon(TEXT, UUID);
DROP FUNCTION IF EXISTS public.redeem_coupon(TEXT, UUID, UUID);
DROP FUNCTION IF EXISTS public.has_available_free_activity_coupon(UUID);
DROP FUNCTION IF EXISTS public.count_available_coupons(UUID);

-- Function to get available coupons for a user
CREATE OR REPLACE FUNCTION public.get_available_coupons(p_user_id UUID)
RETURNS TABLE (
  coupon_id UUID,
  code TEXT,
  type TEXT,
  discount_amount DECIMAL,
  expiration_date TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    c.id,
    c.code,
    c.type,
    c.discount_amount,
    c.expiration_date
  FROM public.coupons c
  WHERE c.user_id = p_user_id
    AND c.status = 'active'
    AND c.expiration_date > NOW()
  ORDER BY c.created_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to validate a specific coupon and check if it can be redeemed
CREATE OR REPLACE FUNCTION public.validate_coupon(p_coupon_code TEXT, p_user_id UUID)
RETURNS TABLE (
  valid BOOLEAN,
  message TEXT,
  coupon_id UUID,
  discount_amount DECIMAL
) AS $$
DECLARE
  v_coupon_id UUID;
  v_status TEXT;
  v_discount_amount DECIMAL;
  v_expiration_date TIMESTAMPTZ;
BEGIN
  -- Find the coupon
  SELECT c.id, c.status, c.discount_amount, c.expiration_date 
  INTO v_coupon_id, v_status, v_discount_amount, v_expiration_date
  FROM public.coupons c
  WHERE c.code = p_coupon_code AND c.user_id = p_user_id;
  
  -- Check if coupon exists
  IF v_coupon_id IS NULL THEN
    RETURN QUERY SELECT FALSE, 'Coupon not found'::TEXT, NULL::UUID, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check if coupon is active
  IF v_status != 'active' THEN
    RETURN QUERY SELECT FALSE, 'Coupon has already been used or is no longer valid'::TEXT, v_coupon_id, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Check if coupon is expired
  IF v_expiration_date < NOW() THEN
    RETURN QUERY SELECT FALSE, 'Coupon has expired'::TEXT, v_coupon_id, 0::DECIMAL;
    RETURN;
  END IF;
  
  -- Coupon is valid
  RETURN QUERY SELECT TRUE, 'Coupon is valid and ready to be redeemed'::TEXT, v_coupon_id, v_discount_amount;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to redeem a coupon
CREATE OR REPLACE FUNCTION public.redeem_coupon(p_coupon_code TEXT, p_user_id UUID, p_event_id UUID)
RETURNS TABLE (
  success BOOLEAN,
  message TEXT,
  coupon_id UUID
) AS $$
DECLARE
  v_coupon_id UUID;
  v_validation_valid BOOLEAN;
BEGIN
  -- First validate the coupon
  SELECT valid INTO v_validation_valid
  FROM public.validate_coupon(p_coupon_code, p_user_id);
  
  IF NOT v_validation_valid THEN
    RETURN QUERY SELECT FALSE, 'Coupon validation failed'::TEXT, NULL::UUID;
    RETURN;
  END IF;
  
  -- Get the coupon ID
  SELECT c.id INTO v_coupon_id
  FROM public.coupons c
  WHERE c.code = p_coupon_code AND c.user_id = p_user_id;
  
  -- Mark coupon as used
  UPDATE public.coupons
  SET status = 'used',
      used_at = NOW(),
      event_id = p_event_id,
      updated_at = NOW()
  WHERE id = v_coupon_id;
  
  RETURN QUERY SELECT TRUE, 'Coupon successfully redeemed'::TEXT, v_coupon_id;
END;
$$ LANGUAGE plpgsql;

-- Function to check if user has any free activity coupon available
CREATE OR REPLACE FUNCTION public.has_available_free_activity_coupon(p_user_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
  coupon_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO coupon_count
  FROM public.coupons
  WHERE user_id = p_user_id
    AND type = 'free_after_work_activity'
    AND status = 'active'
    AND expiration_date > NOW();
  
  RETURN coupon_count > 0;
END;
$$ LANGUAGE plpgsql STABLE;

-- Function to get count of available coupons for a user
CREATE OR REPLACE FUNCTION public.count_available_coupons(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  coupon_count INTEGER;
BEGIN
  SELECT COUNT(*) INTO coupon_count
  FROM public.coupons
  WHERE user_id = p_user_id
    AND status = 'active'
    AND expiration_date > NOW();
  
  RETURN COALESCE(coupon_count, 0);
END;
$$ LANGUAGE plpgsql STABLE;
