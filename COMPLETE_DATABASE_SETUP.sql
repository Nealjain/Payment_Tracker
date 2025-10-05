-- ============================================
-- COMPLETE DATABASE SETUP FOR PAYDHAN
-- Run this in Supabase SQL Editor
-- ============================================

-- 1. ADD UNIQUE CONSTRAINT TO CATEGORIES
ALTER TABLE categories ADD CONSTRAINT categories_user_id_name_key UNIQUE (user_id, name);

-- 2. CREATE UPI IDS TABLE
CREATE TABLE IF NOT EXISTS upi_ids (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  upi_id VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  bank_name VARCHAR(100),
  is_primary BOOLEAN DEFAULT FALSE,
  is_active BOOLEAN DEFAULT TRUE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  CONSTRAINT upi_ids_user_id_upi_id_key UNIQUE(user_id, upi_id)
);

-- 3. ENABLE RLS ON ALL TABLES
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE upi_ids ENABLE ROW LEVEL SECURITY;

-- 4. DROP EXISTING POLICIES IF ANY (to avoid conflicts)
DROP POLICY IF EXISTS "Users can view their own categories" ON categories;
DROP POLICY IF EXISTS "Users can create their own categories" ON categories;
DROP POLICY IF EXISTS "Users can update their own categories" ON categories;
DROP POLICY IF EXISTS "Users can delete their own categories" ON categories;

DROP POLICY IF EXISTS "Users can view their own UPI IDs" ON upi_ids;
DROP POLICY IF EXISTS "Users can create their own UPI IDs" ON upi_ids;
DROP POLICY IF EXISTS "Users can update their own UPI IDs" ON upi_ids;
DROP POLICY IF EXISTS "Users can delete their own UPI IDs" ON upi_ids;

-- 5. CREATE RLS POLICIES FOR CATEGORIES
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- 6. CREATE RLS POLICIES FOR UPI IDS
CREATE POLICY "Users can view their own UPI IDs" ON upi_ids
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own UPI IDs" ON upi_ids
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own UPI IDs" ON upi_ids
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own UPI IDs" ON upi_ids
  FOR DELETE USING (user_id = auth.uid());

-- 7. CREATE INDEXES FOR PERFORMANCE
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);
CREATE INDEX IF NOT EXISTS idx_upi_ids_user_id ON upi_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_ids_is_primary ON upi_ids(is_primary);

-- 8. CREATE FUNCTION TO ENSURE SINGLE PRIMARY UPI
CREATE OR REPLACE FUNCTION ensure_single_primary_upi()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.is_primary = TRUE THEN
    UPDATE upi_ids 
    SET is_primary = FALSE 
    WHERE user_id = NEW.user_id 
    AND id != NEW.id 
    AND is_primary = TRUE;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. CREATE TRIGGER FOR PRIMARY UPI
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_upi ON upi_ids;
CREATE TRIGGER trigger_ensure_single_primary_upi
  BEFORE INSERT OR UPDATE ON upi_ids
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_upi();

-- 10. INSERT DEFAULT CATEGORIES (Optional - run only once per user)
-- You can manually add these for your user or create a function to add them on signup
-- Replace 'YOUR_USER_ID' with your actual user ID from auth.users

-- Example to get your user ID:
-- SELECT id FROM auth.users WHERE email = 'your-email@example.com';

-- Then insert default categories:
/*
INSERT INTO categories (user_id, name, type, color, is_default) VALUES
  ('YOUR_USER_ID', 'Salary', 'income', '#10B981', TRUE),
  ('YOUR_USER_ID', 'Freelance', 'income', '#3B82F6', TRUE),
  ('YOUR_USER_ID', 'Food & Dining', 'expense', '#EF4444', TRUE),
  ('YOUR_USER_ID', 'Transportation', 'expense', '#F59E0B', TRUE),
  ('YOUR_USER_ID', 'Shopping', 'expense', '#EC4899', TRUE),
  ('YOUR_USER_ID', 'Bills & Utilities', 'expense', '#8B5CF6', TRUE),
  ('YOUR_USER_ID', 'Entertainment', 'expense', '#06B6D4', TRUE),
  ('YOUR_USER_ID', 'Healthcare', 'expense', '#14B8A6', TRUE)
ON CONFLICT (user_id, name) DO NOTHING;
*/

-- 11. VERIFY SETUP
SELECT 'Categories table' as table_name, COUNT(*) as policy_count 
FROM pg_policies WHERE tablename = 'categories'
UNION ALL
SELECT 'UPI IDs table' as table_name, COUNT(*) as policy_count 
FROM pg_policies WHERE tablename = 'upi_ids';

-- Check if tables exist
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
AND table_name IN ('categories', 'upi_ids', 'payments', 'users');

-- ============================================
-- SETUP COMPLETE!
-- ============================================
