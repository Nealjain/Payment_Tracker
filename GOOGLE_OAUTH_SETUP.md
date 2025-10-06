# Google OAuth Setup Guide

## 1. Enable Google OAuth in Supabase

1. Go to your Supabase project dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to enable it
4. You'll need to configure Google OAuth credentials

## 2. Create Google OAuth Credentials

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select existing one
3. Navigate to **APIs & Services** → **Credentials**
4. Click **Create Credentials** → **OAuth 2.0 Client ID**
5. Configure OAuth consent screen if prompted:
   - User Type: External
   - App name: PayDhan
   - User support email: your email
   - Developer contact: your email
6. Create OAuth Client ID:
   - Application type: **Web application**
   - Name: PayDhan Web
   - Authorized JavaScript origins:
     - `http://localhost:3000` (for development)
     - `https://pay.nealjain.website` (for production)
   - Authorized redirect URIs:
     - `https://[YOUR-SUPABASE-PROJECT].supabase.co/auth/v1/callback`
     - Get this URL from Supabase Auth settings

## 3. Configure Supabase

1. Copy the **Client ID** and **Client Secret** from Google
2. In Supabase **Authentication** → **Providers** → **Google**:
   - Paste Client ID
   - Paste Client Secret
   - Enable the provider
   - Save

## 4. Update Environment Variables

Add to your `.env.local`:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

## 5. Test OAuth Flow

1. Start your dev server: `npm run dev`
2. Go to `/auth`
3. Click "Continue with Google"
4. Sign in with Google
5. Complete your profile (username, phone, PIN)
6. You should be redirected to onboarding/dashboard

## Troubleshooting

### "OAuth failed" error
- Check that Google OAuth is enabled in Supabase
- Verify redirect URIs match exactly
- Check browser console for errors

### "User creation failed" error
- Check Supabase logs
- Verify users table exists
- Check RLS policies allow inserts

### Kicked out during profile completion
- This is now fixed with proper session handling
- Session cookie is set immediately after OAuth
- Profile completion maintains the session

### Redirect URI mismatch
- Make sure the redirect URI in Google Console matches:
  `https://[YOUR-PROJECT].supabase.co/auth/v1/callback`
- Get exact URL from Supabase Auth settings

## Production Deployment

1. Add production domain to Google OAuth:
   - Authorized JavaScript origins: `https://pay.nealjain.website`
   - Authorized redirect URIs: (same Supabase callback URL)

2. Update Supabase Auth settings:
   - Site URL: `https://pay.nealjain.website`
   - Redirect URLs: Add `https://pay.nealjain.website/auth/callback`

3. Deploy and test!
