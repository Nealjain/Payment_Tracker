-- Add payment approval fields to group_expense_splits table

-- Add columns for payment approval workflow
ALTER TABLE group_expense_splits
ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_rejected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add index for faster queries
CREATE INDEX IF NOT EXISTS idx_group_expense_splits_payment_requested 
ON group_expense_splits(payment_requested_at) 
WHERE payment_requested_at IS NOT NULL;

COMMENT ON COLUMN group_expense_splits.payment_requested_at IS 'When the member marked payment as done (pending approval)';
COMMENT ON COLUMN group_expense_splits.payment_approved IS 'Whether the payer approved receiving the payment';
COMMENT ON COLUMN group_expense_splits.payment_approved_at IS 'When the payer approved the payment';
COMMENT ON COLUMN group_expense_splits.payment_rejected IS 'Whether the payer rejected the payment claim';
COMMENT ON COLUMN group_expense_splits.payment_rejected_at IS 'When the payer rejected the payment';
COMMENT ON COLUMN group_expense_splits.rejection_reason IS 'Reason for payment rejection';

-- Ensure group_messages table exists with proper structure
CREATE TABLE IF NOT EXISTS group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

-- Add indexes for chat performance
CREATE INDEX IF NOT EXISTS idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX IF NOT EXISTS idx_group_messages_created_at ON group_messages(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_messages_expires_at ON group_messages(expires_at);

-- Add RLS policies for group_messages
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Policy: Users can read messages from groups they're members of
CREATE POLICY "Users can read group messages they have access to"
ON group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Policy: Users can insert messages to groups they're members of
CREATE POLICY "Users can send messages to their groups"
ON group_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
  AND user_id = auth.uid()
);

-- Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON group_messages FOR DELETE
USING (user_id = auth.uid());

-- Create function to auto-delete expired messages
CREATE OR REPLACE FUNCTION delete_expired_group_messages()
RETURNS void AS $$
BEGIN
  DELETE FROM group_messages
  WHERE expires_at < NOW();
END;
$$ LANGUAGE plpgsql;

-- Create scheduled job to clean up expired messages (if pg_cron is available)
-- Otherwise, this should be run periodically via a cron job or scheduled task
COMMENT ON FUNCTION delete_expired_group_messages() IS 'Run this function periodically to delete messages older than 30 days';
