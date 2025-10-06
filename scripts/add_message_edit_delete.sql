-- Add edit/delete functionality to group messages
ALTER TABLE group_messages
ADD COLUMN IF NOT EXISTS edited_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS is_deleted BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS deleted_at TIMESTAMPTZ;

-- Add index for better performance
CREATE INDEX IF NOT EXISTS idx_group_messages_not_deleted 
ON group_messages(group_id, created_at) 
WHERE is_deleted = FALSE;
