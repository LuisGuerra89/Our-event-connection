# Social Login Configuration Guide

## Overview
This guide explains how to configure Google and Facebook OAuth for social login in your Supabase project.

## Database Setup

### 1. Run SQL Scripts
Execute the following scripts in your Supabase SQL Editor in order:

```sql
-- 1. Add profile completion tracking
-- File: scripts/039_add_profile_completion_tracking.sql
ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS is_profile_complete BOOLEAN DEFAULT FALSE,
ADD COLUMN IF NOT EXISTS auth_provider TEXT DEFAULT 'email';

UPDATE profiles 
SET is_profile_complete = TRUE
WHERE is_profile_complete IS NULL OR is_profile_complete = FALSE;

CREATE INDEX IF NOT EXISTS idx_profiles_is_profile_complete ON profiles(is_profile_complete);
CREATE INDEX IF NOT EXISTS idx_profiles_auth_provider ON profiles(auth_provider);
```

```sql
-- 2. Update handle_new_user trigger to detect social login
-- File: scripts/040_update_handle_new_user_social_login.sql
-- (Run the complete script from the file)
```

### 2. Configure Google OAuth

1. Go to [Google Cloud Console](https://console.cloud.google.com/)
2. Create a new project or select an existing one
3. Enable Google+ API
4. Go to "Credentials" → "Create Credentials" → "OAuth client ID"
5. Configure OAuth consent screen if prompted
6. Choose "Web application" as application type
7. Add authorized redirect URIs:
   - For local development: `http://localhost:3000/auth/callback`
   - For production: `https://your-project.supabase.co/auth/v1/callback`
8. Copy the Client ID and Client Secret

#### In Supabase Dashboard:

1. Go to Authentication → Providers
2. Enable "Google"
3. Paste Client ID
4. Paste Client Secret
5. Save

### 3. Configure Facebook OAuth

1. Go to [Facebook Developers](https://developers.facebook.com/)
2. Create a new app or select an existing one
3. Add "Facebook Login" product to your app
4. Go to Facebook Login Settings
5. Add OAuth Redirect URIs:
   - `https://your-project.supabase.co/auth/v1/callback`
6. In App Settings → Basic:
   - Copy App ID
   - Copy App Secret

#### In Supabase Dashboard:

1. Go to Authentication → Providers
2. Enable "Facebook"
3. Paste App ID (as Client ID)
4. Paste App Secret (as Client Secret)
5. Save

## Application Flow

### For Social Login Users:

1. **User clicks "Sign in with Google/Facebook"**
   - OAuth flow initiates
   - User authorizes on provider's site
   - Redirects back to `/auth/callback`

2. **Callback Handler (`app/auth/callback/route.ts`)**
   - Exchanges code for session
   - Checks if `is_profile_complete === false`
   - If incomplete, redirects to `/onboarding/complete-profile`
   - If complete, checks waiver → redirects to dashboard

3. **Complete Profile Page (`app/onboarding/complete-profile/page.tsx`)**
   - Forces user to fill required fields:
     - Full Name
     - Phone Number
     - Date of Birth
     - Gender
     - Location (City, State, Country)
     - Bio (optional)
   - Sets `is_profile_complete = true`
   - Redirects to waiver onboarding

4. **Database Trigger (`handle_new_user`)**
   - Automatically detects social login (provider !== 'email')
   - Creates profile with `is_profile_complete = false`
   - Stores `auth_provider` (google, facebook, etc.)

### For Email/Password Users:

1. Normal registration flow (unchanged)
2. Profile created with `is_profile_complete = true`
3. Goes directly to waiver onboarding

## Testing

### Local Testing:

1. Make sure you've added `http://localhost:3000/auth/callback` to Google OAuth redirect URIs
2. For Facebook, you may need to add test users in App Dashboard
3. Test both login and sign-up flows with social providers
4. Verify profile completion page appears for new social users
5. Verify returning social users skip profile completion

### Production Testing:

1. Update redirect URIs in Google/Facebook to production URLs
2. Update `NEXT_PUBLIC_SITE_URL` in environment variables
3. Test complete flow in production environment

## Troubleshooting

### "redirect_uri_mismatch" Error
- Verify the redirect URI in Google/Facebook matches exactly what's in Supabase
- Include protocol (http:// or https://)
- Don't include trailing slashes

### Users Not Being Redirected to Complete Profile
- Check that scripts 039 and 040 were run successfully
- Verify `is_profile_complete` column exists in profiles table
- Check callback route is correctly checking `is_profile_complete`

### Profile Not Created for Social Users
- Check Supabase logs for trigger errors
- Verify `handle_new_user` trigger exists and is enabled
- Check RLS policies allow profile insertion

## Security Notes

- Never commit OAuth credentials to version control
- Store credentials in Supabase dashboard or environment variables
- Use different OAuth apps for development and production
- Regularly rotate secrets for production apps
- Review OAuth scopes requested (we only need basic profile info)

## Features

✅ Google OAuth login/signup
✅ Facebook OAuth login/signup
✅ Automatic profile creation for social users
✅ Force profile completion for social users
✅ Track authentication provider
✅ Same user flow for all authentication methods after profile completion
✅ Existing users skip profile completion
✅ Referral code support (future enhancement for social users)
