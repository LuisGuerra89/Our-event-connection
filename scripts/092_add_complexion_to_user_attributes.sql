-- Add missing columns to user_attributes table
-- This migration adds columns that were referenced in APIs but missing from schema

ALTER TABLE IF EXISTS public.user_attributes
  ADD COLUMN IF NOT EXISTS weight integer,
  ADD COLUMN IF NOT EXISTS skin_tone complexion_enum,
  ADD COLUMN IF NOT EXISTS hobbies text[] DEFAULT '{}',
  ADD COLUMN IF NOT EXISTS complexion complexion_enum;

-- Create indexes for queries
CREATE INDEX IF NOT EXISTS idx_user_attributes_weight ON public.user_attributes(weight);
CREATE INDEX IF NOT EXISTS idx_user_attributes_skin_tone ON public.user_attributes(skin_tone);
CREATE INDEX IF NOT EXISTS idx_user_attributes_complexion ON public.user_attributes(complexion);
