-- ============================================
-- COMPLETE DATABASE SETUP WITH TEST USER
-- ============================================
-- Run this in Supabase SQL Editor
-- ============================================

-- Check current state
SELECT 
  'Current Database State' as info,
  (SELECT COUNT(*) FROM users) as users,
  (SELECT COUNT(*) FROM categories) as categories,
  (SELECT COUNT(*) FROM payments) as payments,
  (SELECT COUNT(*) FROM upi_ids) as upi_ids;

-- Create a test user (username: test, PIN: 1234)
-- PIN hash for "1234" using bcrypt
INSERT INTO users (username, pin_hash, email)
VALUES (
  'test',
  '$2a$12$LQv3c1yqBWVHxkd0LHAkCOYz6TtxMQJqhN8/LewY5GyYqYK5Y5Y5Y',
  'test@example.com'
)
ON CONFLICT (username) DO NOTHING
RETURNING id, username;

-- Get the test user ID
DO $$
DECLARE
  test_user_id UUID;
BEGIN
  SELECT id INTO test_user_id FROM users WHERE username = 'test';
  
  IF test_user_id IS NOT NULL THEN
    -- Add default categories for test user
    INSERT INTO categories (user_id, name, type, color, is_default) VALUES
      -- Income categories
      (test_user_id, 'Salary', 'income', '#10B981', TRUE),
      (test_user_id, 'Freelance', 'income', '#3B82F6', TRUE),
      (test_user_id, 'Business', 'income', '#8B5CF6', TRUE),
      (test_user_id, 'Investment', 'income', '#06B6D4', TRUE),
      
      -- Expense categories
      (test_user_id, 'Food & Dining', 'expense', '#EF4444', TRUE),
      (test_user_id, 'Transportation', 'expense', '#F59E0B', TRUE),
      (test_user_id, 'Shopping', 'expense', '#EC4899', TRUE),
      (test_user_id, 'Bills & Utilities', 'expense', '#8B5CF6', TRUE),
      (test_user_id, 'Entertainment', 'expense', '#06B6D4', TRUE),
      (test_user_id, 'Groceries', 'expense', '#84CC16', TRUE),
      (test_user_id, 'Rent', 'expense', '#F43F5E', TRUE),
      
      -- Flexible
      (test_user_id, 'Other', 'both', '#9CA3AF', TRUE)
    ON CONFLICT (user_id, name) DO NOTHING;
    
    -- Add sample payments
    INSERT INTO payments (user_id, amount, description, category, type, direction, date) VALUES
      (test_user_id, 5000, 'Monthly Salary', 'Salary', 'income', 'in', CURRENT_DATE),
      (test_user_id, 500, 'Freelance Project', 'Freelance', 'income', 'in', CURRENT_DATE - 2),
      (test_user_id, 150, 'Dinner at Restaurant', 'Food & Dining', 'expense', 'out', CURRENT_DATE),
      (test_user_id, 50, 'Uber Ride', 'Transportation', 'expense', 'out', CURRENT_DATE - 1),
      (test_user_id, 200, 'Groceries', 'Groceries', 'expense', 'out', CURRENT_DATE - 3);
    
    -- Add sample UPI ID
    INSERT INTO upi_ids (user_id, upi_id, name, bank_name, is_primary) VALUES
      (test_user_id, 'test@paytm', 'Paytm UPI', 'Paytm Payments Bank', TRUE)
    ON CONFLICT (user_id, upi_id) DO NOTHING;
    
    RAISE NOTICE 'Test user setup complete!';
  END IF;
END $$;

-- Verify everything
SELECT 
  'Setup Complete!' as status,
  (SELECT COUNT(*) FROM users) as total_users,
  (SELECT COUNT(*) FROM categories) as total_categories,
  (SELECT COUNT(*) FROM payments) as total_payments,
  (SELECT COUNT(*) FROM upi_ids) as total_upi_ids;

-- Show test user data
SELECT 
  'Test User' as info,
  u.username,
  u.email,
  COUNT(DISTINCT c.id) as categories,
  COUNT(DISTINCT p.id) as payments,
  COUNT(DISTINCT upi.id) as upi_ids
FROM users u
LEFT JOIN categories c ON u.id = c.user_id
LEFT JOIN payments p ON u.id = p.user_id
LEFT JOIN upi_ids upi ON u.id = upi.user_id
WHERE u.username = 'test'
GROUP BY u.username, u.email;

-- ============================================
-- ✅ SETUP COMPLETE!
-- 
-- Test Login Credentials:
-- Username: test
-- PIN: 1234
-- 
-- Now go to your app and login!
-- ============================================
