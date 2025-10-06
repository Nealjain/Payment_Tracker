-- Enable RLS and create policies for all tables
-- This fixes the security issues flagged by Supabase linter

-- ============================================
-- USERS TABLE
-- ============================================
ALTER TABLE users ENABLE ROW LEVEL SECURITY;

-- Users can read their own data
CREATE POLICY "Users can read own data"
ON users FOR SELECT
USING (auth.uid() = id);

-- Users can update their own data
CREATE POLICY "Users can update own data"
ON users FOR UPDATE
USING (auth.uid() = id);

-- ============================================
-- USER_PREFERENCES TABLE
-- ============================================
ALTER TABLE user_preferences ENABLE ROW LEVEL SECURITY;

-- Users can read their own preferences
CREATE POLICY "Users can read own preferences"
ON user_preferences FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own preferences
CREATE POLICY "Users can insert own preferences"
ON user_preferences FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own preferences
CREATE POLICY "Users can update own preferences"
ON user_preferences FOR UPDATE
USING (auth.uid() = user_id);

-- ============================================
-- PAYMENTS TABLE
-- ============================================
ALTER TABLE payments ENABLE ROW LEVEL SECURITY;

-- Users can read their own payments
CREATE POLICY "Users can read own payments"
ON payments FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own payments
CREATE POLICY "Users can insert own payments"
ON payments FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own payments
CREATE POLICY "Users can update own payments"
ON payments FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own payments
CREATE POLICY "Users can delete own payments"
ON payments FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- DUES TABLE
-- ============================================
ALTER TABLE dues ENABLE ROW LEVEL SECURITY;

-- Users can read their own dues
CREATE POLICY "Users can read own dues"
ON dues FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own dues
CREATE POLICY "Users can insert own dues"
ON dues FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own dues
CREATE POLICY "Users can update own dues"
ON dues FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own dues
CREATE POLICY "Users can delete own dues"
ON dues FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- CATEGORIES TABLE
-- ============================================
ALTER TABLE categories ENABLE ROW LEVEL SECURITY;

-- Users can read their own categories
CREATE POLICY "Users can read own categories"
ON categories FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own categories
CREATE POLICY "Users can insert own categories"
ON categories FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own categories
CREATE POLICY "Users can update own categories"
ON categories FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own categories
CREATE POLICY "Users can delete own categories"
ON categories FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- UPI_IDS TABLE
-- ============================================
ALTER TABLE upi_ids ENABLE ROW LEVEL SECURITY;

-- Users can read their own UPI IDs
CREATE POLICY "Users can read own upi_ids"
ON upi_ids FOR SELECT
USING (auth.uid() = user_id);

-- Users can insert their own UPI IDs
CREATE POLICY "Users can insert own upi_ids"
ON upi_ids FOR INSERT
WITH CHECK (auth.uid() = user_id);

-- Users can update their own UPI IDs
CREATE POLICY "Users can update own upi_ids"
ON upi_ids FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own UPI IDs
CREATE POLICY "Users can delete own upi_ids"
ON upi_ids FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- GROUPS TABLE
-- ============================================
ALTER TABLE groups ENABLE ROW LEVEL SECURITY;

-- Users can read groups they are members of
CREATE POLICY "Users can read groups they belong to"
ON groups FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = groups.id
    AND group_members.user_id = auth.uid()
  )
);

-- Users can insert groups (they become creator)
CREATE POLICY "Users can create groups"
ON groups FOR INSERT
WITH CHECK (auth.uid() = created_by);

-- Only group creators can update groups
CREATE POLICY "Group creators can update groups"
ON groups FOR UPDATE
USING (auth.uid() = created_by);

-- Only group creators can delete groups
CREATE POLICY "Group creators can delete groups"
ON groups FOR DELETE
USING (auth.uid() = created_by);

-- ============================================
-- GROUP_MEMBERS TABLE
-- ============================================
ALTER TABLE group_members ENABLE ROW LEVEL SECURITY;

-- Users can read members of groups they belong to
CREATE POLICY "Users can read group members"
ON group_members FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
  )
);

-- Group admins can add members
CREATE POLICY "Group admins can add members"
ON group_members FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_members.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- Users can remove themselves, admins can remove others
CREATE POLICY "Users can leave groups or admins can remove"
ON group_members FOR DELETE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM group_members gm
    WHERE gm.group_id = group_members.group_id
    AND gm.user_id = auth.uid()
    AND gm.role = 'admin'
  )
);

-- ============================================
-- GROUP_EXPENSES TABLE
-- ============================================
ALTER TABLE group_expenses ENABLE ROW LEVEL SECURITY;

-- Users can read expenses from their groups
CREATE POLICY "Users can read group expenses"
ON group_expenses FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_expenses.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Group members can add expenses
CREATE POLICY "Group members can add expenses"
ON group_expenses FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_expenses.group_id
    AND group_members.user_id = auth.uid()
  )
  AND auth.uid() = paid_by
);

-- Only the person who paid can update their expense
CREATE POLICY "Payer can update expense"
ON group_expenses FOR UPDATE
USING (auth.uid() = paid_by);

