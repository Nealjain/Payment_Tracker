# 🔐 Authentication System Update Guide

## 📋 What Changed

### ❌ Removed:
- PIN-only authentication (username + PIN without email)
- Email/PIN toggle in UI
- Separate auth methods

### ✅ Added:
- **Unified authentication**: All users need email, username, phone, and PIN
- **Phone number field**: Required for all users (unique)
- **Google OAuth completion flow**: Google users must set PIN + phone after first login
- **Enhanced validation**: Phone number format validation

---

## 🗄️ Database Changes Required

### Step 1: Run This SQL in Supabase

Go to: https://supabase.com/dashboard/project/spaqojtrouehuzqdjgfz/sql

```sql
-- Add phone number column
ALTER TABLE public.users 
ADD COLUMN IF NOT EXISTS phone_number character varying UNIQUE;

-- Make email required
ALTER TABLE public.users 
ALTER COLUMN email SET NOT NULL;

-- Make PIN required for all users
ALTER TABLE public.users 
ALTER COLUMN pin_hash SET NOT NULL;

-- Add indexes
CREATE INDEX IF NOT EXISTS idx_users_phone_number ON public.users(phone_number);

-- Add phone number format constraint
ALTER TABLE public.users 
ADD CONSTRAINT IF NOT EXISTS phone_number_format 
CHECK (phone_number ~ '^\+?[1-9]\d{1,14}$');

-- Update RLS policies
DROP POLICY IF EXISTS "Users can view their own data" ON public.users;
DROP POLICY IF EXISTS "Users can update their own data" ON public.users;
DROP POLICY IF EXISTS "Users can insert their own data" ON public.users;

CREATE POLICY "Users can view their own data" ON public.users
  FOR SELECT USING (auth.uid() = id);

CREATE POLICY "Users can update their own data" ON public.users
  FOR UPDATE USING (auth.uid() = id);

CREATE POLICY "Users can insert their own data" ON public.users
  FOR INSERT WITH CHECK (auth.uid() = id);
```

### Step 2: Update Existing Users (If Any)

If you have existing users without phone numbers, you'll need to update them:

```sql
-- Check existing users
SELECT id, username, email, phone_number 
FROM public.users 
WHERE phone_number IS NULL;

-- Option 1: Set temporary phone numbers (users will need to update)
UPDATE public.users 
SET phone_number = '+1000000000' 
WHERE phone_number IS NULL;

-- Option 2: Delete test users and start fresh
DELETE FROM public.users WHERE phone_number IS NULL;
```

---

## 🎨 UI Changes

### Sign In Page
**Before:**
- Toggle between Email and PIN methods
- Email: email + password
- PIN: username + PIN

**After:**
- Single unified form
- Email + 4-digit PIN
- Google OAuth button

### Sign Up Page
**Before:**
- Toggle between Email and PIN methods
- Email: username + email + password
- PIN: username + PIN

**After:**
- Single unified form
- Email + Username + Phone + 4-digit PIN
- Google OAuth button

### Google OAuth Flow
**New:**
1. User clicks "Continue with Google"
2. Signs in with Google
3. Redirected to `/auth/complete-profile`
4. Must provide: Username + Phone + 4-digit PIN
5. Then redirected to dashboard

---

## 📱 Phone Number Format

### Accepted Formats:
- `+1234567890` (with country code)
- `+919876543210` (India)
- `+447911123456` (UK)

### Validation Rules:
- Must start with `+` or digit 1-9
- 2-15 digits total (after country code)
- No spaces, dashes, or special characters
- Regex: `^\+?[1-9]\d{1,14}$`

