import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { MessageButton } from "@/components/message-button"
import { UserProfileCard } from "@/components/dashboard/user-profile-card"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createServerClient()

  // Get current user
  const { data: currentUserData, error: authError } = await supabase.auth.getUser()
  if (authError || !currentUserData?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select(`
      *,
      user_attributes (*)
    `)
    .eq("id", userId)
    .single()

  // Fetch user preferences
  const { data: userPreferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", userId)
    .maybeSingle()

  if (userError || !user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/matches">
            <Button variant="ghost" size="sm">
              ← Back to Matches
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">User Profile</h1>
          <MessageButton recipientId={user.id} recipientName={user.display_name} type="chat" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8 max-w-5xl">
        <UserProfileCard user={user as any} preferences={userPreferences} />
      </main>
    </div>
  )
}