-- Only the person who paid can delete their expense
CREATE POLICY "Payer can delete expense"
ON group_expenses FOR DELETE
USING (auth.uid() = paid_by);

-- ============================================
-- GROUP_EXPENSE_SPLITS TABLE
-- ============================================
ALTER TABLE group_expense_splits ENABLE ROW LEVEL SECURITY;

-- Users can read splits from their group expenses
CREATE POLICY "Users can read expense splits"
ON group_expense_splits FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_expenses ge
    JOIN group_members gm ON gm.group_id = ge.group_id
    WHERE ge.id = group_expense_splits.expense_id
    AND gm.user_id = auth.uid()
  )
);

-- Expense creator can insert splits
CREATE POLICY "Expense creator can add splits"
ON group_expense_splits FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_expenses
    WHERE group_expenses.id = group_expense_splits.expense_id
    AND group_expenses.paid_by = auth.uid()
  )
);

-- Users can update their own splits or payer can update
CREATE POLICY "Users can update splits"
ON group_expense_splits FOR UPDATE
USING (
  auth.uid() = user_id
  OR EXISTS (
    SELECT 1 FROM group_expenses
    WHERE group_expenses.id = group_expense_splits.expense_id
    AND group_expenses.paid_by = auth.uid()
  )
);

-- ============================================
-- GROUP_INVITES TABLE
-- ============================================
ALTER TABLE group_invites ENABLE ROW LEVEL SECURITY;

-- Users can read invites sent to them or from their groups
CREATE POLICY "Users can read relevant invites"
ON group_invites FOR SELECT
USING (
  auth.uid() = invited_user_id
  OR auth.uid() = invited_by
  OR EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_invites.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
);

-- Group admins can create invites
CREATE POLICY "Group admins can create invites"
ON group_invites FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_invites.group_id
    AND group_members.user_id = auth.uid()
    AND group_members.role = 'admin'
  )
  AND auth.uid() = invited_by
);

-- Invited users can update their invite status
CREATE POLICY "Invited users can respond to invites"
ON group_invites FOR UPDATE
USING (auth.uid() = invited_user_id);

-- ============================================
-- NOTIFICATIONS TABLE
-- ============================================
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Users can read their own notifications
CREATE POLICY "Users can read own notifications"
ON notifications FOR SELECT
USING (auth.uid() = user_id);

-- System can insert notifications (handled by backend)
CREATE POLICY "System can create notifications"
ON notifications FOR INSERT
WITH CHECK (true);

-- Users can update their own notifications (mark as read)
CREATE POLICY "Users can update own notifications"
ON notifications FOR UPDATE
USING (auth.uid() = user_id);

-- Users can delete their own notifications
CREATE POLICY "Users can delete own notifications"
ON notifications FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- GROUP_MESSAGES TABLE (if exists)
-- ============================================
ALTER TABLE group_messages ENABLE ROW LEVEL SECURITY;

-- Users can read messages from groups they're members of
CREATE POLICY "Users can read group messages"
ON group_messages FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
);

-- Group members can send messages
CREATE POLICY "Group members can send messages"
ON group_messages FOR INSERT
WITH CHECK (
  EXISTS (
    SELECT 1 FROM group_members
    WHERE group_members.group_id = group_messages.group_id
    AND group_members.user_id = auth.uid()
  )
  AND auth.uid() = user_id
);

-- Users can delete their own messages
CREATE POLICY "Users can delete own messages"
ON group_messages FOR DELETE
USING (auth.uid() = user_id);

-- ============================================
-- FIX FUNCTION SEARCH PATH ISSUES
-- ============================================

-- Fix delete_expired_messages function
CREATE OR REPLACE FUNCTION delete_expired_messages()
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

-- Fix delete_expired_group_messages function (if different)
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

-- Fix create_notification function (if exists)
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type VARCHAR,
  p_title VARCHAR,
  p_message TEXT,
  p_data JSONB DEFAULT '{}'::jsonb,
  p_action_url VARCHAR DEFAULT NULL
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (user_id, type, title, message, data, action_url)
  VALUES (p_user_id, p_type, p_title, p_message, p_data, p_action_url)
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$;

-- Fix ensure_single_primary_upi function
CREATE OR REPLACE FUNCTION ensure_single_primary_upi()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.is_primary = true THEN
    UPDATE upi_ids
    SET is_primary = false
    WHERE user_id = NEW.user_id
    AND id != NEW.id
    AND is_primary = true;
  END IF;
  RETURN NEW;
END;
$$;

-- Fix update_updated_at_column function
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$;

-- Fix check_username_exists function
CREATE OR REPLACE FUNCTION check_username_exists(p_username VARCHAR)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM users WHERE username = p_username
  );
END;
$$;

-- ============================================
-- VERIFICATION QUERIES
-- ============================================

-- Run these to verify RLS is enabled:
-- SELECT tablename, rowsecurity FROM pg_tables WHERE schemaname = 'public';
-- SELECT * FROM pg_policies WHERE schemaname = 'public';

COMMENT ON SCHEMA public IS 'All tables now have RLS enabled with appropriate policies';
