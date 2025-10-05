# 🔐 Two-Step Authentication Flow

## 📋 Overview

The authentication system now uses a **two-step flow** for both sign-in and sign-up:

### Step 1: Email Entry
User enters their email address

### Step 2: Complete Details
- **Sign In**: Enter PIN only
- **Sign Up**: Enter username + phone + PIN

---

## 🎯 User Flows

### Flow 1: Sign In (Existing User)

```
┌─────────────────────────────────────┐
│  Step 1: Enter Email                │
│  ┌───────────────────────────────┐  │
│  │ Email: user@example.com       │  │
│  └───────────────────────────────┘  │
│  [Continue Button]                  │
└─────────────────────────────────────┘
              ↓
    Check if email exists
              ↓
         Email found ✅
              ↓
┌─────────────────────────────────────┐
│  Step 2: Enter PIN                  │
│  Signing in as: user@example.com    │
│  [Change]                           │
│  ┌───────────────────────────────┐  │
│  │ PIN: ••••                     │  │
│  └───────────────────────────────┘  │
│  [Sign In Button]                   │
│  [Forgot PIN?]                      │
└─────────────────────────────────────┘
              ↓
        Verify PIN
              ↓
      Create session
              ↓
   Redirect to dashboard ✅
```

### Flow 2: Sign Up (New User)

```
┌─────────────────────────────────────┐
│  Step 1: Enter Email                │
│  ┌───────────────────────────────┐  │
│  │ Email: newuser@example.com    │  │
│  └───────────────────────────────┘  │
│  [Continue Button]                  │
└─────────────────────────────────────┘
              ↓
    Check if email exists
              ↓
      Email available ✅
              ↓
┌─────────────────────────────────────┐
│  Step 2: Complete Profile           │
│  Creating account for:              │
│  newuser@example.com [Change]       │
│  ┌───────────────────────────────┐  │
│  │ Username: johndoe             │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Phone: +1234567890            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ PIN: ••••                     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Confirm PIN: ••••             │  │
│  └───────────────────────────────┘  │
│  [Create Account Button]            │
└─────────────────────────────────────┘
              ↓
      Validate all fields
              ↓
       Create account
              ↓
      Create session
              ↓
   Redirect to dashboard ✅
```

### Flow 3: Google OAuth

```
┌─────────────────────────────────────┐
│  [Continue with Google Button]      │
└─────────────────────────────────────┘
              ↓
    Google authentication
              ↓
         Callback
              ↓
    Check if user exists
              ↓
┌─────────────────────────────────────┐
│  Complete Profile Page              │
│  Signed in as: user@gmail.com       │
│  ┌───────────────────────────────┐  │
│  │ Username: (pre-filled)        │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Phone: +1234567890            │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ PIN: ••••                     │  │
│  └───────────────────────────────┘  │
│  ┌───────────────────────────────┐  │
│  │ Confirm PIN: ••••             │  │
│  └───────────────────────────────┘  │
│  [Complete Profile Button]          │
└─────────────────────────────────────┘
              ↓
      Save profile
              ↓
   Redirect to dashboard ✅
```

---

## 🎨 UI Components

### Step 1: Email Entry (Both Sign In & Sign Up)

**Sign In Tab:**
```
┌────────────────────────────────────┐
│ [Continue with Google]             │
│                                    │
│ ─────── Or sign in with email ──── │
│                                    │
│ Email Address                      │
│ ┌────────────────────────────────┐ │
│ │ Enter your email               │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Continue]                         │
└────────────────────────────────────┘
```

**Sign Up Tab:**
```
┌────────────────────────────────────┐
│ [Continue with Google]             │
│                                    │
│ ─────── Or create account ──────── │
│                                    │
│ Email Address                      │
│ ┌────────────────────────────────┐ │
│ │ Enter your email               │ │
│ └────────────────────────────────┘ │
│ We'll check if this email is       │
│ available                          │
│                                    │
│ [Continue]                         │
└────────────────────────────────────┘
```

### Step 2: Sign In (PIN Entry)

```
┌────────────────────────────────────┐
│ Signing in as:                     │
│ ┌────────────────────────────────┐ │
│ │ user@example.com    [Change]   │ │
│ └────────────────────────────────┘ │
│                                    │
│ Enter Your 4-Digit PIN      [👁]   │
│ ┌────────────────────────────────┐ │
│ │        • • • •                 │ │
│ └────────────────────────────────┘ │
│                                    │
│ [Sign In]                          │
│                                    │
│ [Forgot PIN?]                      │
└────────────────────────────────────┘
```

### Step 2: Sign Up (Complete Profile)

