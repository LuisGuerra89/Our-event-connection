-- Fix process_referral trigger to fire on UPDATE of referred_by
-- This ensures referral processing happens when referred_by is set

DROP TRIGGER IF EXISTS process_referral_trigger ON public.profiles;

-- Create trigger that fires when referred_by is updated (not on INSERT)
-- This is because handle_new_user creates the profile first, then actions.ts updates referred_by
CREATE TRIGGER process_referral_trigger
  AFTER UPDATE OF referred_by ON public.profiles
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL AND OLD.referred_by IS NULL)
  EXECUTE FUNCTION public.process_referral();

COMMENT ON TRIGGER process_referral_trigger ON public.profiles IS 
  'Processes referrals when referred_by field is set. Fires on UPDATE (not INSERT) because handle_new_user creates profile first, then actions.ts updates referred_by field.';
