# Production Deployment Guide

## Prerequisites
- Node.js 18+
- Supabase account
- Domain: pay.nealjain.website

## 1. Database Setup

Run these SQL scripts in Supabase SQL Editor (in order):

```bash
1. scripts/create_groups_tables.sql
2. scripts/add_group_chat.sql
3. scripts/add_message_edit_delete.sql
4. scripts/update_chat_expiration.sql
5. scripts/add_payment_approval.sql
6. scripts/add_notifications_and_invites.sql
7. scripts/enable_rls_all_tables.sql
8. scripts/auto_delete_old_messages.sql
9. scripts/schedule_reports.sql
```

## 2. Environment Variables

Create `.env.local` with:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
SUPABASE_URL=your_supabase_url
SUPABASE_ANON_KEY=your_anon_key
NEXT_PUBLIC_APP_URL=https://pay.nealjain.website
NEXT_PUBLIC_APP_DOMAIN=https://pay.nealjain.website
NODE_ENV=production
```

## 3. Install Dependencies

```bash
npm install
```

## 4. Build

```bash
npm run build
```

## 5. Deploy

### Vercel (Recommended)
```bash
vercel --prod
```

### Manual
```bash
npm start
```

## 6. Post-Deployment

1. Test authentication
2. Create a test group
3. Add test expense
4. Generate a report
5. Check notifications

## Domain Configuration

Point `pay.nealjain.website` to your deployment:
- Vercel: Add custom domain in project settings
- Manual: Configure DNS A/CNAME records

## Features Checklist

- ✅ User authentication
- ✅ Payment tracking
- ✅ Group expenses
- ✅ Real-time chat (15-day expiry)
- ✅ Message edit/delete (1-minute window)
- ✅ Payment approval workflow
- ✅ UPI QR codes
- ✅ Excel export
- ✅ PDF reports (monthly/yearly)
- ✅ Notifications
- ✅ Group settings
- ✅ Currency by phone number
- ✅ Dual-mode dashboard

## Monitoring

- Check Supabase logs for errors
- Monitor API response times
- Track user signups
- Review notification delivery

## Support

For issues, check:
1. Supabase logs
2. Browser console
3. Network tab
4. Database RLS policies
