# Authentication Setup Guide

This app now supports three authentication methods:
1. **Google OAuth** - Sign in with Google account
2. **Email/Password** - Traditional email and password authentication
3. **Username/PIN** - Simple 4-digit PIN authentication

## Setup Instructions

### 1. Environment Variables

Create a `.env.local` file in the root directory:

```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_URL=your_supabase_project_url
SUPABASE_ANON_KEY=your_supabase_anon_key

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. Supabase Configuration

#### A. Run Database Migration

Execute the SQL script in your Supabase SQL Editor:

```bash
# Run this in Supabase SQL Editor
scripts/005_add_email_auth.sql
```

Or manually run:

```sql
-- Add email column to users table
ALTER TABLE users ADD COLUMN IF NOT EXISTS email TEXT UNIQUE;

-- Make pin_hash nullable
ALTER TABLE users ALTER COLUMN pin_hash DROP NOT NULL;

-- Add index on email
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
```

#### B. Enable Google OAuth Provider

1. Go to your Supabase Dashboard
2. Navigate to **Authentication** → **Providers**
3. Find **Google** and click to configure
4. Enable the Google provider
5. Add your Google OAuth credentials:
   - Go to [Google Cloud Console](https://console.cloud.google.com/)
   - Create a new project or select existing
   - Enable Google+ API
   - Go to **Credentials** → **Create Credentials** → **OAuth 2.0 Client ID**
   - Application type: **Web application**
   - Add authorized redirect URIs:
     - `https://your-project-ref.supabase.co/auth/v1/callback`
     - `http://localhost:3000/auth/callback` (for local development)
   - Copy the **Client ID** and **Client Secret**
   - Paste them in Supabase Google provider settings

#### C. Configure Email Authentication

1. In Supabase Dashboard, go to **Authentication** → **Providers**
2. Ensure **Email** provider is enabled
3. Configure email templates (optional):
   - Go to **Authentication** → **Email Templates**
   - Customize confirmation and password reset emails

#### D. Update Authentication Settings

1. Go to **Authentication** → **URL Configuration**
2. Add your site URL: `http://localhost:3000` (for development)
3. Add redirect URLs:
   - `http://localhost:3000/auth/callback`
   - `https://your-production-domain.com/auth/callback` (for production)

### 3. Update Users Table Structure

Your `users` table should have these columns:

```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  username TEXT UNIQUE NOT NULL,
  email TEXT UNIQUE,
  pin_hash TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### 4. Test Authentication

1. Start the development server:
   ```bash
   pnpm dev
   ```

2. Navigate to `http://localhost:3000/auth`

3. Test each authentication method:
   - **Google**: Click "Continue with Google" button
   - **Email/Password**: Switch to Email tab, enter credentials
   - **Username/PIN**: Switch to PIN tab, enter username and 4-digit PIN

## Authentication Flow

### Google OAuth Flow
1. User clicks "Continue with Google"
2. Redirected to Google login
3. After approval, redirected to `/auth/callback`
4. User record created in database
5. Session created and redirected to dashboard

### Email/Password Flow
1. User enters email, password, and username
2. Supabase creates auth user
3. User record created in database
4. Email verification sent (if enabled)
5. Session created and redirected to dashboard

### Username/PIN Flow
1. User enters username and 4-digit PIN
2. PIN is hashed and verified
3. Custom session created
4. Redirected to dashboard

## Security Features

- Passwords are hashed by Supabase Auth
- PINs are hashed using bcrypt with 12 salt rounds
- Row Level Security (RLS) policies protect user data
- Session management with secure cookies
- CSRF protection via middleware

## API Endpoints

- `POST /api/auth/signup` - Email/password signup
- `POST /api/auth/signin` - Email/password signin
- `POST /api/auth/create` - Username/PIN signup
- `POST /api/auth/login` - Username/PIN signin
- `POST /api/auth/logout` - Sign out
- `GET /auth/callback` - OAuth callback handler

## Troubleshooting

### Google OAuth not working
- Check redirect URIs match exactly in Google Console and Supabase
- Ensure Google+ API is enabled
- Verify Client ID and Secret are correct

### Email verification not sending
- Check Supabase email settings
- Verify SMTP configuration (if using custom SMTP)
- Check spam folder

### PIN authentication failing
- Ensure `pin_hash` column exists in users table
- Check bcrypt is installed: `pnpm add bcryptjs`
- Verify PIN is exactly 4 digits

## Production Deployment

1. Update `.env.local` with production values
2. Add production domain to Supabase URL Configuration
3. Update Google OAuth redirect URIs with production domain
4. Enable email verification for production
5. Set up proper SMTP for email delivery
6. Configure rate limiting for auth endpoints

## Additional Resources

- [Supabase Auth Documentation](https://supabase.com/docs/guides/auth)
- [Next.js Authentication](https://nextjs.org/docs/authentication)
- [Google OAuth Setup](https://developers.google.com/identity/protocols/oauth2)
