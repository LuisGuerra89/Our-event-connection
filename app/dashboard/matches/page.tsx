import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { MatchList } from "@/components/match-list"

export default async function MatchesPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch all users with their attributes (excluding current user and excluding admins/moderators)
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      user_attributes (*)
    `)
    .eq("role", "user")
    .neq("id", data.user.id)

  // Fetch current user's preferences
  const { data: myPreferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", data.user.id)
    .single()

  return (
    <div className="min-h-full">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Your Matches</h1>
          <p className="text-sm text-muted-foreground">Discover compatible members based on your preferences</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <MatchList users={users || []} preferences={myPreferences} />
      </main>
    </div>
  )
}
