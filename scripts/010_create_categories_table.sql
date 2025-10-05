-- Create categories table
CREATE TABLE IF NOT EXISTS categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  name VARCHAR(100) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense', 'both')),
  color VARCHAR(7) DEFAULT '#B19EEF',
  icon VARCHAR(50),
  is_default BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, name)
);

-- Enable Row Level Security
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own categories" ON categories
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own categories" ON categories
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own categories" ON categories
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own categories" ON categories
  FOR DELETE USING (user_id = auth.uid() AND is_default = FALSE);

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_categories_user_id ON categories(user_id);
CREATE INDEX IF NOT EXISTS idx_categories_type ON categories(type);

-- Insert default categories for new users (you can run this manually or via trigger)
-- Example default categories:
INSERT INTO categories (user_id, name, type, color, is_default) VALUES
  ((SELECT id FROM users LIMIT 1), 'Salary', 'income', '#10B981', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Freelance', 'income', '#3B82F6', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Food & Dining', 'expense', '#EF4444', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Transportation', 'expense', '#F59E0B', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Shopping', 'expense', '#EC4899', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Bills & Utilities', 'expense', '#8B5CF6', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Entertainment', 'expense', '#06B6D4', TRUE),
  ((SELECT id FROM users LIMIT 1), 'Healthcare', 'expense', '#14B8A6', TRUE)
ON CONFLICT (user_id, name) DO NOTHING;
