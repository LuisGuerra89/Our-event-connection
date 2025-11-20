-- Create events table
create table if not exists public.events (
  id uuid primary key default gen_random_uuid(),
  organizer_id uuid not null references auth.users(id) on delete cascade,
  title text not null,
  description text,
  event_type text check (event_type in ('speed_dating', 'social_mixer', 'activity', 'dinner', 'other')),
  location_name text not null,
  location_address text not null,
  location_city text not null,
  location_state text not null,
  location_country text default 'USA',
  latitude decimal(10, 8),
  longitude decimal(11, 8),
  start_date timestamptz not null,
  end_date timestamptz not null,
  capacity integer,
  current_attendees integer default 0,
  price decimal(10, 2) default 0,
  image_url text,
  status text check (status in ('draft', 'published', 'cancelled', 'completed')) default 'draft',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.events enable row level security;

-- RLS Policies for events
drop policy if exists "events_select_all" on public.events;
drop policy if exists "events_insert_own" on public.events;
drop policy if exists "events_update_own" on public.events;
drop policy if exists "events_delete_own" on public.events;

create policy "events_select_all"
  on public.events for select
  using (status = 'published' or auth.uid() = organizer_id);

create policy "events_insert_own"
  on public.events for insert
  with check (auth.uid() = organizer_id);

create policy "events_update_own"
  on public.events for update
  using (auth.uid() = organizer_id);

create policy "events_delete_own"
  on public.events for delete
  using (auth.uid() = organizer_id);

-- Create indexes
create index if not exists events_organizer_id_idx on public.events(organizer_id);
create index if not exists events_start_date_idx on public.events(start_date);
create index if not exists events_location_city_idx on public.events(location_city);
create index if not exists events_status_idx on public.events(status);
