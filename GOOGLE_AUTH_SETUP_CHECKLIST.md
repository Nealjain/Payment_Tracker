# Google Authentication Setup Checklist

## ✅ What You've Done
- Set up Google OAuth provider in Supabase Dashboard

## 🔍 Verify Your Setup

### 1. Check Supabase Configuration

Go to your Supabase Dashboard and verify:

**Authentication → Providers → Google**
- [ ] Google provider is **Enabled**
- [ ] Client ID is filled in
- [ ] Client Secret is filled in
- [ ] Authorized Client IDs (optional) is configured if needed

### 2. Check Google Cloud Console

Go to [Google Cloud Console](https://console.cloud.google.com/):

**APIs & Services → Credentials → Your OAuth 2.0 Client**
- [ ] Authorized JavaScript origins includes:
  - `http://localhost:3000` (for development)
  - Your production domain (if deployed)
  
- [ ] Authorized redirect URIs includes:
  - `https://[your-project-ref].supabase.co/auth/v1/callback`
  - `http://localhost:3000/auth/callback` (for development)

### 3. Check Environment Variables

Your `.env.local` should have:

```bash
NEXT_PUBLIC_SUPABASE_URL=https://[your-project-ref].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key_here
SUPABASE_URL=https://[your-project-ref].supabase.co
SUPABASE_ANON_KEY=your_anon_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 4. Check Supabase URL Configuration

**Authentication → URL Configuration**
- [ ] Site URL: `http://localhost:3000` (development)
- [ ] Redirect URLs includes:
  - `http://localhost:3000/auth/callback`
  - `http://localhost:3000/**` (wildcard for development)

## 🧪 Test Google Login

### Test Flow:
1. Start your dev server: `pnpm dev`
2. Go to `http://localhost:3000/auth`
3. Click "Continue with Google" button
4. You should be redirected to Google login
5. After login, you should be redirected back to your app
6. Check if you land on `/dashboard`

### Expected Behavior:

```
User clicks "Continue with Google"
  ↓
Redirected to Google login page
  ↓
User logs in with Google account
  ↓
Google redirects to: https://[project].supabase.co/auth/v1/callback
  ↓
Supabase processes OAuth
  ↓
Redirects to: http://localhost:3000/auth/callback
  ↓
Your app creates user record (if new)
  ↓
Creates session
  ↓
Redirects to: http://localhost:3000/dashboard
```

## 🐛 Troubleshooting

### Issue: "Redirect URI mismatch"
**Solution:** 
- Check that redirect URIs in Google Console exactly match Supabase callback URL
- Format: `https://[your-project-ref].supabase.co/auth/v1/callback`
- No trailing slashes!

### Issue: "Invalid client"
**Solution:**
- Verify Client ID and Secret are correct in Supabase
- Make sure you copied them correctly (no extra spaces)

### Issue: "Access blocked: This app's request is invalid"
**Solution:**
- Enable Google+ API in Google Cloud Console
- Go to: APIs & Services → Library → Search "Google+ API" → Enable

### Issue: User redirected but not logged in
**Solution:**
- Check browser console for errors
- Verify `app/auth/callback/route.ts` exists and is working
- Check Supabase logs in Dashboard → Logs

### Issue: "User already registered" error
**Solution:**
- This is expected if email already exists with different auth method
- User needs to sign in with original method
- Or implement account linking

## 📝 Database Check

After first Google login, verify user was created:

```sql
-- Run in Supabase SQL Editor
SELECT id, username, email, created_at 
FROM users 
WHERE email = 'your-google-email@gmail.com';
```

You should see a new user record with:
- `id` matching Supabase auth user ID
- `username` auto-generated from email
- `email` from Google account
- `pin_hash` is NULL (Google users don't need PIN)

## 🔐 Security Notes

### Production Checklist:
- [ ] Update Site URL to production domain
- [ ] Update redirect URIs to production domain
- [ ] Remove localhost from authorized origins (production)
- [ ] Enable email verification
- [ ] Set up proper SMTP for emails
- [ ] Configure rate limiting
- [ ] Enable MFA (optional)

## 🎯 Next Steps

Once Google login is working:

1. **Test the full flow:**
   - Sign up with Google
   - Sign out
   - Sign in with Google again
   - Verify dashboard loads

2. **Test with different accounts:**
   - Try with multiple Google accounts
   - Verify each gets separate user record

3. **Test error cases:**
   - Cancel Google login (should return to auth page)
   - Try with blocked/restricted account

4. **Add user feedback:**
   - Loading states during OAuth
   - Error messages if login fails
   - Success message after login

## 📊 Monitoring

Check these in Supabase Dashboard:

**Authentication → Users**
- See all users who signed up
- Check auth provider (should show "google")

**Authentication → Logs**
- Monitor login attempts
- Check for errors
- See OAuth flow details

## 🚀 You're Ready!

If all checks pass, your Google authentication is fully set up and working! 

Users can now:
- ✅ Sign up with Google
- ✅ Sign in with Google
- ✅ Have automatic user records created
- ✅ Access the dashboard

---

## Quick Test Command

Run this to test everything:

```bash
# 1. Make sure env vars are set
cat .env.local

# 2. Start dev server
pnpm dev

# 3. Open browser
open http://localhost:3000/auth

# 4. Click "Continue with Google"
# 5. Complete Google login
# 6. Should redirect to dashboard ✅
```

Need help with any specific issue? Let me know!
