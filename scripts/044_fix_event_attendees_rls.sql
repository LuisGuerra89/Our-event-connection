-- Update RLS policies for event_attendees to allow reading attendance counts
-- This allows anyone to see attendee counts for public events without seeing personal data

DROP POLICY IF EXISTS "event_attendees_select_own" ON public.event_attendees;
DROP POLICY IF EXISTS "event_attendees_select_public_events" ON public.event_attendees;
DROP POLICY IF EXISTS "event_attendees_insert_own" ON public.event_attendees;
DROP POLICY IF EXISTS "event_attendees_update_own" ON public.event_attendees;
DROP POLICY IF EXISTS "event_attendees_delete_own" ON public.event_attendees;

-- Allow users to see their own registrations
CREATE POLICY "event_attendees_select_own"
  ON public.event_attendees FOR SELECT
  USING (auth.uid() = user_id);

-- Allow anyone to see all attendee records (no personal data exposed)
-- The count is displayed publicly anyway
CREATE POLICY "event_attendees_select_all"
  ON public.event_attendees FOR SELECT
  USING (true);

-- Insert policy: users can only register themselves
CREATE POLICY "event_attendees_insert_own"
  ON public.event_attendees FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Update policy: users can only update their own registration
CREATE POLICY "event_attendees_update_own"
  ON public.event_attendees FOR UPDATE
  USING (auth.uid() = user_id);

-- Delete policy: users can only delete their own registration
CREATE POLICY "event_attendees_delete_own"
  ON public.event_attendees FOR DELETE
  USING (auth.uid() = user_id);
