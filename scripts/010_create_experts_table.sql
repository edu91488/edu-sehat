-- Create experts table
CREATE TABLE IF NOT EXISTS public.experts (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  name TEXT NOT NULL,
  specialty TEXT NOT NULL,
  phone_number TEXT,
  email TEXT,
  bio TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_experts_specialty ON public.experts(specialty);
CREATE INDEX IF NOT EXISTS idx_experts_created_at ON public.experts(created_at DESC);

-- Enable RLS
ALTER TABLE public.experts ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for admins
CREATE POLICY "experts_select_all" ON public.experts FOR SELECT USING (true);
CREATE POLICY "experts_insert_admin" ON public.experts FOR INSERT WITH CHECK (true);
CREATE POLICY "experts_update_admin" ON public.experts FOR UPDATE USING (true);
CREATE POLICY "experts_delete_admin" ON public.experts FOR DELETE USING (true);
