-- Add due_date to group_expense_splits
ALTER TABLE group_expense_splits 
ADD COLUMN IF NOT EXISTS due_date DATE;

-- Add index for due date queries
CREATE INDEX IF NOT EXISTS idx_group_expense_splits_due_date 
ON group_expense_splits(due_date) 
WHERE is_settled = FALSE;

-- Verify
SELECT 
  'Due Date Column Added!' as status,
  column_name,
  data_type
FROM information_schema.columns
WHERE table_name = 'group_expense_splits' 
  AND column_name = 'due_date';
