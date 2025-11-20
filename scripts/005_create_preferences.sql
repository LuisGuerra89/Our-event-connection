-- Create user preferences table for matchmaking algorithm
create table if not exists public.user_preferences (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade unique,
  
  -- Physical preferences
  hair_color_importance text check (hair_color_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  hair_color_preference text[],
  
  hair_length_importance text check (hair_length_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  hair_length_preference text[],
  
  eye_shape_importance text check (eye_shape_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  eye_shape_preference text[],
  
  eye_color_importance text check (eye_color_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  eye_color_preference text[],
  
  nose_importance text check (nose_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  nose_preference text[],
  
  lips_importance text check (lips_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  lips_preference text[],
  
  breast_size_importance text check (breast_size_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  breast_size_preference text[],
  
  penis_size_importance text check (penis_size_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  penis_size_preference text[],
  
  butt_size_importance text check (butt_size_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  butt_size_preference text[],
  
  hips_importance text check (hips_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  hips_preference text[],
  
  thighs_importance text check (thighs_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  thighs_preference text[],
  
  legs_importance text check (legs_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  legs_preference text[],
  
  body_type_importance text check (body_type_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  body_type_preference text[],
  
  -- Interest preferences
  sports_hobbies_importance text check (sports_hobbies_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  sports_hobbies_preference text[],
  
  food_importance text check (food_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  food_preference text[],
  
  -- Demographic preferences
  race_importance text check (race_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  race_preference text[],
  
  religion_importance text check (religion_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  religion_preference text[],
  
  height_importance text check (height_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  height_min integer,
  height_max integer,
  
  age_importance text check (age_importance in ('important', 'not_important', 'open_to_all')) default 'open_to_all',
  age_min integer,
  age_max integer,
  
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- Enable RLS
alter table public.user_preferences enable row level security;

-- RLS Policies for user_preferences
create policy "user_preferences_select_own"
  on public.user_preferences for select
  using (auth.uid() = user_id);

create policy "user_preferences_insert_own"
  on public.user_preferences for insert
  with check (auth.uid() = user_id);

create policy "user_preferences_update_own"
  on public.user_preferences for update
  using (auth.uid() = user_id);

create policy "user_preferences_delete_own"
  on public.user_preferences for delete
  using (auth.uid() = user_id);

-- Create index
create index if not exists user_preferences_user_id_idx on public.user_preferences(user_id);
