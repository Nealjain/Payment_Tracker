# Google OAuth Fix

## Issue
Getting error: `{"error":"requested path is invalid"}` when trying to sign in with Google.

## Solution

You need to configure the redirect URL in your Supabase project:

### Step 1: Go to Supabase Dashboard
1. Visit https://supabase.com/dashboard
2. Select your project: `spaqojtrouehuzqdjgfz`

### Step 2: Configure Auth Settings
1. Go to **Authentication** → **URL Configuration**
2. Add these URLs to **Redirect URLs**:
   - `http://localhost:3000/auth/callback`
   - `https://yourdomain.com/auth/callback` (for production)

### Step 3: Configure Site URL
1. Set **Site URL** to: `http://localhost:3000`
2. For production, change to your actual domain

### Step 4: Save and Test
1. Click **Save**
2. Wait a few seconds for changes to propagate
3. Try Google login again

## Alternative: Check Current Configuration

Run this in your browser console on the auth page to see the current redirect URL:
```javascript
console.log(window.location.origin + '/auth/callback')
```

Make sure this exact URL is in your Supabase redirect URLs list.

## Note
The callback route at `/app/auth/callback/route.ts` is already correctly configured. The issue is just the Supabase dashboard settings.
