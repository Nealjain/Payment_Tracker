-- Fix the direction constraint to match the application code
-- Drop the old constraint and create a new one

-- First, drop the existing constraint
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_direction_check;

-- Add the correct constraint
ALTER TABLE payments ADD CONSTRAINT payments_direction_check 
  CHECK (direction IN ('incoming', 'outgoing'));

-- Verify the constraint
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'payments'::regclass 
AND conname = 'payments_direction_check';
