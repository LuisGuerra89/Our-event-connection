-- ============================================================================
-- Add ALL missing attribute columns to user_attributes
-- Migration 097 - Adds all fields needed for complete onboarding
-- ============================================================================

-- First, ensure we have the necessary enums
DO $$ BEGIN
  CREATE TYPE frequency_enum AS ENUM (
    'never', 'rarely', 'sometimes', 'often', 'very_often', 'daily'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE dress_code_enum AS ENUM (
    'casual', 'business_casual', 'business', 'formal', 'athletic', 'mixed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE relationship_type_enum AS ENUM (
    'monogamous', 'open_relationship', 'polyamorous', 'casual_dating', 
    'serious_long_term', 'friendship_first', 'not_sure'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
  CREATE TYPE housing_status_enum AS ENUM (
    'renting', 'looking_for_roommate', 'owns_home', 'with_family', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Add ALL missing physical attribute columns
ALTER TABLE IF EXISTS public.user_attributes
  -- Physical attributes (Phase 6)
  ADD COLUMN IF NOT EXISTS nose text,
  ADD COLUMN IF NOT EXISTS lips text,
  ADD COLUMN IF NOT EXISTS legs text,
  ADD COLUMN IF NOT EXISTS breast_size text,
  ADD COLUMN IF NOT EXISTS penis_size text,
  
  -- Personal info (Phase 7) - Demographics
  ADD COLUMN IF NOT EXISTS has_kids boolean,
  ADD COLUMN IF NOT EXISTS kids_boys integer,
  ADD COLUMN IF NOT EXISTS kids_girls integer,
  ADD COLUMN IF NOT EXISTS owns_business boolean,
  ADD COLUMN IF NOT EXISTS business_type text,
  ADD COLUMN IF NOT EXISTS housing_status housing_status_enum,
  ADD COLUMN IF NOT EXISTS looking_for_roommate boolean,
  
  -- Personal info (Phase 8) - Lifestyle & Preferences
  ADD COLUMN IF NOT EXISTS makeup_spending_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS likes_massage boolean,
  ADD COLUMN IF NOT EXISTS nails_done_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS facial_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS relationship_type_seeking relationship_type_enum,
  ADD COLUMN IF NOT EXISTS favorite_color text,
  ADD COLUMN IF NOT EXISTS dress_code_preference dress_code_enum,
  
  -- Questionnaire status tracking
  ADD COLUMN IF NOT EXISTS questionnaire_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS questionnaire_completed_at timestamptz,
  ADD COLUMN IF NOT EXISTS questionnaire_skipped boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS questionnaire_skipped_at timestamptz;

-- ============================================================================
-- VERIFICATION
-- ============================================================================

DO $$
DECLARE
  missing_columns text[] := '{}';
  col_name text;
BEGIN
  -- Check each required column
  FOREACH col_name IN ARRAY ARRAY[
    'nose', 'lips', 'legs', 'breast_size', 'penis_size',
    'has_kids', 'kids_boys', 'kids_girls', 'owns_business', 'business_type',
    'housing_status', 'looking_for_roommate',
    'makeup_spending_frequency', 'likes_massage', 'nails_done_frequency',
    'facial_frequency', 'relationship_type_seeking', 'favorite_color', 'dress_code_preference',
    'questionnaire_completed', 'questionnaire_completed_at', 'questionnaire_skipped', 'questionnaire_skipped_at'
  ]
  LOOP
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.columns 
      WHERE table_schema = 'public' 
        AND table_name = 'user_attributes' 
        AND column_name = col_name
    ) THEN
      missing_columns := array_append(missing_columns, col_name);
    END IF;
  END LOOP;
  
  IF array_length(missing_columns, 1) > 0 THEN
    RAISE NOTICE 'WARNING: Missing columns after migration: %', missing_columns;
  ELSE
    RAISE NOTICE 'Migration 097 completed successfully! All columns exist.';
  END IF;
END $$;

