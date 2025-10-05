-- Add email column to users table if it doesn't exist
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Make pin_hash nullable since users can now sign up with email/password
ALTER TABLE users ALTER COLUMN pin_hash DROP NOT NULL;

-- Add index on email for faster lookups
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);

-- Update RLS policies to work with both auth methods
DROP POLICY IF EXISTS "Users can view their own data" ON users;
DROP POLICY IF EXISTS "Users can update their own data" ON users;

CREATE POLICY "Users can view their own data" ON users
  FOR SELECT
  USING (auth.uid() = id OR id IN (SELECT id FROM users WHERE username = current_setting('app.current_username', true)));

CREATE POLICY "Users can update their own data" ON users
  FOR UPDATE
  USING (auth.uid() = id OR id IN (SELECT id FROM users WHERE username = current_setting('app.current_username', true)));

-- Allow users to insert their own data during signup
CREATE POLICY "Users can insert their own data" ON users
  FOR INSERT
  WITH CHECK (auth.uid() = id);
