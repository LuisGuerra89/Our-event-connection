import Link from "next/link"
import { Logo } from "@/components/logo"
import { Facebook, Instagram, Linkedin, Youtube, Mail } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"

interface PageStatus {
  [key: string]: boolean
}

export async function Footer() {
  const currentYear = new Date().getFullYear()

  // Fetch page statuses from CMS
  const supabase = await createServerClient()
  const { data: pages } = await supabase.from("cms_content").select("page_key, status")

  // Create a map of active pages
  const activePages: PageStatus = {}
  if (pages) {
    pages.forEach((page) => {
      activePages[page.page_key] = page.status === "active"
    })
  }

  // Define footer links with their page keys
  const footerLinks = {
    company: [
      { label: "About Us", href: "/about", pageKey: "about_us" },
      { label: "How It Works", href: "/how-it-works", pageKey: "how_it_works" },
      { label: "Pricing", href: "/pricing", pageKey: "pricing" },
      { label: "Contact Us", href: "/contact", pageKey: "contact_us" },
      { label: "Affiliates", href: "/affiliates", pageKey: "affiliates" },
    ],
    events: [
      { label: "All Events", href: "/events", pageKey: "events" },
      { label: "Membership", href: "/membership", pageKey: "membership" },
      { label: "Matchmaking", href: "/matchmaking", pageKey: "matchmaking" },
    ],
    legal: [
      { label: "Privacy Policy", href: "/privacy", pageKey: "privacy_policy" },
      { label: "Terms of Service", href: "/terms", pageKey: "terms_conditions" },
      { label: "FAQ", href: "/faq", pageKey: "faq" },
    ],
  }

  // Helper function to check if page should be displayed
  const isPageActive = (pageKey?: string) => {
    if (!pageKey) return true // If no page key, always show
    return activePages[pageKey] !== false // Default to true if not found
  }

  return (
    <footer className="border-t bg-muted/30">
      <div className="container mx-auto px-4 py-12">
        <div className="grid gap-8 grid-cols-2 md:grid-cols-2 lg:grid-cols-5">
          {/* Brand Section - Full width on mobile, 2 cols on tablet */}
          <div className="col-span-2 md:col-span-1 lg:col-span-2">
            <Logo />
            <p className="text-sm text-muted-foreground mt-4 max-w-md">
              It all starts with one Event to find a perfect Match. Join thousands of singles attending our curated social events
              and connect with compatible people based on your preferences.
            </p>
            
            {/* Social Media Links */}
            <div className="flex gap-4 mt-6">
              <a
                href="https://www.facebook.com/oureventconnection/"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Facebook"
              >
                <Facebook className="h-5 w-5" />
              </a>
              <a
                href="https://twitter.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="X"
              >
                <svg className="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24h-6.6l-5.165-6.75-5.906 6.75h-3.31l7.73-8.835L.424 2.25h6.7l4.681 6.15 5.439-6.15zM17.55 19.5h1.833L5.75 3.75H3.81l13.74 15.75z" />
                </svg>
              </a>
              <a
                href="https://instagram.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="Instagram"
              >
                <Instagram className="h-5 w-5" />
              </a>
              <a
                href="https://linkedin.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="LinkedIn"
              >
                <Linkedin className="h-5 w-5" />
              </a>
              <a
                href="https://youtube.com"
                target="_blank"
                rel="noopener noreferrer"
                className="text-muted-foreground hover:text-primary transition-colors"
                aria-label="YouTube"
              >
                <Youtube className="h-5 w-5" />
              </a>
            </div>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Company</h4>
            <ul className="space-y-3 text-xs md:text-sm">
              {footerLinks.company.map((link) =>
                isPageActive(link.pageKey) ? (
                  <li key={link.pageKey}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ) : null
              )}
            </ul>
          </div>

          {/* Events Links */}
          <div>
            <h4 className="font-semibold mb-4 text-sm md:text-base">Events</h4>
            <ul className="space-y-3 text-xs md:text-sm">
              {footerLinks.events.map((link) =>
                isPageActive(link.pageKey) ? (
                  <li key={link.pageKey}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ) : null
              )}
              <li>
                <Link href="/events?international=true" className="text-muted-foreground hover:text-foreground transition-colors">
                  International Events
                </Link>
              </li>
              <li>
                <Link href="/events/past" className="text-muted-foreground hover:text-foreground transition-colors">
                  Past Events
                </Link>
              </li>
            </ul>
          </div>

          {/* Legal Links */}
          <div className="col-span-2 md:col-span-1 lg:col-span-1">
            <h4 className="font-semibold mb-4 text-sm md:text-base">Legal & Support</h4>
            <ul className="space-y-3 text-xs md:text-sm">
              {footerLinks.legal.map((link) =>
                isPageActive(link.pageKey) ? (
                  <li key={link.pageKey}>
                    <Link href={link.href} className="text-muted-foreground hover:text-foreground transition-colors">
                      {link.label}
                    </Link>
                  </li>
                ) : null
              )}
              <li>
                <a 
                  href="mailto:support@ourloveconnection.com" 
                  className="text-muted-foreground hover:text-foreground transition-colors inline-flex items-center gap-1"
                >
                  <Mail className="h-3 w-3" />
                  Support
                </a>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Section */}
        <div className="mt-12 pt-8 border-t">
          <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-center md:text-left">
            <p className="text-xs md:text-sm text-muted-foreground">
              &copy; {currentYear} Our Love Connection. All rights reserved.
            </p>
            <div className="flex gap-4 md:gap-6 text-xs md:text-sm flex-wrap justify-center md:justify-end">
              <Link href="/sitemap" className="text-muted-foreground hover:text-foreground transition-colors">
                Sitemap
              </Link>
              <Link href="/accessibility" className="text-muted-foreground hover:text-foreground transition-colors">
                Accessibility
              </Link>
              <Link href="/cookies" className="text-muted-foreground hover:text-foreground transition-colors">
                Cookie Policy
              </Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  )
}
