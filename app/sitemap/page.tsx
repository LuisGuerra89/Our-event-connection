import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { 
  Home, 
  Info, 
  Calendar, 
  Users, 
  Mail, 
  HelpCircle, 
  FileText, 
  Shield, 
  CreditCard,
  User,
  Settings,
  MessageSquare,
  Heart,
  LogIn,
  UserPlus,
  MapPin,
  Crown
} from "lucide-react"

export const metadata = {
  title: "Sitemap - Our Love Connection",
  description: "Navigate through all pages of Our Love Connection. Find events, membership options, and more.",
}

interface SitemapSection {
  title: string
  description: string
  icon: React.ReactNode
  links: {
    href: string
    label: string
    description?: string
  }[]
}

const sitemapSections: SitemapSection[] = [
  {
    title: "Main Pages",
    description: "Core pages of Our Love Connection",
    icon: <Home className="h-5 w-5" />,
    links: [
      { href: "/", label: "Home", description: "Welcome to Our Love Connection" },
      { href: "/about", label: "About Us", description: "Learn about our mission" },
      { href: "/how-it-works", label: "How It Works", description: "Discover how our platform works" },
      { href: "/contact", label: "Contact", description: "Get in touch with us" },
      { href: "/faq", label: "FAQ", description: "Frequently asked questions" },
    ],
  },
  {
    title: "Events",
    description: "Browse and discover events",
    icon: <Calendar className="h-5 w-5" />,
    links: [
      { href: "/events", label: "All Events", description: "Browse all available events" },
      { href: "/events/upcoming", label: "Upcoming Events", description: "Events coming soon" },
      { href: "/events/this-week", label: "This Week", description: "Events happening this week" },
      { href: "/events/past", label: "Past Events", description: "View past events" },
    ],
  },
  {
    title: "Membership",
    description: "Membership plans and pricing",
    icon: <Crown className="h-5 w-5" />,
    links: [
      { href: "/membership", label: "Membership Plans", description: "View available membership options" },
      { href: "/pricing", label: "Pricing", description: "See our pricing details" },
    ],
  },
  {
    title: "Affiliates",
    description: "Partner with us",
    icon: <Users className="h-5 w-5" />,
    links: [
      { href: "/affiliates", label: "Affiliates", description: "Browse our affiliate partners" },
      { href: "/affiliates/apply", label: "Become an Affiliate", description: "Apply to be an affiliate partner" },
    ],
  },
  {
    title: "Authentication",
    description: "Account access",
    icon: <LogIn className="h-5 w-5" />,
    links: [
      { href: "/auth/login", label: "Login", description: "Access your account" },
      { href: "/auth/sign-up", label: "Sign Up", description: "Create a new account" },
      { href: "/auth/forgot-password", label: "Forgot Password", description: "Reset your password" },
    ],
  },
  {
    title: "Dashboard",
    description: "Member dashboard (requires login)",
    icon: <User className="h-5 w-5" />,
    links: [
      { href: "/dashboard", label: "Dashboard Home", description: "Your personal dashboard" },
      { href: "/dashboard/profile", label: "My Profile", description: "Manage your profile" },
      { href: "/dashboard/events", label: "My Events", description: "Events you're attending" },
      { href: "/dashboard/matches", label: "My Matches", description: "View your matches" },
      { href: "/dashboard/chat", label: "Messages", description: "Chat with your connections" },
      { href: "/dashboard/subscriptions", label: "Subscriptions", description: "Manage your subscription" },
      { href: "/dashboard/referrals", label: "Referrals", description: "Your referral program" },
      { href: "/dashboard/settings", label: "Settings", description: "Account settings" },
    ],
  },
  {
    title: "Onboarding",
    description: "Complete your profile (requires login)",
    icon: <Heart className="h-5 w-5" />,
    links: [
      { href: "/onboarding/profile", label: "Profile Setup", description: "Set up your profile" },
      { href: "/onboarding/attributes", label: "Attributes", description: "Add your attributes" },
      { href: "/onboarding/preferences", label: "Preferences", description: "Set your preferences" },
      { href: "/onboarding/waiver", label: "Waiver", description: "Review and sign waiver" },
    ],
  },
  {
    title: "Legal",
    description: "Legal information",
    icon: <FileText className="h-5 w-5" />,
    links: [
      { href: "/terms", label: "Terms of Service", description: "Our terms and conditions" },
      { href: "/privacy", label: "Privacy Policy", description: "How we handle your data" },
      { href: "/cookies", label: "Cookie Policy", description: "How we use cookies" },
      { href: "/accessibility", label: "Accessibility", description: "Our accessibility commitment" },
    ],
  },
]

export default function SitemapPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-6xl">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Sitemap</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Navigate through all pages of Our Love Connection. Find what you're looking for quickly and easily.
          </p>
        </div>

        {/* Sitemap Grid */}
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {sitemapSections.map((section) => (
            <Card key={section.title} className="flex flex-col">
              <CardHeader>
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-primary/10 rounded-lg text-primary">
                    {section.icon}
                  </div>
                  <div>
                    <CardTitle className="text-lg">{section.title}</CardTitle>
                    <CardDescription className="text-sm">
                      {section.description}
                    </CardDescription>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="flex-1">
                <ul className="space-y-2">
                  {section.links.map((link) => (
                    <li key={link.href}>
                      <Link
                        href={link.href}
                        className="group flex flex-col hover:bg-muted/50 rounded-md p-2 -mx-2 transition-colors"
                      >
                        <span className="text-sm font-medium group-hover:text-primary transition-colors">
                          {link.label}
                        </span>
                        {link.description && (
                          <span className="text-xs text-muted-foreground">
                            {link.description}
                          </span>
                        )}
                      </Link>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Quick Links Footer */}
        <div className="mt-16 pt-8 border-t">
          <h2 className="text-2xl font-semibold text-center mb-8">Quick Links</h2>
          <div className="flex flex-wrap justify-center gap-4">
            <Link
              href="/"
              className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-full hover:bg-primary/90 transition-colors"
            >
              <Home className="h-4 w-4" />
              Home
            </Link>
            <Link
              href="/events"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Calendar className="h-4 w-4" />
              Events
            </Link>
            <Link
              href="/membership"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Crown className="h-4 w-4" />
              Membership
            </Link>
            <Link
              href="/contact"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <Mail className="h-4 w-4" />
              Contact
            </Link>
            <Link
              href="/auth/sign-up"
              className="inline-flex items-center gap-2 px-4 py-2 bg-secondary text-secondary-foreground rounded-full hover:bg-secondary/80 transition-colors"
            >
              <UserPlus className="h-4 w-4" />
              Sign Up
            </Link>
          </div>
        </div>

        {/* SEO Text */}
        <div className="mt-12 text-center text-sm text-muted-foreground">
          <p>
            Can't find what you're looking for?{" "}
            <Link href="/contact" className="text-primary hover:underline">
              Contact us
            </Link>{" "}
            and we'll help you out.
          </p>
        </div>
      </div>
    </PublicPageLayout>
  )
}
