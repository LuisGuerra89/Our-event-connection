-- Add travel distance preference to user_preferences table
-- This field determines how far a user is willing to travel to meet their match

ALTER TABLE IF EXISTS public.user_preferences
ADD COLUMN IF NOT EXISTS max_travel_distance_miles INTEGER DEFAULT 50;

-- Add comment to the column
COMMENT ON COLUMN public.user_preferences.max_travel_distance_miles IS 'Maximum distance in miles the user is willing to travel to meet their match';

-- Create index for better query performance when filtering by distance
CREATE INDEX IF NOT EXISTS idx_user_preferences_travel_distance 
  ON public.user_preferences(max_travel_distance_miles);
