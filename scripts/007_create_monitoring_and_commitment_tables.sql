-- Create monitoring_responses table
create table if not exists public.monitoring_responses (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  education_stage text not null,
  responses jsonb not null,
  completed_at timestamp with time zone default timezone('utc'::text, now()) not null,
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Create commitment_records table
create table if not exists public.commitment_records (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  commitment_status boolean default false,
  confirmed_at timestamp with time zone,
  education_stage text default 'education-3',
  created_at timestamp with time zone default timezone('utc'::text, now()) not null
);

-- Enable Row Level Security
alter table public.monitoring_responses enable row level security;
alter table public.commitment_records enable row level security;

-- RLS Policies untuk monitoring_responses
create policy "monitoring_responses_select_own" on public.monitoring_responses for select using (auth.uid() = user_id);
create policy "monitoring_responses_insert_own" on public.monitoring_responses for insert with check (auth.uid() = user_id);

-- RLS Policies untuk commitment_records
create policy "commitment_records_select_own" on public.commitment_records for select using (auth.uid() = user_id);
create policy "commitment_records_insert_own" on public.commitment_records for insert with check (auth.uid() = user_id);
create policy "commitment_records_update_own" on public.commitment_records for update using (auth.uid() = user_id);

-- Create indexes
create index if not exists idx_monitoring_responses_user_id on public.monitoring_responses(user_id);
create index if not exists idx_monitoring_responses_stage on public.monitoring_responses(education_stage);
create index if not exists idx_commitment_records_user_id on public.commitment_records(user_id);
create index if not exists idx_commitment_records_stage on public.commitment_records(education_stage);
