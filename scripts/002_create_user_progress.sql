-- Create user_progress table for tracking learning stages
create table if not exists public.user_progress (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  stage_id text not null,
  started_at timestamptz default now(),
  completed boolean default false,
  completed_at timestamptz,
  created_at timestamptz default now(),
  unique(user_id, stage_id)
);

-- Add completed column if it doesn't exist (for existing tables)
alter table public.user_progress add column if not exists completed boolean default false;

-- Enable RLS
alter table public.user_progress enable row level security;

-- RLS policies
create policy "users_select_own_progress" on public.user_progress 
  for select using (auth.uid() = user_id);

create policy "users_insert_own_progress" on public.user_progress 
  for insert with check (auth.uid() = user_id);

create policy "users_update_own_progress" on public.user_progress 
  for update using (auth.uid() = user_id);

create policy "users_delete_own_progress" on public.user_progress 
  for delete using (auth.uid() = user_id);
