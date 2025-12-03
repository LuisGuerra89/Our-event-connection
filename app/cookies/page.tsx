import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import Link from "next/link"
import { 
  Cookie, 
  Shield, 
  BarChart3, 
  Settings,
  Lock,
  Info
} from "lucide-react"

export const metadata = {
  title: "Cookie Policy - Our Love Connection",
  description: "Learn about how Our Love Connection uses cookies and similar technologies to improve your experience.",
}

const cookieTypes = [
  {
    icon: <Lock className="h-5 w-5" />,
    type: "Essential Cookies",
    description: "These cookies are necessary for the website to function properly. They enable basic functions like page navigation, secure areas access, and authentication. The website cannot function properly without these cookies.",
    canDisable: false,
  },
  {
    icon: <Settings className="h-5 w-5" />,
    type: "Functional Cookies",
    description: "These cookies enable the website to provide enhanced functionality and personalization. They may be set by us or by third-party providers whose services we have added to our pages. They remember your preferences like language or region.",
    canDisable: true,
  },
  {
    icon: <BarChart3 className="h-5 w-5" />,
    type: "Analytics Cookies",
    description: "These cookies help us understand how visitors interact with our website by collecting and reporting information anonymously. They help us improve our website and your experience.",
    canDisable: true,
  },
  {
    icon: <Cookie className="h-5 w-5" />,
    type: "Marketing Cookies",
    description: "These cookies are used to track visitors across websites. The intention is to display ads that are relevant and engaging for the individual user. They are usually placed by advertising networks with the website operator's permission.",
    canDisable: true,
  },
]

const cookiesWeUse = [
  {
    name: "cookie_consent",
    provider: "Our Love Connection",
    purpose: "Stores your cookie consent preferences",
    type: "Essential",
    duration: "1 year",
  },
  {
    name: "supabase-auth-token",
    provider: "Supabase",
    purpose: "Authentication and session management",
    type: "Essential",
    duration: "Session",
  },
  {
    name: "sb-*",
    provider: "Supabase",
    purpose: "Authentication state and refresh tokens",
    type: "Essential",
    duration: "1 year",
  },
  {
    name: "_vercel_insights",
    provider: "Vercel",
    purpose: "Anonymous analytics to improve performance",
    type: "Analytics",
    duration: "Session",
  },
  {
    name: "theme",
    provider: "Our Love Connection",
    purpose: "Remembers your theme preference (light/dark)",
    type: "Functional",
    duration: "1 year",
  },
]

