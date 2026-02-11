-- Add notification_sent_at to user_progress to avoid duplicate email notifications
alter table public.user_progress add column if not exists notification_sent_at timestamptz;