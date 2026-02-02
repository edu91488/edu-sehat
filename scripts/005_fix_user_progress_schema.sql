-- Fix user_progress table schema
-- Add missing columns if they don't exist

alter table public.user_progress add column if not exists completed boolean default false;
alter table public.user_progress add column if not exists completed_at timestamptz;

-- Verify the columns exist
-- You can query this after running: SELECT column_name, data_type FROM information_schema.columns WHERE table_name = 'user_progress';