export default function CookiesPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-4xl">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="inline-flex items-center justify-center p-3 bg-primary/10 rounded-full mb-4">
            <Cookie className="h-8 w-8 text-primary" />
          </div>
          <h1 className="text-4xl md:text-5xl font-bold mb-4">Cookie Policy</h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            This policy explains how Our Love Connection uses cookies and similar technologies.
          </p>
        </div>

        {/* What Are Cookies */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Info className="h-6 w-6 text-primary" />
                What Are Cookies?
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                Cookies are small text files that are placed on your computer or mobile device when you 
                visit a website. They are widely used to make websites work more efficiently, provide 
                a better user experience, and give website owners information about how their site is being used.
              </p>
              <p>
                Cookies can be "persistent" or "session" cookies. Persistent cookies remain on your device 
                when you go offline, while session cookies are deleted as soon as you close your web browser.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Types of Cookies */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Types of Cookies We Use</h2>
          <div className="grid gap-4">
            {cookieTypes.map((cookie, index) => (
              <Card key={index}>
                <CardHeader className="pb-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-primary/10 rounded-lg text-primary">
                        {cookie.icon}
                      </div>
                      <CardTitle className="text-lg">{cookie.type}</CardTitle>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      cookie.canDisable 
                        ? "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-200" 
                        : "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                    }`}>
                      {cookie.canDisable ? "Optional" : "Required"}
                    </span>
                  </div>
                </CardHeader>
                <CardContent>
                  <p className="text-sm text-muted-foreground">{cookie.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>

        {/* Cookies We Use Table */}
        <section className="mb-12">
          <h2 className="text-2xl font-bold mb-6">Specific Cookies We Use</h2>
          <Card>
            <CardContent className="p-0">
              <Table>
                <TableHeader>
                  <TableRow>
                    <TableHead>Cookie Name</TableHead>
                    <TableHead>Provider</TableHead>
                    <TableHead className="hidden md:table-cell">Purpose</TableHead>
                    <TableHead>Type</TableHead>
                    <TableHead>Duration</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {cookiesWeUse.map((cookie, index) => (
                    <TableRow key={index}>
                      <TableCell className="font-mono text-sm">{cookie.name}</TableCell>
                      <TableCell>{cookie.provider}</TableCell>
                      <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                        {cookie.purpose}
                      </TableCell>
                      <TableCell>
                        <span className={`text-xs px-2 py-1 rounded-full ${
                          cookie.type === "Essential" 
                            ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200"
                            : cookie.type === "Analytics"
                            ? "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200"
                            : "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200"
                        }`}>
                          {cookie.type}
                        </span>
                      </TableCell>
                      <TableCell className="text-muted-foreground text-sm">{cookie.duration}</TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </CardContent>
          </Card>
        </section>

        {/* How to Manage Cookies */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl flex items-center gap-2">
                <Settings className="h-6 w-6 text-primary" />
                How to Manage Cookies
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                You can control and manage cookies in various ways. Please note that removing or blocking 
                cookies may impact your user experience and some functionality may no longer be available.
              </p>
              
              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Browser Settings</h4>
                <p>
                  Most browsers allow you to view, manage, delete, and block cookies for a website. 
                  Be aware that if you delete all cookies, any preferences you have set will be lost, 
                  including the ability to opt out of cookies.
                </p>
                <ul className="list-disc list-inside space-y-1 text-sm">
                  <li><strong>Chrome:</strong> Settings → Privacy and Security → Cookies</li>
                  <li><strong>Firefox:</strong> Options → Privacy & Security → Cookies</li>
                  <li><strong>Safari:</strong> Preferences → Privacy → Cookies</li>
                  <li><strong>Edge:</strong> Settings → Cookies and Site Permissions</li>
                </ul>
              </div>

              <div className="space-y-3">
                <h4 className="font-semibold text-foreground">Our Cookie Settings</h4>
                <p>
                  When you first visit our website, you will be shown a cookie banner that allows you 
                  to accept or customize your cookie preferences. You can change these preferences at 
                  any time by clicking the "Cookie Settings" link in our website footer.
                </p>
              </div>
            </CardContent>
          </Card>
        </section>

        {/* Third-Party Cookies */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Third-Party Cookies</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-muted-foreground">
              <p>
                In addition to our own cookies, we may also use various third-party cookies to report 
                usage statistics of the website and deliver advertisements on and through the website.
              </p>
              <p>
                These third-party services have their own privacy policies and we encourage you to 
                read them:
              </p>
              <ul className="list-disc list-inside space-y-1">
                <li>
                  <a href="https://supabase.com/privacy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Supabase Privacy Policy
                  </a>
                </li>
                <li>
                  <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-primary hover:underline">
                    Vercel Privacy Policy
                  </a>
                </li>
              </ul>
            </CardContent>
          </Card>
        </section>

        {/* Updates */}
        <section className="mb-12">
          <Card>
            <CardHeader>
              <CardTitle className="text-2xl">Updates to This Policy</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                We may update this Cookie Policy from time to time to reflect changes in technology, 
                legislation, or our data practices. When we make changes, we will update the "Last Updated" 
                date at the bottom of this page. We encourage you to periodically review this page for the 
                latest information on our cookie practices.
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Contact */}
        <section className="mb-12">
          <Card className="bg-primary/5 border-primary/20">
            <CardHeader>
              <CardTitle className="text-2xl">Questions?</CardTitle>
            </CardHeader>
            <CardContent className="text-muted-foreground">
              <p>
                If you have any questions about our use of cookies or this policy, please{" "}
                <Link href="/contact" className="text-primary hover:underline">
                  contact us
                </Link>
                .
              </p>
            </CardContent>
          </Card>
        </section>

        {/* Last Updated */}
        <div className="text-center text-sm text-muted-foreground">
          <p>This cookie policy was last updated on December 2, 2025.</p>
        </div>
      </div>
    </PublicPageLayout>
  )
}
