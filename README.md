# Our Event Connection

A modern, full-featured event platform for connecting singles through carefully curated social experiences. Built with Next.js, React, TypeScript, and powered by Supabase.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-000000?style=for-the-badge&logo=vercel)](https://vercel.com)
[![Built with Next.js](https://img.shields.io/badge/Built%20with-Next.js%2016-000000?style=for-the-badge&logo=next.js)](https://nextjs.org)
[![Database: Supabase](https://img.shields.io/badge/Database-Supabase-3FCF8E?style=for-the-badge&logo=supabase)](https://supabase.com)

## 🎯 Overview

Our Event Connection is a comprehensive event management and social networking platform that brings singles together through shared interests and experiences.

### Key Features

- **Event Management** - Browse, create, and register for curated social events
- **User Profiles** - Complete profiles with preferences, interests, and matching
- **Membership Plans** - Flexible subscription tiers with exclusive benefits
- **Referral System** - Earn free activities through friend referrals
- **Affiliate Program** - Partner opportunities and revenue sharing
- **Real-time Chat** - Connect with event attendees instantly
- **Notifications** - Real-time updates for important events
- **Social Authentication** - Sign in with Google or Facebook
- **Admin Dashboard** - Comprehensive management tools
- **Event Waivers** - Digital waiver collection and management

## 🛠 Tech Stack

| Layer | Technology |
|-------|-----------|
| **Frontend** | Next.js 16, React 19, TypeScript |
| **Styling** | Tailwind CSS, Radix UI |
| **Backend** | Supabase (PostgreSQL, Auth, RLS) |
| **Deployment** | Vercel |
| **Payments** | Stripe |
| **Email** | Nodemailer |
| **Icons** | Lucide React |

## 📦 Project Structure

```
app/
├── api/                    # API routes
├── auth/                   # Authentication pages & flows
├── dashboard/              # Protected user dashboard
│   ├── events/            # User's registered events
│   ├── matches/           # Event matches
│   ├── profile/           # User profile management
│   ├── referrals/         # Referral tracking
│   ├── subscriptions/      # Subscription management
│   └── chat/              # Messaging
├── events/                # Public event browsing
├── pricing/               # Membership plans
├── onboarding/            # User setup flows
├── admin/                 # Admin dashboard
├── about/                 # About page
├── contact/               # Contact page
└── layout.tsx             # Root layout

components/
├── ui/                     # Reusable UI components
├── admin/                  # Admin-specific components
├── chat/                   # Chat components
├── public-header.tsx       # Main navigation
└── app-sidebar.tsx         # Dashboard sidebar

lib/
├── supabase/              # Supabase client & utilities
├── stripe.ts              # Stripe integration
├── email-service.ts       # Email utilities
├── auth-utils.ts          # Authentication helpers
└── utils.ts               # General utilities

scripts/
└── *.sql                   # 55 database migration scripts

styles/
└── globals.css             # Global styles
```

## 🚀 Quick Start

### Prerequisites

- Node.js 18 or higher
- npm or pnpm
- Supabase account
- Git

### Installation

1. **Clone the repository**
```bash
git clone <repository-url>
cd <project-name>
```

2. **Install dependencies**
```bash
npm install
# or
pnpm install
```

3. **Configure environment variables**
```bash
# Copy template if available
cp .env.local.example .env.local

# Add your Supabase credentials:
# NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
# NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
# SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
```

4. **Run database migrations**
```bash
npm run migrate
```

5. **Start development server**
```bash
npm run dev
```

Visit [http://localhost:3000](http://localhost:3000) to view the application.

## 📝 Available Scripts

```bash
# Development
npm run dev              # Start development server

# Production
npm run build           # Build for production
npm start               # Start production server

# Database
npm run migrate         # Run all migrations
npm run migrate:bash    # Run migrations via bash

# Code quality
npm lint                # Run ESLint
```

## 🗄 Database Setup

The application includes 55 automated migration scripts that set up the complete database schema.

**Tables Created:**
- profiles, events, event_registrations, event_attendees
- subscription_plans, user_subscriptions
- referrals, affiliates
- waivers, preferences, matches
- notifications, contact_forms
- roles, site_settings, email_templates
- locations, categories, chat_messages, payments
- And more...

**To run migrations:**

### Option 1: Using NPM (Recommended)
```bash
npm run migrate
```

### Option 2: Manual Setup
1. Go to your Supabase project SQL Editor
2. Copy and paste each script from `/scripts/` folder in numerical order
3. Execute each script

See [MIGRATION_GUIDE.md](./MIGRATION_GUIDE.md) for detailed instructions.

## 🔐 Configuration Guides

- **[Supabase Setup](./SUPABASE_SETUP.md)** - Email authentication and URL configuration
- **[Social Login](./SOCIAL_LOGIN_SETUP.md)** - Google and Facebook OAuth setup
- **[Database Migrations](./MIGRATION_GUIDE.md)** - Migration scripts and troubleshooting

## 🔑 Environment Variables

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
SUPABASE_SERVICE_ROLE_KEY=your-service-role-key

# Stripe
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Optional - PostgreSQL Direct Access
SUPABASE_DB_URL=postgresql://...
```

## 📋 Features in Detail

### Authentication
- Email/password signup and login
- Google OAuth integration
- Facebook OAuth integration
- Email verification
- Automatic profile creation

### Events
- Browse public events
- Register for events
- View event details (20+ fields)
- Manage registrations
- Event categories and locations

### User Dashboard
- Profile management
- Event registrations
- Match recommendations
- Referral tracking
- Subscription management
- Chat messaging

### Membership
- Multiple subscription tiers
- Recurring billing with Stripe
- Auto-renewal options
- Cancel anytime

### Referrals
- Generate unique referral codes
- Track referral stats
- Earn free activities (25 referrals = 1 free activity)
- Share referral links

### Admin Tools
- User management
- Event administration
- Subscription monitoring
- Referral tracking
- System settings

## 🧪 Testing

### Local Development Testing
1. Create test user accounts
2. Test event creation and registration
3. Test membership signup
4. Test referral flows
5. Test admin functions

### Production Checklist
- [ ] Email configuration working
- [ ] OAuth providers configured
- [ ] Stripe production keys set
- [ ] Database backups enabled
- [ ] Error logging configured
- [ ] Performance monitoring active

## 🐛 Troubleshooting

### Common Issues

**Build Errors**
- Clear `.next` folder: `rm -rf .next`
- Reinstall dependencies: `rm -rf node_modules && npm install`
- Check environment variables are set

**Database Connection Issues**
- Verify Supabase credentials in `.env.local`
- Check IP whitelist in Supabase settings
- Ensure service role key has correct permissions

**Authentication Issues**
- Verify redirect URLs in Supabase
- Check OAuth provider configuration
- Review browser console for errors

See configuration guides for detailed troubleshooting steps.

## 📚 Documentation

- [Supabase Documentation](https://supabase.com/docs)
- [Next.js Documentation](https://nextjs.org/docs)
- [Vercel Deployment](https://vercel.com/docs)
- [Stripe Integration](https://stripe.com/docs)

## 🚢 Deployment

### Deploy to Vercel

1. Push code to GitHub
2. Import project in Vercel dashboard
3. Add environment variables
4. Deploy

Automatic deployments trigger on push to main branch.

### Set Environment Variables in Vercel
- Navigate to Settings → Environment Variables
- Add all required variables from `.env.local`
- Redeploy

## 📄 License

MIT License - feel free to use this project for personal or commercial purposes.

## 🤝 Contributing

Contributions are welcome! Please feel free to submit pull requests or open issues.

## 📧 Support

For issues, questions, or suggestions:
1. Check existing documentation
2. Review configuration guides
3. Check troubleshooting section
4. Open an issue on GitHub
