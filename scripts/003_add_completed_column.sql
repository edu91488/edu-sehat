-- Add completed column if it doesn't exist
ALTER TABLE public.user_progress ADD COLUMN IF NOT EXISTS completed boolean DEFAULT false;
