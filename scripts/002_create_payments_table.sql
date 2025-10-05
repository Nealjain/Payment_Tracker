-- Create payments table for expense tracking
CREATE TABLE IF NOT EXISTS payments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  amount DECIMAL(10,2) NOT NULL,
  type VARCHAR(20) NOT NULL CHECK (type IN ('cash', 'online')),
  direction VARCHAR(20) NOT NULL CHECK (direction IN ('incoming', 'outgoing')),
  description TEXT,
  category VARCHAR(100),
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable Row Level Security
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create policies for payments table
CREATE POLICY "Users can view their own payments" ON payments 
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can insert their own payments" ON payments 
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own payments" ON payments 
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own payments" ON payments 
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
CREATE INDEX IF NOT EXISTS idx_payments_date ON payments(date);
CREATE INDEX IF NOT EXISTS idx_payments_type ON payments(type);
CREATE INDEX IF NOT EXISTS idx_payments_direction ON payments(direction);
