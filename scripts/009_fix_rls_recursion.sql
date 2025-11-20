-- Drop the problematic admin policies that cause infinite recursion
drop policy if exists "profiles_admin_all" on public.profiles;
drop policy if exists "events_admin_all" on public.events;
drop policy if exists "waivers_admin_select" on public.waivers;
drop policy if exists "event_attendees_admin_all" on public.event_attendees;
drop policy if exists "matches_admin_select" on public.matches;
drop policy if exists "user_attributes_admin_all" on public.user_attributes;
drop policy if exists "user_preferences_admin_all" on public.user_preferences;

-- Create a security definer function to check admin status (bypasses RLS)
create or replace function public.is_admin()
returns boolean
language plpgsql
security definer
stable
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = auth.uid() and role = 'admin'
  );
end;
$$;

-- Drop new admin policies if they exist (for re-runs)
drop policy if exists "profiles_admin_select" on public.profiles;
drop policy if exists "profiles_admin_update" on public.profiles;
drop policy if exists "profiles_admin_delete" on public.profiles;
drop policy if exists "events_admin_select" on public.events;
drop policy if exists "events_admin_insert" on public.events;
drop policy if exists "events_admin_update" on public.events;
drop policy if exists "events_admin_delete" on public.events;
drop policy if exists "waivers_admin_select" on public.waivers;
drop policy if exists "event_attendees_admin_select" on public.event_attendees;
drop policy if exists "event_attendees_admin_insert" on public.event_attendees;
drop policy if exists "event_attendees_admin_update" on public.event_attendees;
drop policy if exists "event_attendees_admin_delete" on public.event_attendees;
drop policy if exists "matches_admin_select" on public.matches;
drop policy if exists "user_attributes_admin_select" on public.user_attributes;
drop policy if exists "user_attributes_admin_update" on public.user_attributes;
drop policy if exists "user_preferences_admin_select" on public.user_preferences;
drop policy if exists "user_preferences_admin_update" on public.user_preferences;

-- Recreate admin policies using the security definer function

-- Profiles: Admin can manage all profiles
create policy "profiles_admin_select"
  on public.profiles for select
  using (public.is_admin());

create policy "profiles_admin_update"
  on public.profiles for update
  using (public.is_admin());

create policy "profiles_admin_delete"
  on public.profiles for delete
  using (public.is_admin());

-- Events: Admin can manage all events
create policy "events_admin_select"
  on public.events for select
  using (public.is_admin());

create policy "events_admin_insert"
  on public.events for insert
  with check (public.is_admin());

create policy "events_admin_update"
  on public.events for update
  using (public.is_admin());

create policy "events_admin_delete"
  on public.events for delete
  using (public.is_admin());

-- Waivers: Admin can view all waivers
create policy "waivers_admin_select"
  on public.waivers for select
  using (public.is_admin());

-- Event Attendees: Admin can manage all
create policy "event_attendees_admin_select"
  on public.event_attendees for select
  using (public.is_admin());

create policy "event_attendees_admin_insert"
  on public.event_attendees for insert
  with check (public.is_admin());

create policy "event_attendees_admin_update"
  on public.event_attendees for update
  using (public.is_admin());

create policy "event_attendees_admin_delete"
  on public.event_attendees for delete
  using (public.is_admin());

-- Matches: Admin can view all matches
create policy "matches_admin_select"
  on public.matches for select
  using (public.is_admin());

-- User Attributes: Admin can manage all
create policy "user_attributes_admin_select"
  on public.user_attributes for select
  using (public.is_admin());

create policy "user_attributes_admin_update"
  on public.user_attributes for update
  using (public.is_admin());

-- User Preferences: Admin can manage all
create policy "user_preferences_admin_select"
  on public.user_preferences for select
  using (public.is_admin());

create policy "user_preferences_admin_update"
  on public.user_preferences for update
  using (public.is_admin());