```
┌────────────────────────────────────┐
│ Creating account for:              │
│ ┌────────────────────────────────┐ │
│ │ newuser@example.com [Change]   │ │
│ └────────────────────────────────┘ │
│                                    │
│ Username                           │
│ ┌────────────────────────────────┐ │
│ │ Choose a username              │ │
│ └────────────────────────────────┘ │
│                                    │
│ Phone Number                       │
│ ┌────────────────────────────────┐ │
│ │ +1234567890                    │ │
│ └────────────────────────────────┘ │
│ Include country code (e.g., +1)    │
│                                    │
│ Create 4-Digit PIN          [👁]   │
│ ┌────────────────────────────────┐ │
│ │        • • • •                 │ │
│ └────────────────────────────────┘ │
│                                    │
│ Confirm PIN                 [👁]   │
│ ┌────────────────────────────────┐ │
│ │        • • • •                 │ │
│ └────────────────────────────────┘ │
│ ✅ PINs match                      │
│                                    │
│ [Create Account]                   │
└────────────────────────────────────┘
```

---

## 🔄 State Management

### States:
```typescript
const [activeTab, setActiveTab] = useState("signin") // "signin" | "signup"
const [step, setStep] = useState("email")            // "email" | "details"
const [email, setEmail] = useState("")
const [username, setUsername] = useState("")
const [phoneNumber, setPhoneNumber] = useState("")
const [pin, setPin] = useState("")
const [confirmPin, setConfirmPin] = useState("")
```

### Navigation:
```typescript
// Move to step 2
setStep("details")

// Go back to step 1
setStep("email")

// Switch tabs (resets to step 1)
setActiveTab("signup")
setStep("email")
```

---

## 🔌 API Endpoints

### New Endpoint:
```typescript
POST /api/auth/check-email
Request: { email: string }
Response: { success: boolean, exists: boolean }
```

### Existing Endpoints:
```typescript
POST /api/auth/signup
Request: { email, username, phoneNumber, pin }
Response: { success: boolean, userId?: string }

POST /api/auth/signin
Request: { email, pin }
Response: { success: boolean, userId?: string }
```

---

## ✅ Validation Rules

### Step 1 (Email):
- ✅ Email is required
- ✅ Email format validation: `^[^\s@]+@[^\s@]+\.[^\s@]+$`
- ✅ Check if email exists (sign in) or available (sign up)

### Step 2 (Sign In):
- ✅ PIN is required
- ✅ PIN must be exactly 4 digits
- ✅ PIN must match stored hash

### Step 2 (Sign Up):
- ✅ Username is required
- ✅ Phone number is required
- ✅ Phone format: `^\+?[1-9]\d{1,14}$`
- ✅ PIN is required (4 digits)
- ✅ Confirm PIN must match
- ✅ Username must be unique
- ✅ Phone must be unique

---

## 🎯 User Experience Benefits

### 1. **Simpler Initial Step**
- Users only need to enter email first
- Less overwhelming than full form

### 2. **Clear Feedback**
- Immediate feedback if email exists/doesn't exist
- No wasted time filling full form

### 3. **Flexible Navigation**
- Can go back and change email
- Email is displayed prominently in step 2

### 4. **Progressive Disclosure**
- Show only relevant fields at each step
- Reduces cognitive load

### 5. **Better Error Handling**
- Email validation happens first
- Prevents duplicate email errors after filling full form

---

## 🧪 Testing Checklist

### Sign In Flow:
- [ ] Enter email → Click Continue
- [ ] Email exists → Shows PIN input
- [ ] Email doesn't exist → Shows error
- [ ] Click "Change" → Goes back to email input
- [ ] Enter correct PIN → Signs in successfully
- [ ] Enter wrong PIN → Shows error
- [ ] Press Enter on email → Proceeds to next step
- [ ] Press Enter on PIN → Signs in

### Sign Up Flow:
- [ ] Enter email → Click Continue
- [ ] Email available → Shows profile form
- [ ] Email exists → Shows error
- [ ] Click "Change" → Goes back to email input
- [ ] Fill all fields → Creates account
- [ ] Missing fields → Shows validation errors
- [ ] Invalid phone → Shows error
- [ ] PINs don't match → Shows error
- [ ] Duplicate username → Shows error
- [ ] Duplicate phone → Shows error

### Google OAuth:
- [ ] Click Google button → Redirects to Google
- [ ] New user → Shows complete profile page
- [ ] Existing user → Goes to dashboard
- [ ] Complete profile → Creates account

---

## 📊 Summary

### What Changed:
- ❌ Removed: Single-step forms with all fields
- ✅ Added: Two-step flow (email → details)
- ✅ Added: Email existence check
- ✅ Added: Back navigation
- ✅ Added: Email display in step 2

### Benefits:
- ✨ Cleaner, simpler UI
- ✨ Better user experience
- ✨ Faster validation
- ✨ Less form abandonment
- ✨ Clear progress indication

---

## 🚀 Ready to Test!

1. Run the SQL migration (if not done)
2. Start your app: `pnpm dev`
3. Go to: `http://localhost:3000/auth`
4. Try the new two-step flow!

The experience is now much smoother! 🎉
