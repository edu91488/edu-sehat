-- Add email column to profiles table
alter table public.profiles
add column email text;

-- Create unique constraint on email
alter table public.profiles
add constraint profiles_email_key unique (email);

-- Update RLS policy to allow admin select all for reporting
create policy "profiles_select_all" on public.profiles for select using (true);
