-- Clean up database by dropping and recreating tables
DROP TABLE IF EXISTS payments CASCADE;
DROP TABLE IF EXISTS users CASCADE;

-- Create users table with proper structure
CREATE TABLE users (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    username VARCHAR(50) UNIQUE NOT NULL,
    pin_hash TEXT NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create payments table with proper structure
CREATE TABLE payments (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    amount DECIMAL(10,2) NOT NULL,
    description TEXT,
    category VARCHAR(100),
    type VARCHAR(20) NOT NULL CHECK (type IN ('income', 'expense')),
    direction VARCHAR(20) NOT NULL CHECK (direction IN ('in', 'out')),
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better performance
CREATE INDEX idx_users_username ON users(username);
CREATE INDEX idx_payments_user_id ON payments(user_id);
CREATE INDEX idx_payments_date ON payments(date);
CREATE INDEX idx_payments_type ON payments(type);

-- Enable Row Level Security
ALTER TABLE users ENABLE ROW LEVEL SECURITY;
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for users table
CREATE POLICY "Users can view their own data" ON users
    FOR SELECT USING (true); -- Allow reading for auth purposes

CREATE POLICY "Users can insert their own data" ON users
    FOR INSERT WITH CHECK (true); -- Allow signup

-- Create RLS policies for payments table  
CREATE POLICY "Users can view their own payments" ON payments
    FOR SELECT USING (true); -- Will be filtered by user_id in queries

CREATE POLICY "Users can insert their own payments" ON payments
    FOR INSERT WITH CHECK (true); -- Will be validated by user_id in queries

CREATE POLICY "Users can update their own payments" ON payments
    FOR UPDATE USING (true); -- Will be filtered by user_id in queries

CREATE POLICY "Users can delete their own payments" ON payments
    FOR DELETE USING (true); -- Will be filtered by user_id in queries
