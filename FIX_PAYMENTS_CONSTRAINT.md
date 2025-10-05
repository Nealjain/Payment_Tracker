# Fix Payments Direction Constraint

## Issue
Error: `new row for relation "payments" violates check constraint "payments_direction_check"`

## Cause
The database constraint expects different values than what the application is sending.

## Solution

### Option 1: Run SQL Script in Supabase (Recommended)

1. Go to your Supabase Dashboard: https://supabase.com/dashboard
2. Select your project
3. Go to **SQL Editor**
4. Copy and paste this SQL:

```sql
-- Fix the direction constraint to match the application code
ALTER TABLE payments DROP CONSTRAINT IF EXISTS payments_direction_check;

ALTER TABLE payments ADD CONSTRAINT payments_direction_check 
  CHECK (direction IN ('incoming', 'outgoing'));
```

5. Click **Run** or press `Ctrl+Enter`
6. You should see: "Success. No rows returned"

### Option 2: Verify Current Constraint

To check what the current constraint expects, run:

```sql
SELECT conname, pg_get_constraintdef(oid) 
FROM pg_constraint 
WHERE conrelid = 'payments'::regclass 
AND conname = 'payments_direction_check';
```

### Option 3: Update Existing Data (if needed)

If you have existing payments with wrong direction values, update them first:

```sql
-- Check for any invalid values
SELECT DISTINCT direction FROM payments;

-- Update if needed (example: if you have 'in' and 'out')
UPDATE payments SET direction = 'incoming' WHERE direction = 'in';
UPDATE payments SET direction = 'outgoing' WHERE direction = 'out';
```

## After Fix

Once the constraint is fixed, you should be able to:
- Add new payments with "Income" (incoming) or "Expense" (outgoing)
- The error will no longer appear

## Application Values

The application uses:
- `'incoming'` for Income
- `'outgoing'` for Expense

Make sure your database constraint matches these exact values.
