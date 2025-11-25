-- Create profiles table linked to auth.users
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  email text not null,
  full_name text,
  display_name text,
  date_of_birth date,
  gender text check (gender in ('male', 'female', 'non-binary', 'other')),
  phone text,
  bio text,
  profile_image_url text,
  location_city text,
  location_state text,
  location_country text,
  -- User role and status
  role text default 'user' check (role in ('user', 'admin', 'moderator')),
  status text default 'active' check (status in ('active', 'inactive', 'suspended')),
  -- Referral system fields
  referral_code varchar(10) unique not null,
  referral_count integer default 0,
  referred_by uuid references public.profiles(id) on delete set null,
  free_events_earned integer default 0,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.profiles enable row level security;

-- Create indexes for referral system
create index if not exists idx_profiles_referral_code on public.profiles(referral_code);
create index if not exists idx_profiles_referred_by on public.profiles(referred_by);

-- Create indexes for role and status
create index if not exists idx_profiles_role on public.profiles(role);
create index if not exists idx_profiles_status on public.profiles(status);

-- RLS Policies for profiles
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_select_all" on public.profiles;
drop policy if exists "profiles_insert_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;
drop policy if exists "profiles_delete_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_select_all"
  on public.profiles for select
  using (true);

create policy "profiles_insert_own"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

create policy "profiles_delete_own"
  on public.profiles for delete
  using (auth.uid() = id);

-- Drop existing function and trigger if they exist
drop trigger if exists generate_referral_code_trigger on public.profiles;
drop function if exists public.generate_referral_code();

-- Function to generate unique referral code
create or replace function public.generate_referral_code()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  new.referral_code := substring(
    md5(new.id::text || now()::text || random()::text), 
    1, 
    6
  ) || lpad(floor(random() * 10000)::text, 4, '0');
  return new;
end;
$$;

-- Create trigger to generate referral code before insert
drop trigger if exists generate_referral_code_trigger on public.profiles;
create trigger generate_referral_code_trigger
  before insert on public.profiles
  for each row
  execute function public.generate_referral_code();

-- Create trigger to auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
begin
  insert into public.profiles (id, email, full_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data ->> 'full_name', null)
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
