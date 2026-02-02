-- Add current_stage column to track which stage user is on
alter table public.user_progress add column if not exists current_stage boolean default false;

-- Add index for better query performance
create index if not exists idx_user_progress_current_stage on public.user_progress(user_id, current_stage);
