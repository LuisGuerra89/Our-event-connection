# Database Migration Guide

## Automated Database Migrations

This guide explains how to run all 55 database migration scripts automatically when migrating to a new Supabase project.

## Quick Start

### Option 1: NPM Script (Recommended)

The easiest way to run all migrations:

```bash
npm run migrate
```

This uses the Node.js migration runner that connects via the Supabase API.

### Option 2: Bash Script

If you prefer using psql directly:

```bash
./scripts/run-migrations.sh
```

## Prerequisites

### For NPM Script:
- Node.js 18+
- `.env.local` file with proper Supabase credentials

### For Bash Script:
- `psql` (PostgreSQL client) installed
- Database connection string

## Configuration

### 1. Get Your Supabase Credentials

Navigate to your Supabase project dashboard:

1. Settings → API
2. Copy your:
   - Project URL (`SUPABASE_URL`)
   - Service Role Key (`SUPABASE_SERVICE_ROLE_KEY`)

3. Settings → Database → Connection Pooling
4. Copy the connection string (`SUPABASE_DB_URL`)

### 2. Set Up `.env.local`

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key-here
SUPABASE_DB_URL=postgresql://postgres:PASSWORD@REGION.pooler.supabase.com:6543/postgres
```

**Important:** Remove any quotes around values in `.env.local`

## Running Migrations

### Automated Run (Recommended)

```bash
npm run migrate
```

The script will:
- Display a summary of total scripts
- Execute each script in numerical order
- Show progress with ✓ (success) or ✗ (failed) indicators
- Display a final summary report

### Manual Execution

If you prefer to run scripts manually in Supabase SQL Editor:

1. Go to your Supabase project → SQL Editor
2. Open each SQL file from `/scripts/` folder
3. Copy and paste the content
4. Execute the script
5. Repeat for each file in numerical order

## Migration Scripts (55 Total)

Scripts are executed in numerical order:

### Core Infrastructure (000-009)
- `000_reset_database.sql` - Clears database
- `001_create_profiles.sql` - User profiles table
- `002_create_waivers.sql` - Event waivers table
- `003_create_events.sql` - Events table (20+ fields)
- `004_create_event_attendees.sql` - Event attendance
- `005_create_preferences.sql` - User preferences
- `006_create_user_attributes.sql` - User attributes
- `007_create_matches.sql` - Match tracking
- `008_add_admin_roles.sql` - Admin roles
- `009_fix_rls_recursion.sql` - RLS policy fixes

### Extended Features (010-055)
- Admin and authentication setup
- Email templates and notifications
- Location and category management
- Subscription and payment tables
- Referral program tables
- Affiliate system tables
- Chat and messaging infrastructure
- Social login enhancements

## Main Tables Created

- **profiles** - User profile information
- **events** - Event details and metadata
- **event_registrations** - User event registrations
- **event_attendees** - Event attendance tracking
- **subscription_plans** - Membership plan definitions
- **user_subscriptions** - Active user subscriptions
- **referrals** - Referral program tracking
- **affiliates** - Affiliate partner information
- **waivers** - Event waivers and agreements
- **preferences** - User preference settings
- **matches** - User matches for events
- **notifications** - System notifications
- **contact_forms** - Contact form submissions
- **roles** - User role definitions
- **site_settings** - Global site configuration
- **email_templates** - Email template storage
- **locations** - Event location data
- **categories** - Event categories
- **chat_messages** - User chat messages
- **payments** - Payment transaction records
- And more...

## Troubleshooting

### Error: Missing Environment Variables

**Error Message:** "SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY must be set"

**Solution:**
- Verify `.env.local` exists in project root
- Check all required variables are set
- Ensure no quotes around values

### Error: Permission Denied on Bash Script

**Error Message:** "Permission denied"

**Solution:**
```bash
chmod +x ./scripts/run-migrations.sh
```

### Error: Database Connection Failed

**Error Message:** "could not connect to database"

**Solution:**
- Verify connection string is correct
- Check IP whitelist in Supabase settings
- Ensure your IP address is allowed
- Test the connection string in terminal

### Error: Some Scripts Failed

**Possible Causes:**
- Dependency issues between scripts
- Database state inconsistencies
- RLS policy conflicts

**Solution:**
- Review the failed script's SQL code
- Check Supabase logs for detailed errors
- Run migrations again (some failures are recoverable)

## Post-Migration Checklist

- [ ] All 55 scripts executed successfully
- [ ] Check Supabase dashboard for all tables
- [ ] Verify RLS policies are enabled
- [ ] Test user registration flow
- [ ] Test event creation and browsing
- [ ] Verify email notifications work
- [ ] Test subscription signup
- [ ] Confirm referral system active

## Migration from Development to Production

1. Update `.env.local` with production Supabase credentials
2. Run `npm run migrate` on production database
3. Verify no data loss (if migrating existing data)
4. Test all features thoroughly
5. Monitor logs for errors

## Rollback

To reset the database:
1. Run only `scripts/000_reset_database.sql`
2. Then run `npm run migrate` to rebuild

**Warning:** This will delete all data. Use only for development environments.

## Support

For issues or questions:
- Review the SQL files in `/scripts/` directory
- Check Supabase documentation: https://supabase.com/docs
- Review RLS policy implementations in migration scripts
