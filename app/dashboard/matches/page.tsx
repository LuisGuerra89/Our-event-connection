import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { MatchList } from "@/components/match-list"
import { IncompleteProfileBanner } from "@/components/incomplete-profile-banner"

export default async function MatchesPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch current user profile to check if questionnaire is complete
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("questionnaire_completed")
    .eq("id", data.user.id)
    .single()

  // Fetch matches for the current user
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      matched_user_id,
      profiles!matches_matched_user_id_fkey (
        id,
        display_name,
        bio,
        location_city,
        location_state,
        gender,
        profile_image_url,
        user_attributes (*)
      )
    `)
    .eq("user_id", data.user.id)

  // Fetch current user's preferences
  const { data: myPreferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle()

  const isProfileComplete = userProfile?.questionnaire_completed === true

  // Transform matches data to match the expected format
  const matchedUsers = matches?.map((match: any) => ({
    ...match.profiles,
    matchId: match.id
  })) || []

  return (
    <div className="min-h-full">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Your Matches</h1>
          <p className="text-sm text-muted-foreground">Discover compatible members based on your preferences</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        {!isProfileComplete && (
          <IncompleteProfileBanner userId={data.user.id} />
        )}
        <MatchList users={matchedUsers} preferences={myPreferences} />
      </main>
    </div>
  )
}
