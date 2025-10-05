-- Create users table for PIN-based authentication
CREATE TABLE IF NOT EXISTS users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  pin_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Create policies for users table
CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (id = auth.uid());

CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (id = auth.uid());

-- Create index for performance
CREATE INDEX IF NOT EXISTS idx_users_id ON users(id);
