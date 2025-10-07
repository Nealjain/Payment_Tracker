# Google OAuth Complete Profile Fix

## Problem
When signing in with Google OAuth, the complete-profile page was not showing up because:
1. New OAuth users don't have a user record in the database yet
2. The complete-profile page was trying to fetch user data from `/api/auth/user`
3. This endpoint requires a session, which new OAuth users don't have yet
4. The page would fail to load or redirect back to auth

## Solution

### 1. Sign Out Immediately After OAuth
**File:** `app/auth/callback/route.ts`

For new users, after Google OAuth completes:
1. Exchange code for session (required by Supabase)
2. Check if user exists in our database
3. If new user: Store OAuth data in cookies and **immediately sign out**
4. Redirect to complete-profile page WITHOUT authentication

This prevents the Supabase Auth session from being cached until profile is complete.

### 2. Created `/api/auth/pending-oauth` Endpoint
**File:** `app/api/auth/pending-oauth/route.ts`

This endpoint checks for pending OAuth data stored in cookies:
- `pending_oauth_email` - Email from Google OAuth
- `pending_oauth_provider` - Provider name (google)
- `pending_oauth_user_id` - Supabase Auth user ID

Returns the data if pending OAuth exists, allowing the complete-profile page to load.

### 3. Updated Complete Profile API
**File:** `app/api/auth/complete-profile/route.ts`

When profile is submitted:
1. Validate all fields with Zod
2. Check for pending OAuth data in cookies
3. Create user record in database with stored user ID
4. Clear pending OAuth cookies
5. Create session (now user is authenticated)
6. Return success

### 4. Updated Complete Profile Page
**File:** `app/auth/complete-profile/page.tsx`

Changed the logic to:
1. **First** check for pending OAuth data (new users)
2. **Then** check for existing user with incomplete profile
3. Pre-fill username suggestion from email
4. Show appropriate UI for new vs existing users

### 5. Updated Middleware
**File:** `middleware.ts`

Added logic to allow access to `/auth/complete-profile` for users with pending OAuth cookies, even without a session.

## Flow Diagram

### New Google OAuth User
```
1. User clicks "Sign in with Google"
   ↓
2. Google authentication completes
   ↓
3. Callback exchanges code for session
   ↓
4. Checks if user exists in database
   ↓
5. User doesn't exist → Store email/userId in cookies
   ↓
6. IMMEDIATELY SIGN OUT from Supabase Auth
   ↓
7. Redirect to /auth/complete-profile (NO SESSION)
   ↓
8. Page loads, fetches pending OAuth data
   ↓
9. Shows form with email pre-filled
   ↓
10. User fills username, phone, PIN
   ↓
11. Submit → Creates user account in database
   ↓
12. Creates session (NOW authenticated)
   ↓
13. Redirect to dashboard
```

### Existing User with Incomplete Profile
```
1. User signs in (email/password or OAuth)
   ↓
2. Callback checks profile completeness
   ↓
3. Profile incomplete → Redirect to /auth/complete-profile
   ↓
4. Page loads, fetches user data from session
   ↓
5. Shows form with existing data pre-filled
   ↓
6. User fills missing fields
   ↓
7. Submit → Updates user account
   ↓
8. Redirect to dashboard
```

## Testing

### Test 1: New Google OAuth User
1. Go to `/auth`
2. Click "Sign in with Google"
3. Complete Google authentication
4. **Expected:** Redirected to `/auth/complete-profile`
5. **Expected:** Page shows with email displayed
6. **Expected:** Username field has suggestion from email
7. Fill in phone number and PIN
8. Click "Complete Profile"
9. **Expected:** Account created, redirected to `/dashboard`

### Test 2: Existing User with Incomplete Profile
1. Sign in with existing account that has incomplete profile
2. **Expected:** Redirected to `/auth/complete-profile`
3. **Expected:** Existing data is pre-filled
4. Fill in missing fields
5. Click "Complete Profile"
6. **Expected:** Profile updated, redirected to `/dashboard`

### Test 3: Existing User with Complete Profile
1. Sign in with Google (existing user with complete profile)
2. **Expected:** Directly redirected to `/dashboard`
3. **Expected:** No profile completion page shown

## Files Changed

```
app/
├── api/auth/
│   ├── pending-oauth/
│   │   └── route.ts          # NEW: Check for pending OAuth
│   └── complete-profile/
│       └── route.ts           # EXISTING: Create user after validation
├── auth/
│   └── complete-profile/
│       └── page.tsx           # UPDATED: Check pending OAuth first
└── middleware.ts              # UPDATED: Allow pending OAuth users

GOOGLE_OAUTH_FIX.md            # NEW: This documentation
```

## API Endpoints

### GET `/api/auth/pending-oauth`
**Purpose:** Check if there's a pending OAuth session

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "email": "user@example.com",
    "provider": "google",
    "userId": "uuid-from-supabase-auth"
  }
}
```

**Response (No Pending OAuth):**
```json
{
  "success": false,
  "error": "No pending OAuth session",
  "code": "NO_PENDING_OAUTH"
}
```

### POST `/api/auth/complete-profile`
**Purpose:** Create user account after profile completion

**Request:**
```json
{
  "username": "johndoe",
  "phoneNumber": "+1234567890",
  "pin": "1234"
}
```

**Response (Success):**
```json
{
  "success": true,
  "data": {
    "userId": "uuid-here"
  }
}
```

## Security Notes

1. **User is signed out immediately after OAuth**
   - No Supabase Auth session until profile is complete
   - Prevents cached authentication without profile data
   - User must complete profile to gain access

2. **Pending OAuth cookies expire in 10 minutes**
   - Forces users to complete profile quickly
   - Prevents stale OAuth sessions

3. **No user account created until profile is complete**
   - Prevents incomplete records in database
   - Ensures data integrity
   - User ID is stored but no database record exists

4. **All inputs validated with Zod**
   - Username, phone, PIN validated
   - Checks for duplicates
   - Type-safe validation

5. **Middleware protects routes**
   - Incomplete profiles can't access app
   - Pending OAuth users can only access complete-profile page
   - No session = no access to protected routes

## Troubleshooting

### Issue: "No pending OAuth session found"
**Cause:** Cookies expired (10 minutes) or were cleared

**Solution:** Sign in with Google again

### Issue: Page redirects to /auth immediately
**Cause:** No pending OAuth and no session

**Solution:** 
1. Check if cookies are enabled
2. Try signing in with Google again
3. Check browser console for errors

### Issue: "Username already exists"
**Cause:** Username is taken by another user

**Solution:** Choose a different username

### Issue: Profile completion fails
**Cause:** Validation error or network issue

**Solution:**
1. Check all fields are filled correctly
2. Phone number must include country code
3. PIN must be exactly 4 digits
4. Check browser console for specific error

## Status

✅ **Fixed and Tested**

The Google OAuth flow now properly shows the complete-profile page for new users and allows them to complete their profile before accessing the app.
