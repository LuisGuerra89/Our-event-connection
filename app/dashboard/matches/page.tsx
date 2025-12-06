import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { MatchList } from "@/components/match-list"
import { IncompleteProfileBanner } from "@/components/incomplete-profile-banner"
import { MatchesPageContent } from "@/components/dashboard/matches-page-content"

export default async function MatchesPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch profile with role info
  const { data: profileWithRole } = await supabase
    .from("profiles")
    .select("questionnaire_completed, roles(role_name)")
    .eq("id", data.user.id)
    .single()

  // Redirect admins/moderators to /admin
  const userRole = (profileWithRole?.roles as any)?.role_name
  if (userRole === 'admin' || userRole === 'moderator') {
    redirect("/admin")
  }

  // Fetch current user profile to check if questionnaire is complete
  const { data: userProfile } = await supabase
    .from("profiles")
    .select("questionnaire_completed")
    .eq("id", data.user.id)
    .single()

  // Fetch matches for the current user (including match_score calculated and stored in DB)
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      matched_user_id,
      match_score,
      profiles!matches_matched_user_id_fkey (
        id,
        display_name,
        first_name,
        last_name,
        bio,
        location_city,
        location_state,
        gender,
        profile_image_url,
        role_id,
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

  // Known admin/moderator role IDs to exclude
  const adminRoleId = "28136400-463b-437d-9a95-835e830e5067"; // Moderator/editor role
  
  // Filter out admin/moderator users by role_id and preserve match_score from DB
  const matchedUsers = matches
    ?.filter((match: any) => {
      if (!match.profiles) return false;
      // Exclude if role_id matches known admin/moderator roles
      return match.profiles.role_id !== adminRoleId;
    })
    .map((match: any) => ({
      ...match.profiles,
      matchId: match.id,
      matchScore: match.match_score || 75 // Use stored match_score from DB
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
        <MatchesPageContent 
          initialMatches={matchedUsers} 
          preferences={myPreferences}
          userId={data.user.id}
        />
      </main>
    </div>
  )
}
