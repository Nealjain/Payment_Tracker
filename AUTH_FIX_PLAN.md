# Authentication Fix Plan

## Current Issues

1. ✅ Signin works (PIN authentication successful)
2. ❌ Session cookie not persisting after signin
3. ❌ Redirect to dashboard happens but middleware kicks user back to login
4. ❌ Payments can't be created (no valid session)
5. ❌ Dashboard not properly connected to user data

## Root Cause

The session cookie is being set on the server but not being sent back to the client properly, or the client isn't storing it.

## Database Schema Confirmed

- ✅ `users` table exists with correct structure
- ✅ `payments` table exists with `user_id` foreign key
- ✅ All tables have proper relationships

## Solution Steps

### 1. Fix Session Cookie (Priority 1)

**Problem**: Cookie set with `httpOnly: true` and `sameSite: "lax"` but not persisting

**Solution**: 
- Verify cookie is actually being set in response headers
- Check if domain/path settings are correct
- Ensure cookie is being sent with subsequent requests

### 2. Fix Authentication Flow

**Current Flow**:
```
1. User signs in → API creates session → Sets cookie
2. Frontend redirects → Cookie should be sent
3. Middleware checks cookie → NOT FOUND → Redirect to /auth
```

**Fixed Flow**:
```
1. User signs in → API creates session → Sets cookie with proper settings
2. Wait for cookie to be set (500ms delay)
3. Frontend redirects with window.location.href (full page reload)
4. Middleware checks cookie → FOUND → Allow access
5. API endpoints check session → FOUND → Allow operations
```

### 3. Temporary Workaround (Already Applied)

- Disabled middleware auth for main routes
- This allows dashboard to load
- But API endpoints still require auth

### 4. Permanent Fix Needed

**Option A: Fix Cookie Settings**
- Change cookie settings to ensure it persists
- Test with different sameSite values
- Verify domain matches

**Option B: Use Different Auth Method**
- Store session in localStorage (less secure)
- Use Supabase Auth directly
- Implement token-based auth

**Option C: Hybrid Approach** (RECOMMENDED)
- Keep JWT session for API
- Add session check that works client-side
- Store session ID in both cookie AND localStorage as backup

## Implementation Plan

### Step 1: Add Session Debug Endpoint
Create `/api/debug/session` to check if cookie is set

### Step 2: Fix Cookie Settings
Update session.ts to use settings that work in production

### Step 3: Add Client-Side Session Check
Store session token in localStorage as backup

### Step 4: Update Middleware
Check both cookie AND localStorage

### Step 5: Test Flow
1. Sign in
2. Check if cookie is set (dev tools)
3. Check if localStorage has token
4. Verify redirect works
5. Verify API calls work

## Quick Fix (Immediate)

Since middleware is disabled, the immediate issue is API authentication.
We need to ensure the session cookie is being sent with API requests.

**Check**:
1. Is cookie being set? (Check Network tab → Response Headers)
2. Is cookie being sent? (Check Network tab → Request Headers)
3. Is cookie valid? (Check Application tab → Cookies)

## Console Logs to Check

When you try to create a payment, look for:
```
🔐 withAuth: Validating session...
🔍 validateSession: Checking for session...
```

Then either:
- ✅ Session found → Payment should save
- ❌ No session → Need to fix cookie
