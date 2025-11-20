-- Create event attendees table
create table if not exists public.event_attendees (
  id uuid primary key default gen_random_uuid(),
  event_id uuid not null references public.events(id) on delete cascade,
  user_id uuid not null references auth.users(id) on delete cascade,
  status text check (status in ('registered', 'attended', 'cancelled')) default 'registered',
  registered_at timestamptz default now(),
  created_at timestamptz default now(),
  unique(event_id, user_id)
);

-- Enable RLS
alter table public.event_attendees enable row level security;

-- RLS Policies for event_attendees
create policy "event_attendees_select_own"
  on public.event_attendees for select
  using (auth.uid() = user_id);

create policy "event_attendees_insert_own"
  on public.event_attendees for insert
  with check (auth.uid() = user_id);

create policy "event_attendees_update_own"
  on public.event_attendees for update
  using (auth.uid() = user_id);

create policy "event_attendees_delete_own"
  on public.event_attendees for delete
  using (auth.uid() = user_id);

-- Create indexes
create index if not exists event_attendees_event_id_idx on public.event_attendees(event_id);
create index if not exists event_attendees_user_id_idx on public.event_attendees(user_id);
