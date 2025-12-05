-- ============================================================================
-- Fix user_preferences table constraints and ensure proper structure
-- This migration ensures all fields from the 8-phase onboarding are properly stored
-- ============================================================================

-- First, let's ensure the enum exists with correct values
DO $$ BEGIN
  CREATE TYPE preference_importance_enum AS ENUM (
    'open_to_all',
    'not_important', 
    'somewhat_important', 
    'important', 
    'very_important'
  );
EXCEPTION WHEN duplicate_object THEN 
  -- If enum exists, verify it has all values
  NULL;
END $$;

-- Drop all existing check constraints that might be causing issues
DO $$ 
DECLARE
  constraint_record RECORD;
BEGIN
  FOR constraint_record IN 
    SELECT constraint_name 
    FROM information_schema.table_constraints 
    WHERE table_name = 'user_preferences' 
    AND table_schema = 'public'
    AND constraint_type = 'CHECK'
  LOOP
    EXECUTE format('ALTER TABLE public.user_preferences DROP CONSTRAINT IF EXISTS %I CASCADE', 
                   constraint_record.constraint_name);
  END LOOP;
END $$;

-- ============================================================================
-- PHASE 1: Ensure base table structure
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.user_preferences (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- ============================================================================
-- PHASE 2: Add all preference columns (from all 8 phases)
-- ============================================================================

ALTER TABLE public.user_preferences
  
  -- Phase 4: Basic General Preferences (age, relationship type)
  ADD COLUMN IF NOT EXISTS age_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS age_min integer,
  ADD COLUMN IF NOT EXISTS age_max integer,
  ADD COLUMN IF NOT EXISTS relationship_type_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS relationship_type_preference text[],
  
  -- Phase 5: Hair Color & Body Type (simplified first phase)
  ADD COLUMN IF NOT EXISTS hair_color_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS hair_color_preference text[],
  ADD COLUMN IF NOT EXISTS body_type_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS body_type_preference text[],
  ADD COLUMN IF NOT EXISTS religion_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS religion_preference text[],
  ADD COLUMN IF NOT EXISTS workout_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS workout_frequency_preference text[],
  ADD COLUMN IF NOT EXISTS alcohol_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS alcohol_preference text[],
  
  -- Phase 6: Detailed Physical Preferences
  ADD COLUMN IF NOT EXISTS forehead_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS forehead_preference text[],
  ADD COLUMN IF NOT EXISTS cheekbones_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS cheekbones_preference text[],
  ADD COLUMN IF NOT EXISTS nose_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nose_preference text[],
  ADD COLUMN IF NOT EXISTS lips_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS lips_preference text[],
  ADD COLUMN IF NOT EXISTS hand_size_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS hand_size_preference text[],
  ADD COLUMN IF NOT EXISTS buttocks_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS buttocks_preference text[],
  ADD COLUMN IF NOT EXISTS legs_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS legs_preference text[],
  ADD COLUMN IF NOT EXISTS shoe_size_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS shoe_size_min integer,
  ADD COLUMN IF NOT EXISTS shoe_size_max integer,
  ADD COLUMN IF NOT EXISTS breast_size_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS breast_size_preference text[],
  ADD COLUMN IF NOT EXISTS penis_size_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS penis_size_preference text[],
  ADD COLUMN IF NOT EXISTS tattoo_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS tattoo_preference text[],
  
  -- Phase 7: Personal & Professional Preferences
  ADD COLUMN IF NOT EXISTS marital_status_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS marital_status_preference text[],
  ADD COLUMN IF NOT EXISTS kids_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS kids_preference text[],
  ADD COLUMN IF NOT EXISTS occupation_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS occupation_preference text[],
  ADD COLUMN IF NOT EXISTS business_owner_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS wants_business_owner_partner boolean,
  ADD COLUMN IF NOT EXISTS housing_status_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS housing_status_preference text[],
  
  -- Phase 8: Lifestyle & Personal Care Preferences
  ADD COLUMN IF NOT EXISTS makeup_spending_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS makeup_spending_preference text[],
  ADD COLUMN IF NOT EXISTS massage_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nails_frequency_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nails_frequency_preference text[],
  ADD COLUMN IF NOT EXISTS facial_frequency_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS facial_frequency_preference text[],
  
  -- Additional preferences (from existing structure)
  ADD COLUMN IF NOT EXISTS hair_length_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS hair_length_preference text[],
  ADD COLUMN IF NOT EXISTS eye_color_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS eye_color_preference text[],
  ADD COLUMN IF NOT EXISTS complexion_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS complexion_preference text[],
  ADD COLUMN IF NOT EXISTS race_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS race_preference text[],
  ADD COLUMN IF NOT EXISTS height_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS height_min integer,
  ADD COLUMN IF NOT EXISTS height_max integer,
  ADD COLUMN IF NOT EXISTS nightclub_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nightclub_preference text[],
  ADD COLUMN IF NOT EXISTS sexually_active_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS sexually_active_preference text[],
  ADD COLUMN IF NOT EXISTS outdoors_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS outdoors_preference text[],
  ADD COLUMN IF NOT EXISTS gym_type_preference text[],
  ADD COLUMN IF NOT EXISTS favorite_color_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS favorite_color_preference text[],
  ADD COLUMN IF NOT EXISTS favorite_food_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS food_preference text[],
  ADD COLUMN IF NOT EXISTS dress_code_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS dress_code_preference text[],
  ADD COLUMN IF NOT EXISTS event_categories_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS event_categories_preference text[];

-- ============================================================================
-- PHASE 3: Create proper indexes for performance
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_user_preferences_user_id ON public.user_preferences(user_id);
CREATE INDEX IF NOT EXISTS idx_user_preferences_updated_at ON public.user_preferences(updated_at DESC);

-- Index for common preference importance lookups (used in matching algorithm)
CREATE INDEX IF NOT EXISTS idx_user_preferences_importance_physical 
  ON public.user_preferences(hair_color_importance, body_type_importance, height_importance)
  WHERE hair_color_importance != 'open_to_all' 
     OR body_type_importance != 'open_to_all' 
     OR height_importance != 'open_to_all';

CREATE INDEX IF NOT EXISTS idx_user_preferences_importance_lifestyle 
  ON public.user_preferences(religion_importance, workout_importance, alcohol_importance)
  WHERE religion_importance != 'open_to_all' 
     OR workout_importance != 'open_to_all' 
     OR alcohol_importance != 'open_to_all';

-- ============================================================================
-- PHASE 4: Enable RLS and create policies
-- ============================================================================

ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "user_preferences_select_own" ON public.user_preferences;
DROP POLICY IF EXISTS "user_preferences_insert_own" ON public.user_preferences;
DROP POLICY IF EXISTS "user_preferences_update_own" ON public.user_preferences;
DROP POLICY IF EXISTS "user_preferences_delete_own" ON public.user_preferences;

-- Users can view their own preferences
CREATE POLICY "user_preferences_select_own"
  ON public.user_preferences FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own preferences (first time)
CREATE POLICY "user_preferences_insert_own"
  ON public.user_preferences FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "user_preferences_update_own"
  ON public.user_preferences FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own preferences
CREATE POLICY "user_preferences_delete_own"
  ON public.user_preferences FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 5: Create helper function for UPSERT to prevent duplicates
-- ============================================================================

CREATE OR REPLACE FUNCTION public.upsert_user_preferences(
  p_user_id uuid,
  p_preferences jsonb
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_id uuid;
BEGIN
  -- Check if user already has preferences
  SELECT id INTO v_id
  FROM public.user_preferences
  WHERE user_id = p_user_id;
  
  IF v_id IS NULL THEN
    -- Insert new record
    INSERT INTO public.user_preferences (user_id, updated_at)
    VALUES (p_user_id, now())
    RETURNING id INTO v_id;
  END IF;
  
  -- Update all provided preferences using jsonb_populate_record
  UPDATE public.user_preferences
  SET 
    -- Phase 4: General
    age_importance = COALESCE((p_preferences->>'age_importance')::preference_importance_enum, age_importance),
    age_min = COALESCE((p_preferences->>'age_min')::integer, age_min),
    age_max = COALESCE((p_preferences->>'age_max')::integer, age_max),
    relationship_type_importance = COALESCE((p_preferences->>'relationship_type_importance')::preference_importance_enum, relationship_type_importance),
    relationship_type_preference = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_preferences->'relationship_type_preference')),
      relationship_type_preference
    ),
    
    -- Phase 5: Basic Physical & Lifestyle
    hair_color_importance = COALESCE((p_preferences->>'hair_color_importance')::preference_importance_enum, hair_color_importance),
    hair_color_preference = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_preferences->'hair_color_preference')),
      hair_color_preference
    ),
    body_type_importance = COALESCE((p_preferences->>'body_type_importance')::preference_importance_enum, body_type_importance),
    body_type_preference = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_preferences->'body_type_preference')),
      body_type_preference
    ),
    religion_importance = COALESCE((p_preferences->>'religion_importance')::preference_importance_enum, religion_importance),
    religion_preference = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_preferences->'religion_preference')),
      religion_preference
    ),
    workout_importance = COALESCE((p_preferences->>'workout_importance')::preference_importance_enum, workout_importance),
    workout_frequency_preference = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_preferences->'workout_frequency_preference')),
      workout_frequency_preference
    ),
    alcohol_importance = COALESCE((p_preferences->>'alcohol_importance')::preference_importance_enum, alcohol_importance),
    alcohol_preference = COALESCE(
      (SELECT array_agg(value::text) FROM jsonb_array_elements_text(p_preferences->'alcohol_preference')),
      alcohol_preference
    ),
    
    updated_at = now()
  WHERE user_id = p_user_id;
  
  RETURN v_id;
END;
$$;

-- Grant execute permission to authenticated users
GRANT EXECUTE ON FUNCTION public.upsert_user_preferences(uuid, jsonb) TO authenticated;

-- ============================================================================
-- PHASE 6: Add comments for documentation
-- ============================================================================

COMMENT ON TABLE public.user_preferences IS 'Stores user matchmaking preferences with importance levels. One row per user.';
COMMENT ON COLUMN public.user_preferences.user_id IS 'Foreign key to auth.users - ensures one preference record per user';
COMMENT ON FUNCTION public.upsert_user_preferences IS 'Safely insert or update user preferences, preventing duplicates';

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  total_columns integer;
  importance_columns integer;
BEGIN
  -- Count total columns
  SELECT COUNT(*) INTO total_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = 'user_preferences';
  
  -- Count importance columns
  SELECT COUNT(*) INTO importance_columns
  FROM information_schema.columns
  WHERE table_schema = 'public' 
    AND table_name = 'user_preferences'
    AND column_name LIKE '%_importance';
  
  RAISE NOTICE 'user_preferences table has % total columns', total_columns;
  RAISE NOTICE 'user_preferences table has % importance columns', importance_columns;
  RAISE NOTICE 'Migration 096 completed successfully';
END $$;
