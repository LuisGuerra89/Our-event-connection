import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notification-bell"
import { ChatButton } from "@/components/chat-button"
import { PublicHeaderNav } from "@/components/public-header-nav"

export async function PublicHeader() {
  const supabase = await createClient()

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

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between gap-2 md:gap-4">
        <Logo />

        {/* Desktop Navigation */}
        <PublicHeaderNav />

        {/* Auth Section */}
        <div className="flex items-center gap-2 md:gap-4 ml-auto">
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
              <Button size="sm" asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
