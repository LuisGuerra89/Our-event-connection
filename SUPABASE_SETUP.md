# Supabase Email Configuration

## Important: Configure Email Settings in Supabase Dashboard

For email confirmations to work properly, you need to configure the following in your Supabase project:

### 1. Email Authentication Settings

Go to: **Authentication → Providers → Email**

- ✅ Enable email provider
- ✅ Enable "Confirm email" (recommended for production)
- For development, you can disable "Confirm email" to skip email verification

### 2. Site URL Configuration

Go to: **Authentication → URL Configuration**

Add the following URLs:

**Site URL:**
- Production: `https://v0-event-platform-with-ai.vercel.app`
- Development: `http://localhost:3000`

**Redirect URLs (add both):**
- `https://v0-event-platform-with-ai.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback`

### 3. Email Templates (Optional)

Go to: **Authentication → Email Templates**

You can customize the confirmation email template. Make sure it includes the `{{ .ConfirmationURL }}` variable.

### 4. Testing During Development

If you want to skip email confirmation during development:

1. Go to **Authentication → Providers → Email**
2. Toggle OFF "Confirm email"
3. Users will be automatically confirmed upon signup

For production, always keep email confirmation enabled for security.

### 5. Email Provider (Production)

For production, configure a custom SMTP provider:

1. Go to **Project Settings → Auth → SMTP Settings**
2. Enable custom SMTP
3. Configure with your email service (SendGrid, AWS SES, etc.)

The default Supabase email service may have rate limits and deliverability issues.

---

## Current Configuration

The app is configured to:
- Redirect to `/auth/callback` after email confirmation
- Handle the auth code exchange automatically
- Redirect to `/onboarding/waiver` after successful confirmation
- Show clear instructions on the verify-email page
