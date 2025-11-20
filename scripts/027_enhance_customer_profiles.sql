-- Add comprehensive biometric and profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS first_name text,
ADD COLUMN IF NOT EXISTS last_name text,
ADD COLUMN IF NOT EXISTS contact_number text,
ADD COLUMN IF NOT EXISTS gender text CHECK (gender IN ('male', 'female', 'other')),
ADD COLUMN IF NOT EXISTS date_of_birth date,
-- Removed GENERATED ALWAYS column for age since CURRENT_DATE is not immutable
ADD COLUMN IF NOT EXISTS height_cm integer,
ADD COLUMN IF NOT EXISTS weight_kg decimal(5, 2),
ADD COLUMN IF NOT EXISTS skin_tone text,
ADD COLUMN IF NOT EXISTS hair_color text,
ADD COLUMN IF NOT EXISTS occupation text,
ADD COLUMN IF NOT EXISTS hobbies text[],
ADD COLUMN IF NOT EXISTS address_1 text,
ADD COLUMN IF NOT EXISTS address_2 text,
ADD COLUMN IF NOT EXISTS country_id uuid REFERENCES public.countries(id),
ADD COLUMN IF NOT EXISTS state_id uuid REFERENCES public.states(id),
ADD COLUMN IF NOT EXISTS city_id uuid REFERENCES public.cities(id),
ADD COLUMN IF NOT EXISTS zip_code text,
ADD COLUMN IF NOT EXISTS profile_photo_url text,
ADD COLUMN IF NOT EXISTS referral_code text UNIQUE,
ADD COLUMN IF NOT EXISTS referred_by uuid REFERENCES public.profiles(id),
ADD COLUMN IF NOT EXISTS referral_count integer DEFAULT 0,
ADD COLUMN IF NOT EXISTS free_events_earned integer DEFAULT 0;

-- Create a function to calculate age dynamically
CREATE OR REPLACE FUNCTION calculate_age(birth_date date)
RETURNS integer AS $$
BEGIN
  RETURN EXTRACT(YEAR FROM AGE(CURRENT_DATE, birth_date))::integer;
END;
$$ LANGUAGE plpgsql STABLE;

-- Create function to generate unique referral code
CREATE OR REPLACE FUNCTION generate_referral_code()
RETURNS text AS $$
DECLARE
  code text;
  exists boolean;
BEGIN
  LOOP
    -- Generate a random 8-character alphanumeric code
    code := upper(substring(md5(random()::text) from 1 for 8));
    
    -- Check if code already exists
    SELECT EXISTS(SELECT 1 FROM public.profiles WHERE referral_code = code) INTO exists;
    
    -- Exit loop if code is unique
    EXIT WHEN NOT exists;
  END LOOP;
  
  RETURN code;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate referral code on profile creation
CREATE OR REPLACE FUNCTION set_referral_code()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.referral_code IS NULL THEN
    NEW.referral_code := generate_referral_code();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_set_referral_code
  BEFORE INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION set_referral_code();

-- Add new columns to existing referrals table (table already exists from script 021)
ALTER TABLE public.referrals 
ADD COLUMN IF NOT EXISTS reward_granted boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS reward_type text,
ADD COLUMN IF NOT EXISTS notes text;

-- Removed duplicate RLS enable and policy creation since they already exist in script 021

-- Create indexes for new profile columns
CREATE INDEX IF NOT EXISTS profiles_referral_code_idx ON public.profiles(referral_code);
CREATE INDEX IF NOT EXISTS profiles_referred_by_idx ON public.profiles(referred_by);
CREATE INDEX IF NOT EXISTS profiles_country_id_idx ON public.profiles(country_id);
CREATE INDEX IF NOT EXISTS profiles_state_id_idx ON public.profiles(state_id);
CREATE INDEX IF NOT EXISTS profiles_city_id_idx ON public.profiles(city_id);
