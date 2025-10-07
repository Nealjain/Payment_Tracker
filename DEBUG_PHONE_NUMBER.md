# Debug: Phone Number Not Showing in Supabase

## Issue
Phone number is entered in the complete-profile form but doesn't appear in the Supabase `users` table.

## Debugging Steps

### 1. Check Browser Console
1. Open browser DevTools (F12 or Cmd+Option+I)
2. Go to Console tab
3. Fill in the complete-profile form
4. Click "Complete Profile"
5. Look for log message: `[Complete Profile] Submitting:`

**What to check:**
```javascript
{
  username: "your-username",
  phoneNumber: "+1234567890",  // Should be clean format with +
  pinLength: 4
}
```

**Expected:** Phone number should be in format `+1234567890` (no spaces, parentheses, or dashes)

### 2. Check Server Logs
In your terminal where `npm run dev` is running, look for:

```
[Complete Profile] Received data: { username: '...', phoneNumber: '+12***', pinLength: 4 }
[Complete Profile] Pending OAuth: { email: '...', provider: 'google', hasUserId: true }
[Complete Profile] Creating user with: { id: '...', email: '...', username: '...', phone_number: '+1234567890', provider: 'google' }
[Complete Profile] User created successfully: { id: '...', username: '...', phone: '+1234567890' }
```

### 3. Check Network Tab
1. Open DevTools → Network tab
2. Submit the form
3. Find the request to `/api/auth/complete-profile`
4. Click on it
5. Check "Payload" or "Request" tab

**What to check:**
```json
{
  "username": "your-username",
  "phoneNumber": "+1234567890",
  "pin": "1234"
}
```

### 4. Check Supabase Directly
1. Go to Supabase Dashboard
2. Navigate to Table Editor → `users` table
3. Find your user by email
4. Check the `phone_number` column

**Possible issues:**
- Column is NULL (not saved)
- Column has wrong value
- User record doesn't exist

### 5. Check for Validation Errors
Look in browser console for error messages like:
- "Phone number must be at least 10 digits"
- "Invalid phone number"
- "Username already exists"
- "Phone number already exists"

## Common Issues & Solutions

### Issue 1: Phone Number Has Formatting
**Symptom:** Phone shows as `+1 (555) 123-4567` in console

**Solution:** The `getRawPhoneNumber()` function should strip formatting. Check if it's working:
```javascript
// In browser console, test:
const formatted = "+1 (555) 123-4567"
const raw = formatted.replace(/[^\d+]/g, "")
console.log(raw) // Should be: +15551234567
```

### Issue 2: Validation Failing
**Symptom:** Form doesn't submit, shows validation error

**Solution:** 
- Phone must be at least 10 digits (including country code)
- Must start with `+` and a digit
- Regex: `/^\+?[1-9]\d{9,14}$/`

### Issue 3: Database Insert Failing
**Symptom:** Server logs show "Database insert error"

**Solution:** Check the error message:
- "duplicate key value" → User already exists
- "violates foreign key constraint" → Invalid user ID
- "violates check constraint" → Phone format doesn't match DB constraint

### Issue 4: User Already Exists
**Symptom:** Error "Phone number already exists"

**Solution:** 
1. Check Supabase for existing user with that phone
2. Delete the test user if needed
3. Try again with different phone number

### Issue 5: Pending OAuth Missing
**Symptom:** "No pending OAuth session found"

**Solution:**
1. Clear browser cookies
2. Sign in with Google again
3. Should redirect to complete-profile with cookies set

## Manual Testing

### Test 1: Check Phone Formatting
```javascript
// In browser console on complete-profile page:
const formatPhoneNumber = (value) => {
  const digits = value.replace(/\D/g, "")
  if (digits.startsWith("1") && digits.length > 1) {
    const match = digits.match(/^1(\d{0,3})(\d{0,3})(\d{0,4})/)
    if (match) {
      let formatted = "+1"
      if (match[1]) formatted += ` (${match[1]}`
      if (match[2]) formatted += `) ${match[2]}`
      if (match[3]) formatted += `-${match[3]}`
      return formatted
    }
  }
  return digits ? `+${digits}` : ""
}

console.log(formatPhoneNumber("15551234567"))
// Should show: +1 (555) 123-4567
```

### Test 2: Check Raw Phone Extraction
```javascript
// In browser console:
const getRawPhoneNumber = (formatted) => {
  return formatted.replace(/[^\d+]/g, "")
}

console.log(getRawPhoneNumber("+1 (555) 123-4567"))
// Should show: +15551234567
```

### Test 3: Check Validation
```javascript
// In browser console:
const phoneRegex = /^\+?[1-9]\d{9,14}$/
const testPhone = "+15551234567"
console.log(phoneRegex.test(testPhone))
// Should show: true
```

## Expected Flow

1. **User enters phone:** `15551234567`
2. **Auto-formats to:** `+1 (555) 123-4567`
3. **On submit, extracts raw:** `+15551234567`
4. **Validates with regex:** ✓ Pass
5. **Sends to API:** `{ phoneNumber: "+15551234567" }`
6. **API validates with Zod:** ✓ Pass (min 10 chars)
7. **Inserts to database:** `phone_number = '+15551234567'`
8. **Success!**

## Quick Fix Checklist

- [ ] Browser console shows correct phone format in submission
- [ ] Server logs show phone number being received
- [ ] Server logs show "User created successfully" with phone
- [ ] No validation errors in console
- [ ] No database errors in server logs
- [ ] Supabase table shows the user record
- [ ] Phone number column is not NULL

## If Still Not Working

1. **Check Supabase RLS policies:**
   ```sql
   -- In Supabase SQL Editor:
   SELECT * FROM users WHERE email = 'your-email@example.com';
   ```

2. **Check if column exists:**
   ```sql
   SELECT column_name, data_type 
   FROM information_schema.columns 
   WHERE table_name = 'users' AND column_name = 'phone_number';
   ```

3. **Try manual insert:**
   ```sql
   UPDATE users 
   SET phone_number = '+15551234567' 
   WHERE email = 'your-email@example.com';
   ```

4. **Check for triggers or constraints:**
   ```sql
   SELECT * FROM information_schema.table_constraints 
   WHERE table_name = 'users';
   ```

## Contact Info

If you're still having issues, provide:
1. Browser console logs (screenshot)
2. Server terminal logs (copy/paste)
3. Network tab payload (screenshot)
4. Supabase table screenshot
5. Any error messages

This will help diagnose the exact issue!
