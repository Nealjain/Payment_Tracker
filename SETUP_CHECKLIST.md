# Authentication Setup Checklist

Use this checklist to set up authentication for your Expense Tracker app.

## ☐ Step 1: Environment Variables

- [ ] Copy `.env.example` to `.env.local`
- [ ] Add your Supabase project URL
- [ ] Add your Supabase anon key
- [ ] Set `NEXT_PUBLIC_APP_URL` to your app URL

```bash
cp .env.example .env.local
# Edit .env.local with your values
```

## ☐ Step 2: Database Migration

- [ ] Open Supabase SQL Editor
- [ ] Run the migration script: `scripts/005_add_email_auth.sql`
- [ ] Verify the `users` table has an `email` column
- [ ] Verify `pin_hash` is now nullable

## ☐ Step 3: Enable Email Authentication

- [ ] Go to Supabase Dashboard → Authentication → Providers
- [ ] Ensure Email provider is enabled
- [ ] Configure email templates (optional)

## ☐ Step 4: Configure Google OAuth

### In Google Cloud Console:
- [ ] Go to [Google Cloud Console](https://console.cloud.google.com/)
- [ ] Create a new project or select existing
- [ ] Enable Google+ API
- [ ] Go to Credentials → Create Credentials → OAuth 2.0 Client ID
- [ ] Application type: Web application
- [ ] Add authorized redirect URIs:
  - [ ] `https://[your-project-ref].supabase.co/auth/v1/callback`
  - [ ] `http://localhost:3000/auth/callback` (for development)
- [ ] Copy Client ID and Client Secret

### In Supabase Dashboard:
- [ ] Go to Authentication → Providers
- [ ] Find Google and click to configure
- [ ] Enable the Google provider
- [ ] Paste Client ID
- [ ] Paste Client Secret
- [ ] Save changes

## ☐ Step 5: Configure URL Settings

- [ ] Go to Supabase → Authentication → URL Configuration
- [ ] Add Site URL: `http://localhost:3000` (development)
- [ ] Add Redirect URLs:
  - [ ] `http://localhost:3000/auth/callback`
  - [ ] `https://your-production-domain.com/auth/callback` (for production)

## ☐ Step 6: Test Authentication

- [ ] Start the dev server: `pnpm dev`
- [ ] Navigate to `http://localhost:3000/auth`
- [ ] Test Google OAuth sign in
- [ ] Test Email/Password sign up
- [ ] Test Email/Password sign in
- [ ] Test Username/PIN sign up
- [ ] Test Username/PIN sign in
- [ ] Verify redirect to dashboard after login

## ☐ Step 7: Production Deployment (Optional)

- [ ] Update `.env.local` with production values
- [ ] Add production domain to Supabase URL Configuration
- [ ] Update Google OAuth redirect URIs with production domain
- [ ] Enable email verification for production
- [ ] Set up proper SMTP for email delivery
- [ ] Configure rate limiting for auth endpoints
- [ ] Test all auth flows in production

## Troubleshooting

### Google OAuth not working?
- Check redirect URIs match exactly
- Ensure Google+ API is enabled
- Verify Client ID and Secret are correct

### Email not sending?
- Check Supabase email settings
- Verify SMTP configuration
- Check spam folder

### PIN authentication failing?
- Ensure `pin_hash` column exists
- Check bcrypt is installed: `pnpm list bcryptjs`
- Verify PIN is exactly 4 digits

## Need Help?

See `AUTH_SETUP.md` for detailed instructions and troubleshooting.
