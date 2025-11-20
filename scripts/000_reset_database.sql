-- Reset Database Script
-- WARNING: This will DELETE all data in the database
-- Run this script to start fresh with a clean database

-- Drop all tables in reverse order (to handle foreign keys)
drop table if exists public.matches cascade;
drop table if exists public.user_preferences cascade;
drop table if exists public.user_attributes cascade;
drop table if exists public.event_attendees cascade;
drop table if exists public.events cascade;
drop table if exists public.waivers cascade;
drop table if exists public.profiles cascade;

-- Drop functions
drop function if exists public.handle_new_user() cascade;
drop function if exists public.is_admin(uuid) cascade;
drop function if exists public.update_event_attendees_count() cascade;

-- Now recreate all tables with proper schema

-- 1. Profiles table
create table public.profiles (
  id uuid references auth.users on delete cascade primary key,
  email text unique not null,
  full_name text,
  display_name text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'non-binary', 'other', 'prefer_not_to_say')),
  phone text,
  bio text,
  profile_image_url text,
  location_city text,
  location_state text,
  location_country text,
  role text not null default 'user' check (role in ('user', 'admin', 'moderator')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create is_admin function without recursion
create or replace function public.is_admin(user_id uuid)
returns boolean as $$
begin
  return exists (
    select 1 from public.profiles
    where id = user_id and role = 'admin'
  );
end;
$$ language plpgsql security definer stable;

-- Profiles policies
create policy "profiles_select_all" on public.profiles for select using (true);
create policy "profiles_select_own" on public.profiles for select using (auth.uid() = id);
create policy "profiles_insert_own" on public.profiles for insert with check (auth.uid() = id);
create policy "profiles_update_own" on public.profiles for update using (auth.uid() = id);
create policy "profiles_delete_own" on public.profiles for delete using (auth.uid() = id);
create policy "profiles_admin_select" on public.profiles for select using (is_admin(auth.uid()));
create policy "profiles_admin_update" on public.profiles for update using (is_admin(auth.uid()));
create policy "profiles_admin_delete" on public.profiles for delete using (is_admin(auth.uid()));

-- Function to handle new user signup and make first user admin
create or replace function public.handle_new_user()
returns trigger as $$
declare
  user_count integer;
begin
  -- Count existing profiles
  select count(*) into user_count from public.profiles;
  
  -- Insert profile and make first user admin
  insert into public.profiles (id, email, full_name, role)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'full_name', new.email),
    case when user_count = 0 then 'admin' else 'user' end
  );
  
  return new;
end;
$$ language plpgsql security definer;

