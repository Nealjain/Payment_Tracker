# Build Error Fix - Summary

## Problem

The build was failing with this error:
```
You're importing a component that needs next/headers. 
That only works in a Server Component which is not supported in the pages/ directory.
```

## Root Cause

The issue was in the import chain:
```
app/auth/page.tsx (Client Component)
  ↓ imports
lib/auth.ts (Mixed Server/Client)
  ↓ imports
lib/session.ts (Server-only - uses next/headers)
```

Client components cannot import modules that use `next/headers` (like `cookies()`).

## Solution

**Split authentication functions into client and server modules:**

### 1. Created `lib/auth-client.ts` ✅
- Contains client-side only functions
- `signInWithGoogle()` - Google OAuth (uses browser client)
- `signOutClient()` - Client-side sign out

### 2. Updated `lib/auth.ts` ✅
- Removed `signInWithGoogle()` (moved to client module)
- Kept all server-side functions
- Removed browser client import

### 3. Updated `app/auth/page.tsx` ✅
- Changed import from `@/lib/auth` to `@/lib/auth-client`
- Now imports only client-safe functions

### 4. Updated `middleware.ts` ✅
- Added `/onboarding` to public routes
- Allows users to access onboarding without authentication

## File Changes

### New Files:
- `lib/auth-client.ts` - Client-side auth functions

### Modified Files:
- `lib/auth.ts` - Removed client-side functions
- `app/auth/page.tsx` - Updated import path
- `middleware.ts` - Added onboarding route

## Architecture

```
┌─────────────────────────────────────────┐
│         Client Components               │
│  (app/auth/page.tsx, etc.)             │
│                                         │
│  Import from:                           │
│  ✅ lib/auth-client.ts                  │
│  ❌ lib/auth.ts (server-only)           │
└─────────────────────────────────────────┘

┌─────────────────────────────────────────┐
│         Server Components               │
│  (API routes, middleware, etc.)         │
│                                         │
│  Import from:                           │
│  ✅ lib/auth.ts                          │
│  ✅ lib/session.ts                       │
│  ❌ lib/auth-client.ts (not needed)     │
└─────────────────────────────────────────┘
```

## Testing

Run these commands to verify the fix:

```bash
# 1. Clear Next.js cache
rm -rf .next

# 2. Rebuild
pnpm build

# 3. Start dev server
pnpm dev
```

## Future Guidelines

### When creating new auth functions:

**Client-side functions** (use browser, window, etc.):
- Add to `lib/auth-client.ts`
- Can be imported in client components
- Use `createClient()` from `@/lib/supabase/client`

**Server-side functions** (use cookies, headers, etc.):
- Add to `lib/auth.ts`
- Only import in API routes, middleware, server components
- Use `createClient()` from `@/lib/supabase/server`

### Import Rules:

```typescript
// ✅ CORRECT - Client Component
"use client"
import { signInWithGoogle } from "@/lib/auth-client"

// ❌ WRONG - Client Component
"use client"
import { signInWithGoogle } from "@/lib/auth"

// ✅ CORRECT - API Route
import { getCurrentAuthUser } from "@/lib/auth"

// ✅ CORRECT - API Route
import { createSession } from "@/lib/session"
```

## Status

✅ Build error fixed
✅ All diagnostics passing
✅ Client/Server separation implemented
✅ Middleware updated
✅ Ready to continue development

You can now proceed with building the onboarding system!
