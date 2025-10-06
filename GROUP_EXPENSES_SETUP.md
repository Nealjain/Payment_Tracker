# Group Expenses & UPI QR Code - Setup Guide

## ✅ What's New

### 1. UPI QR Code Sharing
- Generate QR codes for any UPI ID
- Share QR codes via native share or copy
- Download QR codes as PNG images
- Specify payment amounts in QR codes
- Available on `/upi` page for all your UPI IDs

### 2. Group Expenses (Beta)
- Create expense groups with friends/family
- Track group members and total expenses
- Split bills among group members
- View all your groups in one place
- Invite members to groups (coming soon)

## 🚀 Setup Instructions

### Step 1: Run Database Migration

Open Supabase SQL Editor and run:

```sql
-- Copy and paste from scripts/create_groups_tables.sql
```

This creates the following tables:
- `groups` - Group information
- `group_members` - Group membership
- `group_expenses` - Shared expenses
- `group_expense_splits` - Individual splits
- `group_invites` - Invite codes

### Step 2: Test UPI QR Codes

1. Go to `/upi` page
2. Click "Share QR" on any UPI ID
3. Features:
   - View QR code
   - Copy UPI ID
   - Download QR as image
   - Share via native share

### Step 3: Create Your First Group

1. Go to `/group-expenses`
2. Click "Create Group"
3. Enter group name and description
4. Start adding expenses!

## 📱 Features

### UPI QR Code
- **Generate**: Automatic QR code generation for UPI payments
- **Share**: Native share API support
- **Download**: Save QR codes as PNG
- **Amount**: Optional amount specification
- **Format**: Standard UPI payment string format

### Group Expenses
- **Create Groups**: Organize expenses by group
- **Track Members**: See who's in each group
- **Total Expenses**: View group spending
- **Quick Actions**: Add expenses and invite members
- **Dashboard**: Overview of all groups

## 🔜 Coming Soon

- Add expenses to groups
- Split bills (equal/percentage/custom)
- Settlement tracking
- Payment reminders
- Group invite codes with QR
- Expense history and analytics
- Export group reports

## 🎯 Usage Examples

### UPI QR Code
```typescript
<UpiQRCode 
  upiId="yourname@paytm" 
  name="Your Name"
  amount={500} // Optional
/>
```

### Create Group
```typescript
POST /api/groups
{
  "name": "Roommates",
  "description": "Monthly expenses"
}
```

## 📊 Database Schema

```
groups
├── id (UUID)
├── name (VARCHAR)
├── description (TEXT)
├── created_by (UUID → users.id)
└── timestamps

group_members
├── id (UUID)
├── group_id (UUID → groups.id)
├── user_id (UUID → users.id)
├── role (admin/member)
└── joined_at

group_expenses
├── id (UUID)
├── group_id (UUID → groups.id)
├── paid_by (UUID → users.id)
├── amount (NUMERIC)
├── description (TEXT)
├── split_method (equal/percentage/custom)
└── timestamps

group_expense_splits
├── id (UUID)
├── expense_id (UUID → group_expenses.id)
├── user_id (UUID → users.id)
├── amount (NUMERIC)
├── is_settled (BOOLEAN)
└── settled_at
```

## 🎨 UI Components

- `<UpiQRCode />` - QR code generator with share/download
- Group cards with stats
- Create group dialog
- Member management (coming soon)
- Expense split calculator (coming soon)

## 🔐 Security

- All API routes require authentication
- Users can only see their own groups
- Group admins have special permissions
- Invite codes expire after use

---

**Ready to split bills and share payments!** 🎉
