-- Add updated_at column to matches table
alter table public.matches add column if not exists updated_at timestamptz default now();

-- Create index on updated_at for efficient sorting
create index if not exists matches_updated_at_idx on public.matches(updated_at desc);