-- Trigger for new user
drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Waivers table
create table public.waivers (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  full_name text not null,
  signature_data text not null,
  ip_address text,
  agreed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  waiver_version text default '1.0' not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.waivers enable row level security;

create policy "waivers_select_own" on public.waivers for select using (auth.uid() = user_id);
create policy "waivers_insert_own" on public.waivers for insert with check (auth.uid() = user_id);
create policy "waivers_admin_select" on public.waivers for select using (is_admin(auth.uid()));

-- 3. Events table
create table public.events (
  id uuid default gen_random_uuid() primary key,
  title text not null,
  description text not null,
  event_type text not null check (event_type in ('social', 'sports', 'dining', 'outdoor', 'cultural', 'other')),
  start_date timestamp with time zone not null,
  end_date timestamp with time zone not null,
  location_name text not null,
  location_address text not null,
  location_city text not null,
  location_state text not null,
  location_country text not null,
  latitude numeric(10, 8),
  longitude numeric(11, 8),
  capacity integer not null check (capacity > 0),
  current_attendees integer default 0 not null check (current_attendees >= 0),
  price numeric(10, 2) default 0 not null check (price >= 0),
  image_url text,
  status text default 'upcoming' not null check (status in ('upcoming', 'ongoing', 'completed', 'cancelled')),
  organizer_id uuid references public.profiles(id) on delete cascade not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.events enable row level security;

create policy "events_select_all" on public.events for select using (true);
create policy "events_insert_own" on public.events for insert with check (auth.uid() = organizer_id);
create policy "events_update_own" on public.events for update using (auth.uid() = organizer_id);
create policy "events_delete_own" on public.events for delete using (auth.uid() = organizer_id);
create policy "events_admin_select" on public.events for select using (is_admin(auth.uid()));
create policy "events_admin_insert" on public.events for insert with check (is_admin(auth.uid()));
create policy "events_admin_update" on public.events for update using (is_admin(auth.uid()));
create policy "events_admin_delete" on public.events for delete using (is_admin(auth.uid()));

-- 4. Event Attendees table
create table public.event_attendees (
  id uuid default gen_random_uuid() primary key,
  event_id uuid references public.events(id) on delete cascade not null,
  user_id uuid references public.profiles(id) on delete cascade not null,
  status text default 'registered' not null check (status in ('registered', 'attended', 'cancelled', 'no_show')),
  registered_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(event_id, user_id)
);

alter table public.event_attendees enable row level security;

create policy "event_attendees_select_own" on public.event_attendees for select using (auth.uid() = user_id);
create policy "event_attendees_insert_own" on public.event_attendees for insert with check (auth.uid() = user_id);
create policy "event_attendees_update_own" on public.event_attendees for update using (auth.uid() = user_id);
create policy "event_attendees_delete_own" on public.event_attendees for delete using (auth.uid() = user_id);
create policy "event_attendees_admin_select" on public.events for select using (is_admin(auth.uid()));
create policy "event_attendees_admin_insert" on public.event_attendees for insert with check (is_admin(auth.uid()));
create policy "event_attendees_admin_update" on public.event_attendees for update using (is_admin(auth.uid()));
create policy "event_attendees_admin_delete" on public.event_attendees for delete using (is_admin(auth.uid()));

-- Function to update event attendee count
create or replace function public.update_event_attendees_count()
returns trigger as $$
begin
  if (tg_op = 'INSERT') then
    update public.events set current_attendees = current_attendees + 1 where id = new.event_id;
  elsif (tg_op = 'DELETE') then
    update public.events set current_attendees = current_attendees - 1 where id = old.event_id;
  end if;
  return null;
end;
$$ language plpgsql;

drop trigger if exists update_event_attendees_count on public.event_attendees;
create trigger update_event_attendees_count
  after insert or delete on public.event_attendees
  for each row execute procedure public.update_event_attendees_count();

-- 5. User Preferences table
create table public.user_preferences (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  age_min integer check (age_min >= 18 and age_min <= 100),
  age_max integer check (age_max >= 18 and age_max <= 100),
  age_importance text check (age_importance in ('important', 'not_important', 'open_to_all')),
  height_min integer check (height_min >= 100 and height_min <= 250),
  height_max integer check (height_max >= 100 and height_max <= 250),
  height_importance text check (height_importance in ('important', 'not_important', 'open_to_all')),
  hair_color_preference text[],
  hair_color_importance text check (hair_color_importance in ('important', 'not_important', 'open_to_all')),
  hair_length_preference text[],
  hair_length_importance text check (hair_length_importance in ('important', 'not_important', 'open_to_all')),
  eye_shape_preference text[],
  eye_shape_importance text check (eye_shape_importance in ('important', 'not_important', 'open_to_all')),
  eye_color_preference text[],
  eye_color_importance text check (eye_color_importance in ('important', 'not_important', 'open_to_all')),
  nose_preference text[],
  nose_importance text check (nose_importance in ('important', 'not_important', 'open_to_all')),
  lips_preference text[],
  lips_importance text check (lips_importance in ('important', 'not_important', 'open_to_all')),
  breast_size_preference text[],
  breast_size_importance text check (breast_size_importance in ('important', 'not_important', 'open_to_all')),
  penis_size_preference text[],
  penis_size_importance text check (penis_size_importance in ('important', 'not_important', 'open_to_all')),
  butt_size_preference text[],
  butt_size_importance text check (butt_size_importance in ('important', 'not_important', 'open_to_all')),
  hips_preference text[],
  hips_importance text check (hips_importance in ('important', 'not_important', 'open_to_all')),
  thighs_preference text[],
  thighs_importance text check (thighs_importance in ('important', 'not_important', 'open_to_all')),
  legs_preference text[],
  legs_importance text check (legs_importance in ('important', 'not_important', 'open_to_all')),
  body_type_preference text[],
  body_type_importance text check (body_type_importance in ('important', 'not_important', 'open_to_all')),
  sports_hobbies_preference text[],
  sports_hobbies_importance text check (sports_hobbies_importance in ('important', 'not_important', 'open_to_all')),
  food_preference text[],
  food_importance text check (food_importance in ('important', 'not_important', 'open_to_all')),
  race_preference text[],
  race_importance text check (race_importance in ('important', 'not_important', 'open_to_all')),
  religion_preference text[],
  religion_importance text check (religion_importance in ('important', 'not_important', 'open_to_all')),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_preferences enable row level security;

create policy "user_preferences_select_own" on public.user_preferences for select using (auth.uid() = user_id);
create policy "user_preferences_insert_own" on public.user_preferences for insert with check (auth.uid() = user_id);
create policy "user_preferences_update_own" on public.user_preferences for update using (auth.uid() = user_id);
create policy "user_preferences_delete_own" on public.user_preferences for delete using (auth.uid() = user_id);
create policy "user_preferences_admin_select" on public.user_preferences for select using (is_admin(auth.uid()));
create policy "user_preferences_admin_update" on public.user_preferences for update using (is_admin(auth.uid()));

-- 6. User Attributes table
create table public.user_attributes (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null unique,
  height integer check (height >= 100 and height <= 250),
  hair_color text,
  hair_length text,
  eye_shape text,
  eye_color text,
  nose_type text,
  lips_type text,
  breast_size text,
  penis_size text,
  butt_size text,
  hips_type text,
  thighs_type text,
  legs_type text,
  body_type text,
  sports_hobbies text[],
  favorite_foods text[],
  race text,
  religion text,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  updated_at timestamp with time zone default timezone('utc'::text, now()) not null
);

alter table public.user_attributes enable row level security;

create policy "user_attributes_select_all" on public.user_attributes for select using (true);
create policy "user_attributes_insert_own" on public.user_attributes for insert with check (auth.uid() = user_id);
create policy "user_attributes_update_own" on public.user_attributes for update using (auth.uid() = user_id);
create policy "user_attributes_delete_own" on public.user_attributes for delete using (auth.uid() = user_id);
create policy "user_attributes_admin_select" on public.user_attributes for select using (is_admin(auth.uid()));
create policy "user_attributes_admin_update" on public.user_attributes for update using (is_admin(auth.uid()));

-- 7. Matches table
create table public.matches (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  matched_user_id uuid references public.profiles(id) on delete cascade not null,
  match_score integer check (match_score >= 0 and match_score <= 100),
  created_at timestamp with time zone default timezone('utc'::text, now()) not null,
  unique(user_id, matched_user_id)
);

alter table public.matches enable row level security;

create policy "matches_select_own" on public.matches for select using (auth.uid() = user_id);
create policy "matches_insert_system" on public.matches for insert with check (true);
create policy "matches_admin_select" on public.matches for select using (is_admin(auth.uid()));

-- Create indexes for better performance
create index if not exists profiles_email_idx on public.profiles(email);
create index if not exists profiles_role_idx on public.profiles(role);
create index if not exists waivers_user_id_idx on public.waivers(user_id);
create index if not exists events_start_date_idx on public.events(start_date);
create index if not exists events_organizer_id_idx on public.events(organizer_id);
create index if not exists event_attendees_event_id_idx on public.event_attendees(event_id);
create index if not exists event_attendees_user_id_idx on public.event_attendees(user_id);
create index if not exists matches_user_id_idx on public.matches(user_id);
create index if not exists matches_matched_user_id_idx on public.matches(matched_user_id);
