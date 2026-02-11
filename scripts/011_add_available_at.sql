-- Add available_at column to allow scheduling when a stage becomes available
alter table public.user_progress add column if not exists available_at timestamptz;