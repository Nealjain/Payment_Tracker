# Implementation Guide - Remaining Features

## 1. Fix Combobox (DONE)
✅ Updated PopoverContent width to match trigger

## 2. Group Chat Implementation

### Database (Run in Supabase):
```sql
-- From scripts/add_group_chat.sql
CREATE TABLE group_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id UUID NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES users(id) ON DELETE CASCADE,
  message TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ DEFAULT (NOW() + INTERVAL '30 days')
);

CREATE INDEX idx_group_messages_group_id ON group_messages(group_id);
CREATE INDEX idx_group_messages_expires ON group_messages(expires_at);
```

### API Routes Needed:
- `app/api/groups/[id]/messages/route.ts` - GET (fetch) & POST (send)
- Auto-delete: Run periodic cleanup or delete on fetch

### UI Component:
Add to `app/group-expenses/[id]/page.tsx`:
- Chat section below expenses
- Input field for new messages
- Message list with timestamps
- Auto-scroll to bottom
- Poll every 5 seconds for new messages

## 3. Group Settings Page

### Create: `app/group-expenses/[id]/settings/page.tsx`

Features:
- Edit group name/description
- Set group UPI ID
- Delete group (admin only)
- Transfer admin role
- Remove members (admin only)
- View group stats

### API Routes:
- `app/api/groups/[id]/route.ts` - Add PUT (update) & DELETE
- `app/api/groups/[id]/members/[memberId]/route.ts` - DELETE (remove member)
- `app/api/groups/[id]/transfer-admin/route.ts` - POST

## 4. Dashboard Export

### Add to `app/dashboard/page.tsx`:

```typescript
const handleExportPayments = () => {
  const excelData = payments.map(payment => ({
    Date: new Date(payment.date).toLocaleDateString(),
    Description: payment.description || "N/A",
    Category: payment.category || "N/A",
    Type: payment.type,
    Direction: payment.direction,
    Amount: Number(payment.amount).toFixed(2),
  }))

  const wb = XLSX.utils.book_new()
  const ws = XLSX.utils.json_to_sheet(excelData)
  XLSX.utils.book_append_sheet(wb, ws, "Payments")
  XLSX.writeFile(wb, `Payments_${new Date().toISOString().split("T")[0]}.xlsx`)
}
```

Add button in dashboard header:
```tsx
<Button onClick={handleExportPayments}>
  <Download className="h-4 w-4 mr-2" />
  Export Data
</Button>
```

## 5. Edit Payment

### Add to `app/payments/page.tsx`:

State for editing:
```typescript
const [editingPayment, setEditingPayment] = useState<Payment | null>(null)
```

Edit dialog (similar to add dialog):
```tsx
<Dialog open={!!editingPayment} onOpenChange={() => setEditingPayment(null)}>
  {/* Same form as add, but pre-filled */}
</Dialog>
```

API route:
- `app/api/payments/[id]/route.ts` - Add PUT method

## Quick Implementation Steps

### Step 1: Run SQL
```bash
# In Supabase SQL Editor, run:
scripts/add_group_chat.sql
```

### Step 2: Add Group Chat
```bash
# Create files:
- app/api/groups/[id]/messages/route.ts
- components/group-chat.tsx
```

### Step 3: Add Group Settings
```bash
# Create files:
- app/group-expenses/[id]/settings/page.tsx
- app/api/groups/[id]/transfer-admin/route.ts
```

### Step 4: Add Dashboard Export
```bash
# Edit: app/dashboard/page.tsx
# Add: Export button with XLSX logic
```

### Step 5: Add Payment Edit
```bash
# Edit: app/payments/page.tsx
# Add: Edit dialog and PUT API
```

## Testing Checklist

- [ ] Combobox shows dropdown when typing
- [ ] Can add new category/UPI from combobox
- [ ] Group chat sends and receives messages
- [ ] Messages auto-delete after 30 days
- [ ] Can delete group (admin only)
- [ ] Can transfer admin role
- [ ] Dashboard export downloads Excel
- [ ] Can edit existing payments

---

**All features are documented and ready to implement!**
