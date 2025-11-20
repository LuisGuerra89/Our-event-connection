import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Logo } from "@/components/logo"
import { createClient } from "@/lib/supabase/server"
import { UserMenu } from "@/components/user-menu"
import { NotificationBell } from "@/components/notification-bell"

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
      .select("full_name, profile_photo_url")
      .eq("id", user.id)
      .single()
    
    profile = profileData
  }

  return (
    <header className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 sticky top-0 z-50">
      <div className="container mx-auto px-4 py-4 flex items-center justify-between">
        <Logo />
        
        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center gap-6">
          <Link href="/events" className="text-sm font-medium hover:text-primary transition-colors">
            Events
          </Link>
          <Link href="/membership" className="text-sm font-medium hover:text-primary transition-colors">
            Membership
          </Link>
          <Link href="/affiliates" className="text-sm font-medium hover:text-primary transition-colors">
            Affiliates
          </Link>
          <Link href="/pricing" className="text-sm font-medium hover:text-primary transition-colors">
            Pricing
          </Link>
          <Link href="/about" className="text-sm font-medium hover:text-primary transition-colors">
            About Us
          </Link>
          <Link href="/how-it-works" className="text-sm font-medium hover:text-primary transition-colors">
            How It Works
          </Link>
          <Link href="/contact" className="text-sm font-medium hover:text-primary transition-colors">
            Contact Us
          </Link>
        </nav>
        
        {/* Auth Section */}
        <div className="flex items-center gap-4">
          {user && profile ? (
            <>
              <NotificationBell userId={user.id} />
              <UserMenu 
                userName={profile.full_name || user.email || "User"} 
                userPhoto={profile.profile_photo_url}
              />
            </>
          ) : (
            <>
              <Button variant="ghost" asChild>
                <Link href="/auth/login">Sign In</Link>
              </Button>
              <Button asChild>
                <Link href="/auth/sign-up">Get Started</Link>
              </Button>
            </>
          )}
        </div>
      </div>
    </header>
  )
}
