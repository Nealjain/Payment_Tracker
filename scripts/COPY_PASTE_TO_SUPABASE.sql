-- ============================================
-- COPY AND PASTE THIS ENTIRE SCRIPT TO SUPABASE SQL EDITOR
-- This adds payment approval system and ensures chat is properly configured
-- ============================================

-- Add payment approval columns to group_expense_splits
ALTER TABLE group_expense_splits
ADD COLUMN IF NOT EXISTS payment_requested_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_approved BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_approved_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS payment_rejected BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS payment_rejected_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS rejection_reason TEXT;

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_group_expense_splits_payment_requested 
ON group_expense_splits(payment_requested_at) 
WHERE payment_requested_at IS NOT NULL;

-- Ensure group_messages table exists with correct structure
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

-- Enable RLS on group_messages
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist (to avoid conflicts)
DROP POLICY IF EXISTS "Users can read group messages they have access to" ON group_messages;
DROP POLICY IF EXISTS "Users can send messages to their groups" ON group_messages;
DROP POLICY IF EXISTS "Users can delete their own messages" ON group_messages;

-- RLS Policy: Users can read messages from groups they're members of
CREATE POLICY "Users can read group messages they have access to"
ON group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- RLS Policy: Users can send messages to groups they're members of
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

-- RLS Policy: Users can delete their own messages
CREATE POLICY "Users can delete their own messages"
ON group_messages FOR DELETE
USING (user_id = auth.uid());

-- Function to auto-delete expired messages
CREATE OR REPLACE FUNCTION delete_expired_group_messages()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  DELETE FROM group_messages
  WHERE expires_at < NOW();
END;
$$;

-- Add comments for documentation
COMMENT ON COLUMN group_expense_splits.payment_requested_at IS 'When the member marked payment as done (pending approval)';
COMMENT ON COLUMN group_expense_splits.payment_approved IS 'Whether the payer approved receiving the payment';
COMMENT ON COLUMN group_expense_splits.payment_approved_at IS 'When the payer approved the payment';
COMMENT ON COLUMN group_expense_splits.payment_rejected IS 'Whether the payer rejected the payment claim';
COMMENT ON COLUMN group_expense_splits.payment_rejected_at IS 'When the payer rejected the payment';
COMMENT ON COLUMN group_expense_splits.rejection_reason IS 'Reason for payment rejection';
COMMENT ON FUNCTION delete_expired_group_messages() IS 'Run this function periodically to delete messages older than 30 days';

-- Verification: Check if everything is set up correctly
DO $$
BEGIN
  RAISE NOTICE 'Payment approval columns added to group_expense_splits';
  RAISE NOTICE 'Group messages table created/verified';
  RAISE NOTICE 'RLS policies applied to group_messages';
  RAISE NOTICE 'Setup complete! ✓';
END $$;
