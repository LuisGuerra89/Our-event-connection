-- Function to automatically generate coupons when referral count reaches 25
-- This function is called whenever the referral_count is updated

CREATE OR REPLACE FUNCTION public.generate_coupon_on_referral_milestone()
RETURNS TRIGGER AS $$
DECLARE
  new_milestones_count INTEGER;
  current_coupons_count INTEGER;
  i INTEGER;
  coupon_code TEXT;
BEGIN
  -- Only proceed if referral_count changed
  IF OLD.referral_count IS DISTINCT FROM NEW.referral_count THEN
    -- Calculate how many milestones have been reached (25, 50, 75, etc.)
    new_milestones_count := FLOOR(NEW.referral_count / 25);
    
    -- Count how many coupons this user already has from referrals
    SELECT COUNT(*) INTO current_coupons_count
    FROM public.coupons
    WHERE user_id = NEW.id 
      AND type = 'free_after_work_activity'
      AND created_from_referral_count IS NOT NULL;
    
    -- Generate new coupons for each new milestone reached
    FOR i IN (current_coupons_count + 1)..new_milestones_count LOOP
      -- Generate unique coupon code
      coupon_code := 'FREEACTIVITY-' || NEW.id::TEXT || '-' || i::TEXT || '-' || 
                     LPAD(FLOOR(RANDOM() * 10000)::TEXT, 4, '0');
      
      -- Insert new coupon
      INSERT INTO public.coupons (
        user_id,
        type,
        code,
        status,
        discount_amount,
        created_from_referral_count,
        metadata
      ) VALUES (
        NEW.id,
        'free_after_work_activity',
        coupon_code,
        'active',
        0.00, -- Full discount (100%)
        NEW.referral_count,
        jsonb_build_object(
          'reason', 'Reached ' || (i * 25)::TEXT || ' referrals',
          'referral_milestone', i * 25,
          'generated_at_referral_count', NEW.referral_count
        )
      );
    END LOOP;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Drop existing trigger if it exists
DROP TRIGGER IF EXISTS trigger_generate_coupon_on_referral ON public.profiles;

-- Create trigger that fires after referral_count is updated
CREATE TRIGGER trigger_generate_coupon_on_referral
  AFTER UPDATE OF referral_count ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.generate_coupon_on_referral_milestone();
