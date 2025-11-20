-- Create user attributes table (what the user has, not what they want)
create table if not exists public.user_attributes (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  
  -- Physical attributes
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
  height integer, -- in cm
  
  -- Interests
  sports_hobbies text[],
  favorite_foods text[],
  
  -- Demographics
  race text,
  religion text,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_attributes enable row level security;

-- RLS Policies for user_attributes
create policy "user_attributes_select_all"
  on public.user_attributes for select
  using (true);

create policy "user_attributes_insert_own"
  on public.user_attributes for insert
  with check (auth.uid() = user_id);

create policy "user_attributes_update_own"
  on public.user_attributes for update
  using (auth.uid() = user_id);

create policy "user_attributes_delete_own"
  on public.user_attributes for delete
  using (auth.uid() = user_id);

-- Create index
create index if not exists user_attributes_user_id_idx on public.user_attributes(user_id);
