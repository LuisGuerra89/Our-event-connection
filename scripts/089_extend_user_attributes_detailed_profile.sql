-- ============================================================================
-- MIGRATION: Extend User Attributes & Preferences for 54-Point Questionnaire
-- ============================================================================
-- This migration extends user_attributes and user_preferences tables
-- to capture detailed matchmaking data with bidirectional preferences
-- (what user HAS vs what user SEEKS with OPEN_TO_ALL support)
-- ============================================================================

-- ============================================================================
-- PHASE 1: Create Enums for standardized attribute values
-- ============================================================================

-- Hair Length
DO $$ BEGIN
  CREATE TYPE hair_length_enum AS ENUM (
    'very_short', 'short', 'shoulder_length', 'long', 'very_long'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Hair Color
DO $$ BEGIN
  CREATE TYPE hair_color_enum AS ENUM (
    'black', 'dark_brown', 'light_brown', 'blonde', 'red', 'gray', 'white', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Eye Shape
DO $$ BEGIN
  CREATE TYPE eye_shape_enum AS ENUM (
    'round', 'almond', 'monolid', 'hooded', 'upturned', 'downturned', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Eye Color
DO $$ BEGIN
  CREATE TYPE eye_color_enum AS ENUM (
    'blue', 'green', 'brown', 'amber', 'gray', 'hazel', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Nose Shape
DO $$ BEGIN
  CREATE TYPE nose_shape_enum AS ENUM (
    'button', 'snub', 'roman', 'grecian', 'nubian', 'hawk', 'celestial', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Lips Type
DO $$ BEGIN
  CREATE TYPE lips_type_enum AS ENUM (
    'thin', 'average', 'full', 'very_full', 'heart_shaped', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Complexion
DO $$ BEGIN
  CREATE TYPE complexion_enum AS ENUM (
    'fair', 'medium', 'olive', 'dark', 'very_dark', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Body Type
DO $$ BEGIN
  CREATE TYPE body_type_enum AS ENUM (
    'slim', 'athletic', 'average', 'curvy', 'muscular', 'plus_size', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Breast Size
DO $$ BEGIN
  CREATE TYPE breast_size_enum AS ENUM (
    'a', 'b', 'c', 'd', 'e', 'f', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Penis Size
DO $$ BEGIN
  CREATE TYPE penis_size_enum AS ENUM (
    'small', 'average', 'large', 'very_large', 'prefer_not_to_say'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tattoo Status
DO $$ BEGIN
  CREATE TYPE tattoo_status_enum AS ENUM (
    'none', 'small_few', 'several', 'extensive', 'prefer_not_to_say'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Tattoo Locations (can have multiple)
DO $$ BEGIN
  CREATE TYPE tattoo_location_enum AS ENUM (
    'arms', 'chest', 'back', 'legs', 'neck', 'face', 'hands', 'torso'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Religion
DO $$ BEGIN
  CREATE TYPE religion_enum AS ENUM (
    'agnostic', 'atheist', 'buddhist', 'christian', 'hindu', 'jewish', 
    'muslim', 'spiritual_not_religious', 'other', 'prefer_not_to_say'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Marital Status
DO $$ BEGIN
  CREATE TYPE marital_status_enum AS ENUM (
    'single', 'married', 'divorced', 'widowed', 'separated', 'domestic_partnership'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Frequency Type (for habits)
DO $$ BEGIN
  CREATE TYPE frequency_enum AS ENUM (
    'never', 'rarely', 'sometimes', 'often', 'very_often', 'daily'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Gym Type
DO $$ BEGIN
  CREATE TYPE gym_type_enum AS ENUM (
    'no_gym', 'home', 'commercial', 'crossfit', 'boxing', 'pilates', 'yoga', 'multiple', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Housing Status
DO $$ BEGIN
  CREATE TYPE housing_status_enum AS ENUM (
    'renting', 'looking_for_roommate', 'owns_home', 'with_family', 'other'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Dress Code Preference
DO $$ BEGIN
  CREATE TYPE dress_code_enum AS ENUM (
    'casual', 'business_casual', 'business', 'formal', 'athletic', 'mixed'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Relationship Type
DO $$ BEGIN
  CREATE TYPE relationship_type_enum AS ENUM (
    'monogamous', 'open_relationship', 'polyamorous', 'casual_dating', 
    'serious_long_term', 'friendship_first', 'not_sure'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Race/Ethnicity
DO $$ BEGIN
  CREATE TYPE race_enum AS ENUM (
    'white', 'black_african_american', 'hispanic_latino', 'asian', 'middle_eastern',
    'native_american', 'pacific_islander', 'mixed', 'other', 'prefer_not_to_say'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- Preference Importance
DO $$ BEGIN
  CREATE TYPE preference_importance_enum AS ENUM (
    'not_important', 'somewhat_important', 'important', 'very_important', 'open_to_all'
  );
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

-- ============================================================================
-- PHASE 2: Extend user_attributes table with detailed physical & lifestyle info
-- ============================================================================

-- Add columns to user_attributes
ALTER TABLE IF EXISTS public.user_attributes
  ADD COLUMN IF NOT EXISTS forehead_type text,
  ADD COLUMN IF NOT EXISTS cheekbones text,
  ADD COLUMN IF NOT EXISTS buttocks text,
  ADD COLUMN IF NOT EXISTS hand_size text,
  ADD COLUMN IF NOT EXISTS shoe_size text,
  ADD COLUMN IF NOT EXISTS tattoo_status tattoo_status_enum,
  ADD COLUMN IF NOT EXISTS tattoo_locations tattoo_location_enum[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS tattoo_details text,
  
  -- Lifestyle & Habits
  ADD COLUMN IF NOT EXISTS marital_status marital_status_enum,
  ADD COLUMN IF NOT EXISTS makeup_spending_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS likes_massage boolean,
  ADD COLUMN IF NOT EXISTS nails_done_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS facial_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS workout_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS gym_type gym_type_enum,
  ADD COLUMN IF NOT EXISTS sexually_active_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS alcohol_consumption_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS nightclub_bar_frequency frequency_enum,
  ADD COLUMN IF NOT EXISTS likes_outdoors boolean,
  
  -- Demographics & Status
  ADD COLUMN IF NOT EXISTS kids_count integer,
  ADD COLUMN IF NOT EXISTS kids_boys integer,
  ADD COLUMN IF NOT EXISTS kids_girls integer,
  ADD COLUMN IF NOT EXISTS occupation text,
  ADD COLUMN IF NOT EXISTS owns_business boolean,
  ADD COLUMN IF NOT EXISTS business_type text,
  
  -- Housing & Finance
  ADD COLUMN IF NOT EXISTS housing_status housing_status_enum,
  ADD COLUMN IF NOT EXISTS home_purchase_date date,
  ADD COLUMN IF NOT EXISTS interested_in_remodel boolean,
  ADD COLUMN IF NOT EXISTS interested_in_adu boolean,
  ADD COLUMN IF NOT EXISTS interested_in_refinance boolean,
  
  -- Preferences/Interests
  ADD COLUMN IF NOT EXISTS favorite_color text,
  ADD COLUMN IF NOT EXISTS favorite_foods text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS dress_code_preference dress_code_enum,
  ADD COLUMN IF NOT EXISTS relationship_type relationship_type_enum,
  ADD COLUMN IF NOT EXISTS event_categories_liked text[] DEFAULT '{}',
  
  -- Metadata
  ADD COLUMN IF NOT EXISTS questionnaire_completed boolean DEFAULT false,
  ADD COLUMN IF NOT EXISTS questionnaire_completed_at timestamptz;

-- Create index on questionnaire_completed for quick filtering
CREATE INDEX IF NOT EXISTS idx_user_attributes_questionnaire_completed 
  ON public.user_attributes(questionnaire_completed);

-- ============================================================================
-- PHASE 3: Extend user_preferences table with detailed preference matching
-- ============================================================================

-- Extend preferences with importance levels and detailed matching
ALTER TABLE IF EXISTS public.user_preferences
  
  -- Physical Preferences - Importance + Values
  ADD COLUMN IF NOT EXISTS forehead_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS forehead_preference text[],
  
  ADD COLUMN IF NOT EXISTS cheekbones_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS cheekbones_preference text[],
  
  ADD COLUMN IF NOT EXISTS buttocks_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS buttocks_preference text[],
  
  ADD COLUMN IF NOT EXISTS hand_size_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS hand_size_preference text[],
  
  ADD COLUMN IF NOT EXISTS shoe_size_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS shoe_size_min integer,
  ADD COLUMN IF NOT EXISTS shoe_size_max integer,
  
  ADD COLUMN IF NOT EXISTS tattoo_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS tattoo_preference text[],
  
  ADD COLUMN IF NOT EXISTS complexion_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS complexion_preference complexion_enum[],
  
  -- Lifestyle Preferences
  ADD COLUMN IF NOT EXISTS marital_status_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS marital_status_preference marital_status_enum[],
  
  ADD COLUMN IF NOT EXISTS makeup_spending_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS makeup_spending_preference frequency_enum[],
  
  ADD COLUMN IF NOT EXISTS massage_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS wants_massage_partner boolean,
  
  ADD COLUMN IF NOT EXISTS nails_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nails_preference frequency_enum[],
  
  ADD COLUMN IF NOT EXISTS facial_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS facial_preference frequency_enum[],
  
  ADD COLUMN IF NOT EXISTS workout_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS workout_frequency_preference frequency_enum[],
  ADD COLUMN IF NOT EXISTS gym_type_preference gym_type_enum[],
  
  ADD COLUMN IF NOT EXISTS sexually_active_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS sexually_active_preference frequency_enum[],
  
  ADD COLUMN IF NOT EXISTS alcohol_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS alcohol_preference frequency_enum[],
  
  ADD COLUMN IF NOT EXISTS nightclub_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS nightclub_preference frequency_enum[],
  
  ADD COLUMN IF NOT EXISTS outdoors_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS outdoors_preference text[],
  
  -- Demographics
  ADD COLUMN IF NOT EXISTS kids_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS kids_preference text[],
  
  ADD COLUMN IF NOT EXISTS occupation_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS occupation_preference text[],
  
  ADD COLUMN IF NOT EXISTS business_owner_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS wants_business_owner_partner boolean,
  
  -- Housing
  ADD COLUMN IF NOT EXISTS housing_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS housing_preference housing_status_enum[],
  
  -- Preferences
  ADD COLUMN IF NOT EXISTS dress_code_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS dress_code_preference dress_code_enum[],
  
  ADD COLUMN IF NOT EXISTS favorite_color_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS favorite_color_preference text[],
  
  ADD COLUMN IF NOT EXISTS favorite_food_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS favorite_food_preference text[],
  
  ADD COLUMN IF NOT EXISTS relationship_type_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS relationship_type_preference relationship_type_enum[],
  
  ADD COLUMN IF NOT EXISTS event_categories_importance preference_importance_enum DEFAULT 'open_to_all',
  ADD COLUMN IF NOT EXISTS event_categories_preference text[];

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_user_preferences_importance_levels 
  ON public.user_preferences(hair_color_importance, body_type_importance, religion_importance);

-- ============================================================================
-- PHASE 4: Create Preference Scaling Weights (for algorithm)
-- ============================================================================

-- Table to store importance weights for scoring algorithm
CREATE TABLE IF NOT EXISTS public.preference_weights (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  attribute_name text NOT NULL UNIQUE,
  
  -- Weight multipliers for scoring
  not_important_weight decimal(3,2) DEFAULT 1.0,
  somewhat_important_weight decimal(3,2) DEFAULT 2.0,
  important_weight decimal(3,2) DEFAULT 3.0,
  very_important_weight decimal(3,2) DEFAULT 5.0,
  
  -- Category for grouping
  category text NOT NULL, -- 'physical', 'lifestyle', 'demographics', 'preferences'
  
  created_at timestamptz DEFAULT now(),
  updated_at timestamptz DEFAULT now()
);

-- Enable RLS on preference_weights
ALTER TABLE public.preference_weights ENABLE ROW LEVEL SECURITY;

-- RLS Policies (anyone can read, only admin can write)
CREATE POLICY "preference_weights_select_all"
  ON public.preference_weights FOR SELECT
  USING (true);

-- Seed default weights
INSERT INTO public.preference_weights 
  (attribute_name, not_important_weight, somewhat_important_weight, important_weight, very_important_weight, category)
VALUES
  ('hair_color', 1.0, 2.0, 3.0, 5.0, 'physical'),
  ('hair_length', 1.0, 2.0, 3.0, 5.0, 'physical'),
  ('eye_color', 1.0, 2.0, 3.0, 5.0, 'physical'),
  ('body_type', 1.0, 2.0, 3.0, 5.0, 'physical'),
  ('religion', 1.0, 2.0, 3.0, 5.0, 'lifestyle'),
  ('workout_frequency', 1.0, 2.0, 3.0, 5.0, 'lifestyle'),
  ('marital_status', 1.0, 2.0, 3.0, 5.0, 'demographics'),
  ('relationship_type', 1.0, 2.0, 3.0, 5.0, 'preferences')
ON CONFLICT (attribute_name) DO NOTHING;

-- ============================================================================
-- PHASE 5: Create audit/logging table for profile changes
-- ============================================================================

CREATE TABLE IF NOT EXISTS public.profile_attribute_audit (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  attribute_name text NOT NULL,
  old_value text,
  new_value text,
  changed_at timestamptz DEFAULT now(),
  ip_address inet
);

CREATE INDEX IF NOT EXISTS idx_profile_audit_user_id ON public.profile_attribute_audit(user_id);
CREATE INDEX IF NOT EXISTS idx_profile_audit_changed_at ON public.profile_attribute_audit(changed_at DESC);

-- ============================================================================
-- PHASE 6: Update RLS policies for extended attributes
-- ============================================================================

-- Drop old user_attributes policies and create new ones with extended permissions
DROP POLICY IF EXISTS "user_attributes_select_all" ON public.user_attributes;
DROP POLICY IF EXISTS "user_attributes_insert_own" ON public.user_attributes;
DROP POLICY IF EXISTS "user_attributes_update_own" ON public.user_attributes;
DROP POLICY IF EXISTS "user_attributes_delete_own" ON public.user_attributes;

ALTER TABLE public.user_attributes ENABLE ROW LEVEL SECURITY;

CREATE POLICY "user_attributes_select_all"
  ON public.user_attributes FOR SELECT
  USING (true);

CREATE POLICY "user_attributes_insert_own"
  ON public.user_attributes FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "user_attributes_update_own"
  ON public.user_attributes FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "user_attributes_delete_own"
  ON public.user_attributes FOR DELETE
  USING (auth.uid() = user_id);

-- ============================================================================
-- PHASE 7: Helper Functions
-- ============================================================================

-- Function to check if preference is "OPEN TO ALL"
CREATE OR REPLACE FUNCTION public.is_preference_open_to_all(importance preference_importance_enum)
RETURNS boolean
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  RETURN importance = 'open_to_all';
END;
$$;

-- Function to calculate preference weight
CREATE OR REPLACE FUNCTION public.get_preference_weight(importance preference_importance_enum)
RETURNS decimal
LANGUAGE plpgsql
IMMUTABLE
AS $$
BEGIN
  CASE importance
    WHEN 'not_important' THEN RETURN 1.0;
    WHEN 'somewhat_important' THEN RETURN 2.0;
    WHEN 'important' THEN RETURN 3.0;
    WHEN 'very_important' THEN RETURN 5.0;
    WHEN 'open_to_all' THEN RETURN 0.0; -- No scoring impact
    ELSE RETURN 0.0;
  END CASE;
END;
$$;

-- ============================================================================
-- CLEANUP & Verification
-- ============================================================================

-- Verify all new columns exist
ALTER TABLE public.user_attributes ADD CONSTRAINT chk_tattoo_status 
  CHECK (tattoo_status IS NULL OR tattoo_status IN ('none', 'small_few', 'several', 'extensive', 'prefer_not_to_say'));

ALTER TABLE public.user_attributes ADD CONSTRAINT chk_positive_kids
  CHECK (kids_count IS NULL OR kids_count >= 0);

-- Create migration log entry
CREATE TABLE IF NOT EXISTS public.migration_log (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  migration_name text NOT NULL,
  executed_at timestamptz DEFAULT now(),
  status text NOT NULL -- 'success', 'failed'
);

INSERT INTO public.migration_log (migration_name, status)
VALUES ('089_extend_user_attributes_detailed_profile', 'success');

