-- ============================================================================
-- MIGRATION: Extended Questionnaire - Missing Fields
-- ============================================================================
-- This script adds any missing fields from the comprehensive 54+ questionnaire
-- that may not be in the existing schema
-- ============================================================================

-- ============================================================================
-- PHASE 1: Add missing ENUM types
-- ============================================================================

-- Legs type
DO $$ BEGIN
  CREATE TYPE legs_enum AS ENUM (
    'short', 'average', 'long', 'athletic', 'curvy'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PHASE 2: Extend user_attributes with missing fields
-- ============================================================================

ALTER TABLE IF EXISTS public.user_attributes
  -- Add legs column if not exists
  ADD COLUMN IF NOT EXISTS legs text,
  
  -- Add has_kids boolean for quick filtering
  ADD COLUMN IF NOT EXISTS has_kids boolean DEFAULT false,
  
  -- Add looking for roommate flag
  ADD COLUMN IF NOT EXISTS looking_for_roommate boolean DEFAULT false,
  
  -- Add remodeling details
  ADD COLUMN IF NOT EXISTS remodeling_type text,
  
  -- Add networking events preference
  ADD COLUMN IF NOT EXISTS likes_networking_events boolean;

-- Fix shoe_size type from text to numeric if it exists
DO $$ 
BEGIN
  -- Check if shoe_size column exists and is text type
  IF EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_schema = 'public' 
      AND table_name = 'user_attributes' 
      AND column_name = 'shoe_size'
      AND data_type = 'text'
  ) THEN
    -- Convert text to numeric (will set NULL for non-numeric values)
    ALTER TABLE public.user_attributes 
      ALTER COLUMN shoe_size TYPE numeric USING (
        CASE 
          WHEN shoe_size ~ '^[0-9]+\.?[0-9]*$' 
          THEN shoe_size::numeric 
          ELSE NULL 
        END
      );
    RAISE NOTICE 'Converted shoe_size from text to numeric';
  END IF;
END $$;

-- ============================================================================
-- PHASE 3: Extend user_preferences with missing preference fields
-- ============================================================================

ALTER TABLE IF EXISTS public.user_preferences
  -- Legs preferences
  ADD COLUMN IF NOT EXISTS legs_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS legs_preference text[],
  
  -- Eye shape preferences (if missing)
  ADD COLUMN IF NOT EXISTS eye_shape_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS eye_shape_preference text[],
  
  -- Nose preferences (if missing)
  ADD COLUMN IF NOT EXISTS nose_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nose_preference text[],
  
  -- Lips preferences (if missing)
  ADD COLUMN IF NOT EXISTS lips_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS lips_preference text[],
  
  -- Tattoo location preferences
  ADD COLUMN IF NOT EXISTS tattoo_location_preference text[],
  
  -- Networking events importance
  ADD COLUMN IF NOT EXISTS networking_events_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS likes_networking_events boolean;

-- ============================================================================
-- PHASE 4: Create indexes for performance on new fields
-- ============================================================================

-- Index on legs for filtering
CREATE INDEX IF NOT EXISTS idx_user_attributes_legs 
  ON public.user_attributes(legs);

-- Index on has_kids for quick filtering
CREATE INDEX IF NOT EXISTS idx_user_attributes_has_kids 
  ON public.user_attributes(has_kids);

-- Index on looking_for_roommate
CREATE INDEX IF NOT EXISTS idx_user_attributes_looking_for_roommate 
  ON public.user_attributes(looking_for_roommate);

-- Composite index for physical matching
CREATE INDEX IF NOT EXISTS idx_user_attributes_physical_composite
  ON public.user_attributes(body_type, height, complexion, hair_color);

-- Composite index for lifestyle matching
CREATE INDEX IF NOT EXISTS idx_user_attributes_lifestyle_composite
  ON public.user_attributes(workout_frequency, alcohol_consumption_frequency, marital_status);

-- ============================================================================
-- PHASE 5: Update existing data to set has_kids flag
-- ============================================================================

-- Update has_kids based on kids_count
UPDATE public.user_attributes
SET has_kids = true
WHERE kids_count > 0 AND has_kids IS NULL;

UPDATE public.user_attributes
SET has_kids = false
WHERE kids_count = 0 AND has_kids IS NULL;

-- Update looking_for_roommate based on housing_status
UPDATE public.user_attributes
SET looking_for_roommate = true
WHERE housing_status = 'looking_for_roommate' AND looking_for_roommate IS NULL;

-- ============================================================================
-- PHASE 6: Add validation constraints
-- ============================================================================

-- Ensure kids counts are non-negative
ALTER TABLE public.user_attributes 
  DROP CONSTRAINT IF EXISTS chk_kids_boys_non_negative;

ALTER TABLE public.user_attributes 
  ADD CONSTRAINT chk_kids_boys_non_negative 
  CHECK (kids_boys IS NULL OR kids_boys >= 0);

ALTER TABLE public.user_attributes 
  DROP CONSTRAINT IF EXISTS chk_kids_girls_non_negative;

ALTER TABLE public.user_attributes 
  ADD CONSTRAINT chk_kids_girls_non_negative 
  CHECK (kids_girls IS NULL OR kids_girls >= 0);

