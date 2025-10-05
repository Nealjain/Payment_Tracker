-- Create UPI IDs table
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
  UNIQUE(user_id, upi_id)
);

-- Enable Row Level Security
ALTER TABLE upi_ids ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their own UPI IDs" ON upi_ids
  FOR SELECT USING (user_id = auth.uid());

CREATE POLICY "Users can create their own UPI IDs" ON upi_ids
  FOR INSERT WITH CHECK (user_id = auth.uid());

CREATE POLICY "Users can update their own UPI IDs" ON upi_ids
  FOR UPDATE USING (user_id = auth.uid());

CREATE POLICY "Users can delete their own UPI IDs" ON upi_ids
  FOR DELETE USING (user_id = auth.uid());

-- Create indexes
CREATE INDEX IF NOT EXISTS idx_upi_ids_user_id ON upi_ids(user_id);
CREATE INDEX IF NOT EXISTS idx_upi_ids_is_primary ON upi_ids(is_primary);

-- Function to ensure only one primary UPI per user
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

-- Create trigger
DROP TRIGGER IF EXISTS trigger_ensure_single_primary_upi ON upi_ids;
CREATE TRIGGER trigger_ensure_single_primary_upi
  BEFORE INSERT OR UPDATE ON upi_ids
  FOR EACH ROW
  EXECUTE FUNCTION ensure_single_primary_upi();
