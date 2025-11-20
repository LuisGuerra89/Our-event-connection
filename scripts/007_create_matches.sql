-- Create matches table to store calculated matches
create table if not exists public.matches (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  matched_user_id uuid not null references auth.users(id) on delete cascade,
  match_score integer check (match_score >= 0 and match_score <= 100),
  created_at timestamptz default now(),
  unique(user_id, matched_user_id)
);

-- Enable RLS
alter table public.matches enable row level security;

-- RLS Policies for matches
drop policy if exists "matches_select_own" on public.matches;
drop policy if exists "matches_insert_system" on public.matches;

create policy "matches_select_own"
  on public.matches for select
  using (auth.uid() = user_id);

create policy "matches_insert_system"
  on public.matches for insert
  with check (true);

-- Create indexes
create index if not exists matches_user_id_idx on public.matches(user_id);
create index if not exists matches_matched_user_id_idx on public.matches(matched_user_id);
create index if not exists matches_score_idx on public.matches(match_score desc);
