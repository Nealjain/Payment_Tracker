-- Add username field to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS username VARCHAR(50) UNIQUE NOT NULL DEFAULT '';

-- Create index for username lookups
CREATE INDEX IF NOT EXISTS idx_users_username ON users(username);

-- Update RLS policies to include username-based access
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data" ON users 
  FOR SELECT USING (id = auth.uid() OR username = current_setting('app.current_username', true));

CREATE POLICY "Users can update their own data" ON users 
  FOR UPDATE USING (id = auth.uid() OR username = current_setting('app.current_username', true));

-- Function to check if username exists
CREATE OR REPLACE FUNCTION check_username_exists(username_input TEXT)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (SELECT 1 FROM users WHERE username = username_input);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
