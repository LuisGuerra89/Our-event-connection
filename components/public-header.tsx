import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { createServerClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notification-bell"
import { ChatButton } from "@/components/chat-button"
import { PublicHeaderNav } from "@/components/public-header-nav"
import { MobileMenu } from "@/components/mobile-menu"

export async function PublicHeader() {
  const supabase = await createServerClient()

  // Check if user is authenticated
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  // Get profile if user exists
  let profile = null
  if (user) {
    const { data: profileData } = await supabase
      .from("profiles")
      .select("full_name, profile_photo_url, profile_image_url")
      .eq("id", user.id)
      .single()

    profile = profileData
  }

  // Fetch page statuses from CMS
  const { data: pages } = await supabase.from("cms_content").select("page_key, status")

  // Create a map of active pages
  const activePages: Record<string, boolean> = {}
  if (pages) {
    pages.forEach((page) => {
      activePages[page.page_key] = page.status === "active"
    })
  }

  // Define nav items with their page keys
  const allNavItems = [
    { href: "/categories/after-work-activities", label: "After Work Activities", pageKey: "after_work_activities" },
    { href: "/categories/extreme-sports", label: "Extreme Sports", pageKey: "extreme_sports" },
    { href: "/categories/water-sports", label: "Water Sports", pageKey: "water_sports" },
    { href: "/categories/weekend-activities", label: "Weekend Activities", pageKey: "weekend_activities" },
    { href: "/categories/winter-sports", label: "Winter Sports", pageKey: "winter_sports" },
    { href: "/categories/travel", label: "Travel – Domestic / International", pageKey: "travel" },
  ]

  // Filter to only active pages (default to true if not in CMS)
  const navItems = allNavItems.filter((item) => activePages[item.pageKey] !== false)

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50 w-full">
      <div className="mx-auto px-2 sm:px-3 md:px-4 py-4 sm:py-5 md:py-6">
        <div className="flex items-center justify-between gap-1.5 sm:gap-3 md:gap-4">
          {/* Logo and Mobile Menu */}
          <div className="flex items-center gap-1 flex-shrink-0 min-w-fit">
            <MobileMenu isAuthenticated={!!user} navItems={navItems} />
            <Logo className="hidden md:flex flex-shrink-0 h-9 md:h-10" />
          </div>
          
          {/* Desktop Navigation - Centered and expanded */}
          <div className="hidden md:flex flex-1 justify-center min-w-0">
            <PublicHeaderNav navItems={navItems} />
          </div>

          {/* Auth Section */}
          <div className="flex items-center gap-1 sm:gap-2 md:gap-2 lg:gap-3 flex-shrink-0 min-w-fit">
            {user && profile ? (
              <>
                <ChatButton userId={user.id} />
                <NotificationBell userId={user.id} />
                <UserMenu
                  userName={profile.full_name || user.email || "User"}
                  userPhoto={profile.profile_image_url || profile.profile_photo_url}
                />
              </>
            ) : (
              <>
                <Button variant="ghost" size="sm" asChild className="hidden sm:flex">
                  <Link href="/auth/login">Sign In</Link>
                </Button>
                <Button size="sm" asChild className="hidden sm:flex">
                  <Link href="/auth/sign-up">Get Started</Link>
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </header>
  )
}
