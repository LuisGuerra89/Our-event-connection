-- Add questionnaire tracking fields to profiles table
-- This migration adds fields to track if users completed the detailed questionnaire

alter table public.profiles 
add column if not exists questionnaire_skipped boolean default false,
add column if not exists questionnaire_skipped_at timestamptz,
add column if not exists questionnaire_completed boolean default false,
add column if not exists questionnaire_completed_at timestamptz;

-- Create indexes for questionnaire tracking
create index if not exists idx_profiles_questionnaire_skipped on public.profiles(questionnaire_skipped);
create index if not exists idx_profiles_questionnaire_completed on public.profiles(questionnaire_completed);

-- Update existing profiles to mark questionnaire as complete if they have attributes
update public.profiles p
set 
  questionnaire_completed = true,
  questionnaire_completed_at = now()
where exists (
  select 1 from public.user_attributes ua
  where ua.user_id = p.id
)
and questionnaire_completed = false;

