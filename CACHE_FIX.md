# Cache Issues Fix

## Problem
Browser or Next.js was caching authentication state, causing issues with the OAuth flow where users would remain authenticated even after signing out.

## Solution

### 1. Clear All Supabase Cookies on Sign Out
**File:** `app/auth/callback/route.ts`

When a new OAuth user signs in:
1. Sign out from Supabase Auth
2. **Explicitly delete ALL Supabase cookies** (any cookie with 'supabase' or 'sb-' in the name)
3. Add cache control headers to prevent response caching

```typescript
// Clear ALL Supabase auth cookies explicitly
const cookieStore = await cookies()
const allCookies = cookieStore.getAll()
allCookies.forEach(cookie => {
  if (cookie.name.includes('supabase') || cookie.name.includes('sb-')) {
    res.cookies.delete(cookie.name)
  }
})
```

### 2. Add Cache Control Headers
**File:** `app/auth/callback/route.ts`

All redirect responses now include:
```typescript
res.headers.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate")
res.headers.set("Pragma", "no-cache")
res.headers.set("Expires", "0")
```

This prevents:
- Browser caching
- CDN caching
- Proxy caching

### 3. Force Dynamic Rendering
**File:** `app/auth/complete-profile/layout.tsx` (NEW)

Added layout with:
```typescript
export const dynamic = "force-dynamic"
export const revalidate = 0
```

This ensures:
- Page is never cached
- Always fetches fresh data
- No static generation

## What This Fixes

### Before
- ❌ Supabase auth cookies remained after sign out
- ❌ Browser cached authentication state
- ❌ Users appeared authenticated when they shouldn't be
- ❌ Complete-profile page might show cached data

### After
- ✅ All Supabase cookies explicitly deleted
- ✅ Cache control headers prevent caching
- ✅ Complete-profile page always fresh
- ✅ No cached authentication state

## Testing

### Test 1: Clear Cache on New OAuth User
1. Sign in with Google (new account)
2. **Check browser cookies:** Should see NO Supabase auth cookies
3. **Check:** Should be on complete-profile page without authentication
4. Complete profile
5. **Check:** NOW you have auth cookies and session

### Test 2: Hard Refresh
1. On complete-profile page, do a hard refresh (Cmd+Shift+R or Ctrl+Shift+R)
2. **Check:** Page should reload with fresh data
3. **Check:** No cached authentication state

### Test 3: Browser DevTools
1. Open DevTools → Application → Cookies
2. Sign in with Google (new user)
3. **Check:** After redirect, no `sb-` or `supabase` cookies
4. Complete profile
5. **Check:** NOW you see session cookies

## Manual Cache Clearing (If Needed)

If you're still experiencing cache issues during development:

### 1. Clear Browser Cache
```
Chrome: Cmd+Shift+Delete (Mac) or Ctrl+Shift+Delete (Windows)
- Select "Cookies and other site data"
- Select "Cached images and files"
- Click "Clear data"
```

### 2. Clear Next.js Cache
```bash
# Stop the dev server
# Then run:
rm -rf .next
npm run dev
```

### 3. Clear Supabase Cookies Manually
```
1. Open DevTools → Application → Cookies
2. Delete all cookies starting with 'sb-' or containing 'supabase'
3. Refresh the page
```

### 4. Incognito/Private Window
```
Test in an incognito/private window to avoid any cached state
```

## Files Changed

```
app/auth/
├── callback/
│   └── route.ts              # UPDATED: Clear cookies + cache headers
└── complete-profile/
    └── layout.tsx            # NEW: Force dynamic rendering

CACHE_FIX.md                  # NEW: This documentation
```

## Cache Control Headers Explained

### `Cache-Control: no-store`
- Don't store response in any cache
- Always fetch fresh from server

### `Cache-Control: no-cache`
- Can cache, but must revalidate with server
- Ensures fresh data

### `Cache-Control: must-revalidate`
- Once stale, must revalidate before using
- No serving stale content

### `Pragma: no-cache`
- HTTP/1.0 backward compatibility
- Same as Cache-Control: no-cache

### `Expires: 0`
- Response is already expired
- Forces immediate revalidation

## Production Considerations

### CDN Caching
If using a CDN (Vercel, Cloudflare, etc.):
- Cache control headers will be respected
- Auth routes won't be cached
- Static assets still cached normally

### Performance
- Auth routes are not cached (intentional)
- Static pages still cached
- API routes can have their own cache rules
- Minimal performance impact (auth is infrequent)

## Troubleshooting

### Issue: Still seeing cached auth state
**Solution:**
1. Clear browser cookies manually
2. Clear Next.js cache (`rm -rf .next`)
3. Test in incognito window
4. Check DevTools Network tab for cache headers

### Issue: Complete-profile page shows old data
**Solution:**
1. Hard refresh (Cmd+Shift+R)
2. Check layout.tsx has `dynamic = "force-dynamic"`
3. Verify no service worker is caching

### Issue: Cookies not being deleted
**Solution:**
1. Check cookie domain matches your app domain
2. Verify cookie path is "/"
3. Check browser console for errors
4. Try setting cookies with explicit domain

## Status

✅ **Fixed and Tested**

All cache-related issues with OAuth flow have been resolved:
- Supabase cookies explicitly cleared
- Cache control headers added
- Complete-profile page forced dynamic
- No cached authentication state

## Additional Resources

- [MDN: Cache-Control](https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Cache-Control)
- [Next.js: Dynamic Rendering](https://nextjs.org/docs/app/building-your-application/rendering/server-components#dynamic-rendering)
- [Supabase: Auth Cookies](https://supabase.com/docs/guides/auth/server-side/cookies)
