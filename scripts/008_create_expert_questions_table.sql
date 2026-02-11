-- Create expert_questions table if it doesn't exist
CREATE TABLE IF NOT EXISTS expert_questions (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  subject TEXT NOT NULL,
  question TEXT NOT NULL,
  answer TEXT,
  status VARCHAR(20) DEFAULT 'pending' CHECK (status IN ('pending', 'answered', 'archived')),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  answered_at TIMESTAMP WITH TIME ZONE,
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create index for faster queries
CREATE INDEX IF NOT EXISTS idx_expert_questions_user_id ON expert_questions(user_id);
CREATE INDEX IF NOT EXISTS idx_expert_questions_status ON expert_questions(status);
CREATE INDEX IF NOT EXISTS idx_expert_questions_created_at ON expert_questions(created_at DESC);