### Examples:
✅ `+1234567890`
✅ `+919876543210`
✅ `1234567890`
❌ `123-456-7890` (no dashes)
❌ `(123) 456-7890` (no parentheses)
❌ `+0123456789` (can't start with 0 after +)

---

## 🔄 Authentication Flows

### Flow 1: Email Signup
```
User fills form:
  - Email: user@example.com
  - Username: johndoe
  - Phone: +1234567890
  - PIN: 1234
  - Confirm PIN: 1234
    ↓
Validation:
  - Check email unique ✓
  - Check username unique ✓
  - Check phone unique ✓
  - Validate phone format ✓
  - Validate PIN is 4 digits ✓
  - Check PINs match ✓
    ↓
Create user:
  - Hash PIN
  - Create Supabase Auth user
  - Create users table record
  - Create session
    ↓
Redirect to dashboard ✅
```

### Flow 2: Email Sign In
```
User enters:
  - Email: user@example.com
  - PIN: 1234
    ↓
Validation:
  - Find user by email
  - Verify PIN hash
    ↓
Create session
    ↓
Redirect to dashboard ✅
```

### Flow 3: Google OAuth (New User)
```
User clicks "Continue with Google"
    ↓
Google authentication
    ↓
Callback: Check if user exists
    ↓
User NOT in database
    ↓
Redirect to /auth/complete-profile
    ↓
User fills form:
  - Username: johndoe (pre-filled from email)
  - Phone: +1234567890
  - PIN: 1234
  - Confirm PIN: 1234
    ↓
Create users table record
    ↓
Redirect to dashboard ✅
```

### Flow 4: Google OAuth (Existing User)
```
User clicks "Continue with Google"
    ↓
Google authentication
    ↓
Callback: Check if user exists
    ↓
User EXISTS with PIN and phone
    ↓
Create session
    ↓
Redirect to dashboard ✅
```

---

## 🧪 Testing Checklist

### Test Email Signup:
- [ ] Fill all fields correctly → Success
- [ ] Leave email empty → Error: "All fields required"
- [ ] Leave username empty → Error: "All fields required"
- [ ] Leave phone empty → Error: "All fields required"
- [ ] Invalid phone format → Error: "Invalid phone number"
- [ ] PIN not 4 digits → Error: "PIN must be 4 digits"
- [ ] PINs don't match → Error: "PINs don't match"
- [ ] Duplicate email → Error: "Email already exists"
- [ ] Duplicate username → Error: "Username already exists"
- [ ] Duplicate phone → Error: "Phone already exists"

### Test Email Sign In:
- [ ] Correct email + PIN → Success
- [ ] Wrong email → Error: "Invalid email or PIN"
- [ ] Wrong PIN → Error: "Invalid email or PIN"
- [ ] Empty fields → Error: "Email and PIN required"

### Test Google OAuth:
- [ ] New Google user → Redirects to complete-profile
- [ ] Fill profile form → Success, redirects to dashboard
- [ ] Existing Google user → Directly to dashboard
- [ ] Cancel Google login → Returns to auth page

### Test Validation:
- [ ] Phone: `+1234567890` → ✅ Valid
- [ ] Phone: `123-456-7890` → ❌ Invalid
- [ ] Phone: `(123) 456-7890` → ❌ Invalid
- [ ] PIN: `1234` → ✅ Valid
- [ ] PIN: `123` → ❌ Invalid (too short)
- [ ] PIN: `12345` → ❌ Invalid (too long)
- [ ] PIN: `abcd` → ❌ Invalid (not numbers)

---

## 📊 Database Schema

### users table (Updated):
```sql
CREATE TABLE public.users (
  id uuid PRIMARY KEY,
  username varchar UNIQUE NOT NULL,
  email varchar UNIQUE NOT NULL,           -- NOW REQUIRED
  phone_number varchar UNIQUE NOT NULL,    -- NEW FIELD
  pin_hash text NOT NULL,                  -- NOW REQUIRED
  provider varchar DEFAULT 'email',
  last_sign_in_at timestamp with time zone,
  created_at timestamp with time zone DEFAULT now(),
  updated_at timestamp with time zone DEFAULT now()
);
```

### Unique Constraints:
- `username` - Must be unique across all users
- `email` - Must be unique across all users
- `phone_number` - Must be unique across all users

---

## 🔐 Security Notes

### PIN Storage:
- PINs are hashed using bcrypt with 12 salt rounds
- Never stored in plain text
- Verified using bcrypt.compare()

### Phone Number:
- Validated on both client and server
- Stored in E.164 format (recommended)
- Unique constraint prevents duplicates

### Google OAuth:
- Users must complete profile before accessing app
- Email from Google is trusted
- Username can be pre-filled from email
- PIN adds extra security layer

---

## 🚀 Deployment Steps

### 1. Run Database Migration
```bash
# Copy SQL from Step 1 above
# Run in Supabase SQL Editor
```

### 2. Update Environment Variables
```bash
# Already done in .env.local
NEXT_PUBLIC_SUPABASE_URL=https://spaqojtrouehuzqdjgfz.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
```

### 3. Test Locally
```bash
# Clear cache
rm -rf .next

# Start dev server
pnpm dev

# Test all flows
```

### 4. Deploy
```bash
# Build
pnpm build

# Deploy to your hosting platform
```

---

## 📝 API Endpoints

### Updated:
- `POST /api/auth/signup` - Now requires email, username, phone, PIN
- `POST /api/auth/signin` - Now requires email + PIN (not username)
- `GET /auth/callback` - Now redirects to complete-profile if needed

### New:
- `POST /api/auth/complete-profile` - Complete Google OAuth profile
- `GET /api/auth/user` - Get current user info

### Removed:
- `POST /api/auth/create` - Old PIN-only signup (no longer used)
- `POST /api/auth/login` - Old username+PIN login (no longer used)

---

## 🎯 Summary

### What Users Need Now:
1. **Email** (unique, required)
2. **Username** (unique, required)
3. **Phone Number** (unique, required, validated format)
4. **4-Digit PIN** (required, hashed)

### Authentication Methods:
1. **Email + PIN** - Primary method
2. **Google OAuth** - Must complete profile (username + phone + PIN)

### No More:
- ❌ Username + PIN only (without email)
- ❌ Password authentication
- ❌ Separate auth method toggles

---

## ✅ Ready to Test!

1. Run the SQL migration
2. Start your app: `pnpm dev`
3. Test signup with email
4. Test signin with email + PIN
5. Test Google OAuth flow
6. Verify phone number validation

Everything should work smoothly! 🎉
