-- Update users table to require email, phone, and PIN for all users

-- Add phone number column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number character varying UNIQUE;

-- Make email required (not null)
ALTER TABLE public.users 
ALTER COLUMN email SET NOT NULL;

-- Make pin_hash required again (all users need PIN)
ALTER TABLE public.users 
ALTER COLUMN pin_hash SET NOT NULL;

-- Add indexes for phone number
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- Add constraint to ensure phone number format (optional, adjust regex as needed)
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS phone_number_format 
CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$' OR phone_number IS NULL);

-- Update RLS policies to include phone number checks
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Add function to validate user has all required fields
CREATE OR REPLACE FUNCTION public.validate_user_complete()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.email IS NULL THEN
    RAISE EXCEPTION 'Email is required';
  END IF;
  
  IF NEW.username IS NULL THEN
    RAISE EXCEPTION 'Username is required';
  END IF;
  
  IF NEW.pin_hash IS NULL THEN
    RAISE EXCEPTION 'PIN is required';
  END IF;
  
  IF NEW.phone_number IS NULL THEN
    RAISE EXCEPTION 'Phone number is required';
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Add trigger to validate on insert/update
DROP TRIGGER IF EXISTS validate_user_complete_trigger ON public.users;
CREATE TRIGGER validate_user_complete_trigger
  BEFORE INSERT OR UPDATE ON public.users
  FOR EACH ROW
  EXECUTE FUNCTION public.validate_user_complete();

-- Update existing users to have a default phone if null (for migration)
-- You'll need to update these manually or prompt users to add phone
UPDATE public.users 
SET phone_number = '+1000000000' 
WHERE phone_number IS NULL;

COMMENT ON COLUMN public.users.phone_number IS 'User phone number - required for all users';
COMMENT ON COLUMN public.users.email IS 'User email - required for all users';
COMMENT ON COLUMN public.users.pin_hash IS 'Hashed 4-digit PIN - required for all users';
