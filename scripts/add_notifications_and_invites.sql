-- ============================================
-- ADD NOTIFICATIONS AND GROUP INVITE SYSTEM
-- ============================================

-- Notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  type VARCHAR NOT NULL CHECK (type IN ('group_invite', 'expense_added', 'payment_request', 'payment_received', 'group_left', 'group_removed')),
  title VARCHAR NOT NULL,
  message TEXT NOT NULL,
  data JSONB DEFAULT '{}',
  is_read BOOLEAN DEFAULT FALSE,
  action_url VARCHAR,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Update group_invites table to support username/email invites
ALTER TABLE group_invites ADD COLUMN IF NOT EXISTS invited_user_id UUID REFERENCES users(id) ON DELETE CASCADE;
ALTER TABLE group_invites ADD COLUMN IF NOT EXISTS invited_email VARCHAR;
ALTER TABLE group_invites ADD COLUMN IF NOT EXISTS invited_username VARCHAR;
ALTER TABLE group_invites ADD COLUMN IF NOT EXISTS status VARCHAR DEFAULT 'pending' CHECK (status IN ('pending', 'accepted', 'rejected', 'expired'));
ALTER TABLE group_invites ADD COLUMN IF NOT EXISTS responded_at TIMESTAMPTZ;

-- Add group UPI ID to groups table
ALTER TABLE groups ADD COLUMN IF NOT EXISTS upi_id VARCHAR;
ALTER TABLE groups ADD COLUMN IF NOT EXISTS upi_name VARCHAR;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_is_read ON notifications(is_read);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_group_invites_invited_user_id ON group_invites(invited_user_id);
CREATE INDEX IF NOT EXISTS idx_group_invites_status ON group_invites(status);

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_data JSONB DEFAULT '{}',
  p_action_url VARCHAR DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url)
  RETURNING id INTO notification_id;
  
  RETURN notification_id;
END;
$$ LANGUAGE plpgsql;

-- Verify
SELECT 
  'Notifications System Created!' as status,
  (SELECT COUNT(*) FROM pg_tables WHERE schemaname = 'public' AND tablename = 'notifications') as notifications_table,
  (SELECT COUNT(*) FROM pg_proc WHERE proname = 'create_notification') as notification_function;
