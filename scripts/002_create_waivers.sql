-- Create liability waivers table
create table if not exists public.waivers (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  full_name text not null,
  signature_data text not null,
  agreed_at timestamptz default now(),
  ip_address text,
  waiver_version text default '1.0',
  created_at timestamptz default now()
);

-- Enable RLS
alter table public.waivers enable row level security;

-- RLS Policies for waivers
drop policy if exists "waivers_select_own" on public.waivers;
drop policy if exists "waivers_insert_own" on public.waivers;
drop policy if exists "waivers_update_own" on public.waivers;
drop policy if exists "waivers_delete_own" on public.waivers;

create policy "waivers_select_own"
  on public.waivers for select
  using (auth.uid() = user_id);

create policy "waivers_insert_own"
  on public.waivers for insert
  with check (auth.uid() = user_id);

-- Create index for faster lookups
create index if not exists waivers_user_id_idx on public.waivers(user_id);