-- Ensure shoe size is reasonable (now that it's numeric)
ALTER TABLE public.user_attributes 
  DROP CONSTRAINT IF EXISTS chk_shoe_size_reasonable;

ALTER TABLE public.user_attributes 
  ADD CONSTRAINT chk_shoe_size_reasonable 
  CHECK (shoe_size IS NULL OR (shoe_size >= 1 AND shoe_size <= 20));

-- Ensure height is reasonable (in cm)
ALTER TABLE public.user_attributes 
  DROP CONSTRAINT IF EXISTS chk_height_reasonable;

ALTER TABLE public.user_attributes 
  ADD CONSTRAINT chk_height_reasonable 
  CHECK (height IS NULL OR (height >= 100 AND height <= 250));

-- ============================================================================
-- PHASE 7: Add helpful views for matching
-- ============================================================================

-- View: Users with complete questionnaires
CREATE OR REPLACE VIEW public.v_users_questionnaire_complete AS
SELECT 
  p.id as user_id,
  p.email,
  p.full_name,
  p.gender,
  p.date_of_birth,
  ua.questionnaire_completed,
  ua.questionnaire_completed_at,
  ua.height,
  ua.body_type,
  ua.race,
  ua.religion,
  ua.marital_status,
  ua.has_kids,
  ua.occupation,
  ua.housing_status,
  ua.relationship_type
FROM public.profiles p
LEFT JOIN public.user_attributes ua ON p.id = ua.user_id
WHERE ua.questionnaire_completed = true;

-- Grant select permission on view
GRANT SELECT ON public.v_users_questionnaire_complete TO authenticated;

-- View: Matchable users (completed questionnaire)
CREATE OR REPLACE VIEW public.v_matchable_users AS
SELECT 
  ua.user_id,
  p.email,
  p.full_name,
  p.gender,
  p.date_of_birth,
  p.location_city,
  p.location_state,
  ua.height,
  ua.body_type,
  ua.race,
  ua.religion,
  ua.marital_status,
  ua.has_kids,
  ua.occupation,
  ua.housing_status,
  ua.relationship_type,
  ua.hair_color,
  ua.hair_length,
  ua.eye_color,
  ua.complexion,
  ua.workout_frequency,
  ua.alcohol_consumption_frequency,
  ua.questionnaire_completed,
  ua.questionnaire_completed_at,
  ua.legs,
  ua.shoe_size,
  ua.looking_for_roommate,
  ua.likes_networking_events
FROM public.profiles p
INNER JOIN public.user_attributes ua ON p.id = ua.user_id
WHERE 
  ua.questionnaire_completed = true;

-- Grant select permission on view
GRANT SELECT ON public.v_matchable_users TO authenticated;

-- ============================================================================
-- PHASE 8: Create functions for questionnaire stats
-- ============================================================================

-- Function to get questionnaire completion rate
CREATE OR REPLACE FUNCTION public.get_questionnaire_completion_rate()
RETURNS decimal
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  total_users integer;
  completed_users integer;
  completion_rate decimal;
BEGIN
  SELECT COUNT(*) INTO total_users FROM public.profiles;
  SELECT COUNT(*) INTO completed_users 
  FROM public.user_attributes 
  WHERE questionnaire_completed = true;
  
  IF total_users > 0 THEN
    completion_rate := (completed_users::decimal / total_users::decimal) * 100;
  ELSE
    completion_rate := 0;
  END IF;
  
  RETURN ROUND(completion_rate, 2);
END;
$$;

-- Function to check if a user's questionnaire is complete
CREATE OR REPLACE FUNCTION public.is_questionnaire_complete(p_user_id uuid)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  is_complete boolean;
BEGIN
  SELECT questionnaire_completed INTO is_complete
  FROM public.user_attributes
  WHERE user_id = p_user_id;
  
  RETURN COALESCE(is_complete, false);
END;
$$;

-- ============================================================================
-- PHASE 9: Update RLS policies if needed
-- ============================================================================

-- Ensure user_preferences policies allow upserts
DROP POLICY IF EXISTS "user_preferences_insert_own" ON public.user_preferences;
DROP POLICY IF EXISTS "user_preferences_update_own" ON public.user_preferences;

CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 10: Add trigger to automatically update profile completeness
-- ============================================================================

-- Function to update profile when questionnaire is completed
CREATE OR REPLACE FUNCTION public.update_profile_on_questionnaire_complete()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  IF NEW.questionnaire_completed = true AND OLD.questionnaire_completed IS DISTINCT FROM NEW.questionnaire_completed THEN
    UPDATE public.profiles
    SET 
      questionnaire_completed = true,
      updated_at = now()
    WHERE id = NEW.user_id;
  END IF;
  
  RETURN NEW;
END;
$$;

-- Drop trigger if exists and recreate
DROP TRIGGER IF EXISTS trg_update_profile_on_questionnaire_complete ON public.user_attributes;

CREATE TRIGGER trg_update_profile_on_questionnaire_complete
  AFTER UPDATE ON public.user_attributes
  FOR EACH ROW
  EXECUTE FUNCTION public.update_profile_on_questionnaire_complete();

-- ============================================================================
-- CLEANUP & Verification
-- ============================================================================

-- Log migration
INSERT INTO public.migration_log (migration_name, status)
VALUES ('093_extended_questionnaire_missing_fields', 'success')
ON CONFLICT DO NOTHING;

-- Display summary
DO $$
DECLARE
  total_attrs integer;
  total_prefs integer;
BEGIN
  SELECT COUNT(*) INTO total_attrs FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'user_attributes';
  
  SELECT COUNT(*) INTO total_prefs FROM information_schema.columns 
  WHERE table_schema = 'public' AND table_name = 'user_preferences';
  
  RAISE NOTICE 'Migration complete!';
  RAISE NOTICE 'Total user_attributes columns: %', total_attrs;
  RAISE NOTICE 'Total user_preferences columns: %', total_prefs;
END $$;
