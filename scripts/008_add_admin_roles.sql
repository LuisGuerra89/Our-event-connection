-- Add role column to profiles table
alter table public.profiles 
add column if not exists role text default 'user' check (role in ('user', 'admin', 'moderator'));

-- Create index for faster role lookups
create index if not exists profiles_role_idx on public.profiles(role);

-- Update RLS policies to allow admins to manage all data

-- Admin can view all profiles
create policy "profiles_admin_all"
  on public.profiles for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can manage all events
create policy "events_admin_all"
  on public.events for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can view all waivers
create policy "waivers_admin_select"
  on public.waivers for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can view all event attendees
create policy "event_attendees_admin_all"
  on public.event_attendees for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can view all matches
create policy "matches_admin_select"
  on public.matches for select
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can view all user attributes
create policy "user_attributes_admin_all"
  on public.user_attributes for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Admin can view all user preferences
create policy "user_preferences_admin_all"
  on public.user_preferences for all
  using (
    exists (
      select 1 from public.profiles
      where id = auth.uid() and role = 'admin'
    )
  );

-- Function to check if user is admin
create or replace function public.is_admin(user_id uuid)
returns boolean
language plpgsql
security definer
as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$;
