# Major Update Plan - Glass UI & Full Group Features

## ✅ Completed
1. Created notifications system (database + API)
2. Added glass effect CSS utilities
3. Created notification types

## 🚧 To Implement

### 1. UI Theme Changes
- [ ] Replace black backgrounds with gradient + glass effect
- [ ] Update all pages to use glass cards
- [ ] Add animated gradient background

### 2. Payment Edit Feature
- [ ] Add edit button to payment cards
- [ ] Create edit payment dialog
- [ ] Update payment API route

### 3. Group Invites System
- [ ] API: Invite by username/email
- [ ] API: Accept/reject invites
- [ ] UI: Invite members dialog
- [ ] UI: Pending invites list
- [ ] Notifications for invites

### 4. Group Expenses
- [ ] API: Add expense to group
- [ ] API: View group expenses
- [ ] API: Mark expense as paid
- [ ] UI: Add expense dialog
- [ ] UI: Expense list with split details
- [ ] UI: Pay expense button

### 5. Group Management
- [ ] API: Leave group
- [ ] API: Remove member (admin only)
- [ ] UI: Leave group button
- [ ] UI: Member list with actions
- [ ] Notifications for group changes

### 6. Group QR Code
- [ ] Add UPI ID to group settings
- [ ] Generate group QR code
- [ ] Download/share group QR
- [ ] Copy group UPI ID

### 7. Notifications Page
- [ ] Create notifications page UI
- [ ] Show all notifications
- [ ] Mark as read functionality
- [ ] Action buttons (accept/reject/view)
- [ ] Unread count badge

## 📋 Database Changes Needed

Run in Supabase:
```sql
-- From scripts/add_notifications_and_invites.sql
```

## 🎨 Design System

### Colors
- Primary: Purple (#667eea to #764ba2)
- Glass: rgba(255, 255, 255, 0.1) with blur
- Borders: rgba(255, 255, 255, 0.2)

### Components
- All cards: glass-card class
- Backgrounds: animated-gradient class
- Buttons: glass effect on hover

## 📁 Files to Create/Update

### New Files
- [x] app/globals.css
- [x] lib/types/notifications.ts
- [x] app/api/notifications/route.ts
- [ ] app/notifications/page.tsx
- [ ] app/api/groups/[id]/invite/route.ts
- [ ] app/api/groups/[id]/expenses/route.ts
- [ ] app/api/groups/[id]/leave/route.ts
- [ ] app/api/payments/[id]/route.ts (edit)
- [ ] components/group-invite-dialog.tsx
- [ ] components/group-expense-dialog.tsx
- [ ] components/notification-item.tsx

### Update Files
- [ ] app/dashboard/page.tsx (glass UI)
- [ ] app/payments/page.tsx (glass UI + edit)
- [ ] app/categories/page.tsx (glass UI)
- [ ] app/upi/page.tsx (glass UI)
- [ ] app/group-expenses/page.tsx (full features)
- [ ] app/group-expenses/[id]/page.tsx (new - group detail)
- [ ] components/burger-menu.tsx (notification badge)

## 🚀 Priority Order

1. **Phase 1** (Critical)
   - Glass UI theme
   - Payment edit
   - Notifications page

2. **Phase 2** (Important)
   - Group invites
   - Group expenses
   - Leave group

3. **Phase 3** (Nice to have)
   - Group QR codes
   - Advanced notifications
   - Analytics

Would you like me to implement Phase 1 first?
