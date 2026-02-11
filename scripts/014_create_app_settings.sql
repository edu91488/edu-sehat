-- Create or update app_settings table to include int_value, text_value and compatibility column `value`
create table if not exists public.app_settings (
  key text primary key,
  int_value integer,
  text_value text,
  value text,
  updated_at timestamptz default now()
);

-- Ensure the columns exist (for older schemas)
alter table public.app_settings add column if not exists int_value integer;
alter table public.app_settings add column if not exists text_value text;
alter table public.app_settings add column if not exists value text;

-- Migrate existing rows: if `value` contains a numeric string and int_value is null, copy it into int_value
update public.app_settings
set int_value = (value::integer)
where int_value is null and value ~ '^[0-9]+$';

-- Also preserve text_value from value when appropriate
update public.app_settings
set text_value = COALESCE(text_value, value)
where text_value is null and value is not null;

-- Insert default delay setting for testing (1 minute) and set `value` to string as well
insert into public.app_settings (key, int_value, value)
values ('notification_delay_minutes', 1, '1')
on conflict (key) do update set int_value = excluded.int_value, value = excluded.value, updated_at = now();
