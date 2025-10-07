# Auth Flow Testing Guide

## Current Status
✅ Check-email endpoint created
✅ Signin endpoint with logging
✅ Signup endpoint ready
✅ Middleware fixed to use JWT sessions

## How to Test

### 1. Open Browser Console
Press F12 and go to the Console tab to see debug logs

### 2. Test New User Signup

1. Go to `/auth`
2. Enter a NEW email (one you haven't used before)
3. You should see in console: `🔐 Checking email...`
4. If email doesn't exist, you'll see the signup flow
5. Complete all steps:
   - Password (min 8 characters)
   - Phone number
   - PIN (4 digits)
   - Username (3-20 characters, letters/numbers/underscores only)
6. Click "Create Account"
7. Check console for signup response

### 3. Test Existing User Signin

1. Go to `/auth`
2. Enter an EXISTING email
3. You should see the signin options (Password or PIN)
4. Choose your method and enter credentials
5. Check console for:
   - `🔐 Signin attempt:` - shows what's being sent
   - `✅ User found:` - confirms user exists
   - `✅ Password/PIN authentication successful` - confirms auth worked
6. You should be redirected to `/dashboard`

## What to Look For in Console

### Successful Signin Flow:
```
🔐 Sending signin request: { email: "...", password: "***" }
🔐 Signin attempt: { hasEmail: true, hasPassword: true, hasPin: false }
✅ User found: { id: "...", email: "...", username: "..." }
✅ Password authentication successful
📥 Signin response: { success: true }
```

### Failed Signin:
```
🔐 Sending signin request: { email: "...", password: "***" }
🔐 Signin attempt: { hasEmail: true, hasPassword: true, hasPin: false }
❌ User not found: ...
📥 Signin response: { success: false, error: "User not found" }
```

## Common Issues

### "User not found"
- Email doesn't exist in database
- Try signing up first

### "Invalid password"
- Wrong password
- Make sure you're using the password you set during signup

### "Invalid PIN"
- Wrong PIN
- Make sure you're entering the 4-digit PIN you set during signup

### Can't create account
- Email/username/phone already exists
- Try a different email

### Stuck on email page
- Check console for errors
- Make sure check-email endpoint is working

## Database Check

If you need to verify a user exists in the database, you can check Supabase:
1. Go to your Supabase project
2. Navigate to Table Editor
3. Open the `users` table
4. Search for your email

## Need Help?

Share with me:
1. What step you're on
2. What error message you see (if any)
3. What the console logs show
4. Whether you're trying to signup or signin
