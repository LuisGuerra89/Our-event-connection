-- Script to setup automatic event status updates using pg_cron
-- This script creates a function that updates events from 'upcoming' to 'completed'
-- when their end_date has passed

-- Enable pg_cron extension if not already enabled
CREATE EXTENSION IF NOT EXISTS pg_cron;

-- Drop the function if it exists (to avoid conflicts)
DROP FUNCTION IF EXISTS public.update_expired_events() CASCADE;

-- Create the function to update expired events
CREATE FUNCTION public.update_expired_events()
RETURNS void AS $$
BEGIN
  -- Update events where:
  -- 1. Status is 'upcoming'
  -- 2. End date has passed
  -- 3. Status is not 'cancelled'
  UPDATE public.events
  SET 
    status = 'completed',
    updated_at = NOW()
  WHERE 
    status = 'upcoming' 
    AND end_date < NOW()
    AND status != 'cancelled'
    AND deleted_at IS NULL;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission to authenticated users (if needed)
GRANT EXECUTE ON FUNCTION public.update_expired_events() TO authenticated, anon;

-- Schedule the function to run every hour
-- Using cron.schedule directly (works with standard Supabase permissions)
SELECT cron.schedule(
  'update_expired_events',           -- job name
  '0 * * * *',                        -- cron expression (every hour at minute 0)
  'SELECT public.update_expired_events()'
);

-- Alternative schedule options:
-- Every 30 minutes: '*/30 * * * *'
-- Every 15 minutes: '*/15 * * * *'
-- Every day at 00:00: '0 0 * * *'
-- Every day at 12:00: '0 12 * * *'

-- Test the function manually (uncomment to test)
-- SELECT public.update_expired_events();

-- Query to verify events that will be updated in the next run
-- SELECT 
--   id, 
--   title, 
--   status, 
--   end_date,
--   NOW() as current_time,
--   end_date < NOW() as should_update
-- FROM public.events
-- WHERE status = 'upcoming' 
--   AND end_date < NOW()
--   AND deleted_at IS NULL
-- ORDER BY end_date DESC;
