# Supabase Setup Guide

## Email Authentication Configuration

For email confirmations to work properly, configure the following in your Supabase project:

### 1. Email Provider Settings

Navigate to: **Authentication → Providers → Email**

- ✅ Enable email provider
- ✅ Enable "Confirm email" (recommended for production)
- For development, you can disable "Confirm email" to skip email verification

### 2. URL Configuration

Navigate to: **Authentication → URL Configuration**

Add the following URLs:

**Site URL:**
- Production: `https://our-event-connection.vercel.app` (or your custom domain)
- Development: `http://localhost:3000`

**Redirect URLs:**
- `https://our-event-connection.vercel.app/auth/callback`
- `http://localhost:3000/auth/callback`

### 3. Email Templates (Optional)

Navigate to: **Authentication → Email Templates**

Customize the confirmation email template if needed. Ensure it includes the `{{ .ConfirmationURL }}` variable.

### 4. Development vs Production

**For Development:**
- You can disable "Confirm email" to skip email verification
- Users will be automatically confirmed upon signup
- This speeds up testing workflows

**For Production:**
- Always enable email confirmation for security
- Configure a custom SMTP provider

### 5. Production Email Provider

For production deployments, configure a custom SMTP provider:

1. Navigate to: **Project Settings → Auth → SMTP Settings**
2. Enable custom SMTP
3. Configure with your email service provider:
   - SendGrid
   - AWS SES
   - Mailgun
   - Or your preferred SMTP service

The default Supabase email service may have rate limits and deliverability issues in production.

### 6. Environment Variables

Ensure your `.env.local` file contains:

```env
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

## Application Authentication Flow

The app is configured to:
- Redirect to `/auth/callback` after email confirmation
- Exchange authentication code automatically
- Redirect to `/onboarding/waiver` after successful confirmation
- Display clear instructions on the verify-email page

## RLS (Row Level Security) Policies

All tables have RLS policies enabled. The service role key has full access for administrative operations.

See the migration scripts in `/scripts/` for detailed RLS policy configurations.
