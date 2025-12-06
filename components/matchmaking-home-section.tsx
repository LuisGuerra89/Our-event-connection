import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Heart, Sparkles, Users, MapPin, Calendar, ArrowRight } from "lucide-react"
import Link from "next/link"

interface MatchUser {
  id: string
  first_name: string
  last_name: string
  profile_image_url: string | null
  city: string | null
  state: string | null
  age: number | null
  gender: string | null
  compatibility_score?: number
}

export async function MatchmakingHomeSection() {
  const supabase = await createServerClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  if (!user) {
    // Show info section for non-authenticated users
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-12">
            <div className="inline-flex items-center gap-2 mb-4">
              <Sparkles className="h-8 w-8 text-pink-500" />
              <h2 className="text-3xl font-bold">Smart Matchmaking</h2>
              <Sparkles className="h-8 w-8 text-pink-500" />
            </div>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Find your perfect match using our advanced compatibility algorithm
            </p>
          </div>

          <div className="grid gap-8 md:grid-cols-3 max-w-5xl mx-auto mb-12">
            <Card className="border-pink-200 dark:border-pink-900">
              <CardHeader>
                <div className="h-12 w-12 bg-pink-100 dark:bg-pink-900 rounded-full flex items-center justify-center mb-4">
                  <Heart className="h-6 w-6 text-pink-600 dark:text-pink-400" />
                </div>
                <CardTitle>Advanced Algorithm</CardTitle>
                <CardDescription>
                  Our smart matching system analyzes your preferences, interests, and lifestyle to find compatible matches
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-purple-200 dark:border-purple-900">
              <CardHeader>
                <div className="h-12 w-12 bg-purple-100 dark:bg-purple-900 rounded-full flex items-center justify-center mb-4">
                  <Users className="h-6 w-6 text-purple-600 dark:text-purple-400" />
                </div>
                <CardTitle>Real Connections</CardTitle>
                <CardDescription>
                  Meet compatible singles at our curated events and build genuine relationships in person
                </CardDescription>
              </CardHeader>
            </Card>

            <Card className="border-rose-200 dark:border-rose-900">
              <CardHeader>
                <div className="h-12 w-12 bg-rose-100 dark:bg-rose-900 rounded-full flex items-center justify-center mb-4">
                  <Sparkles className="h-6 w-6 text-rose-600 dark:text-rose-400" />
                </div>
                <CardTitle>Personalized Matches</CardTitle>
                <CardDescription>
                  Get matched with people who share your values, interests, and dating goals
                </CardDescription>
              </CardHeader>
            </Card>
          </div>

          <div className="text-center">
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" asChild>
              <Link href="/auth/sign-up">
                Start Matching Today
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Check if user has preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", user.id)
    .maybeSingle()

  // If no preferences, show message to update profile
  if (!preferences) {
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <Sparkles className="h-16 w-16 text-pink-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Update Your Profile to Get Matches</h2>
            <p className="text-muted-foreground mb-8">
              Complete your preferences to start receiving personalized matches based on compatibility
            </p>
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" asChild>
              <Link href="/dashboard/profile">
                Update Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Get matches for the user (fetch more than 4 to account for admin filtering)
  const { data: matchesData } = await supabase
    .from("matches")
    .select(`
      id,
      matched_user_id,
      profiles!matches_matched_user_id_fkey (
        id,
        display_name,
        profile_image_url,
        location_city,
        location_state,
        gender,
        role_id,
        user_attributes (*)
      )
    `)
    .eq("user_id", user.id)
    .limit(20)

  // Known admin/moderator role IDs to exclude
  const adminRoleId = "28136400-463b-437d-9a95-835e830e5067"; // Moderator/editor role
  
  // Transform and calculate match scores, filtering out admin users, then limit to top 4
  const allMatchedUsers = matchesData
    ?.filter((match: any) => {
      if (!match.profiles) return false;
      // Exclude if role_id matches known admin/moderator roles
      return match.profiles.role_id !== adminRoleId;
    })
    .map((match: any) => ({
      ...match.profiles,
      matchId: match.id
    })) || []

  // Calculate match scores (same logic as matchmaking page)
  const matchUsers: MatchUser[] = allMatchedUsers.map((user: any) => {
    let score = 50 // Default score
    
    if (preferences && user.user_attributes) {
      let calculatedScore = 0
      let totalImportant = 0
      const attrs = user.user_attributes

      const checks = [
        { importance: preferences.hair_color_importance, preferenceArr: preferences.hair_color_preference, attr: attrs.hair_color },
        { importance: preferences.hair_length_importance, preferenceArr: preferences.hair_length_preference, attr: attrs.hair_length },
        { importance: preferences.eye_color_importance, preferenceArr: preferences.eye_color_preference, attr: attrs.eye_color },
        { importance: preferences.body_type_importance, preferenceArr: preferences.body_type_preference, attr: attrs.body_type },
        { importance: preferences.race_importance, preferenceArr: preferences.race_preference, attr: attrs.race },
        { importance: preferences.religion_importance, preferenceArr: preferences.religion_preference, attr: attrs.religion },
      ]

      checks.forEach(({ importance, preferenceArr, attr }) => {
        if (importance === "important") {
          totalImportant++
          // Check if the user's attribute matches any of the preferred values
          if (attr && preferenceArr && Array.isArray(preferenceArr) && preferenceArr.includes(attr)) {
            calculatedScore++
          }
        } else if (importance === "open_to_all") {
          // If open_to_all and the match has this attribute, give full point
          // If open_to_all but match doesn't have it, give partial point
          calculatedScore += attr ? 1 : 0.5
        }
      })

      // If there are important preferences, calculate percentage based on matches
      // If no important preferences, use average of open_to_all scores (out of total checks)
      score = totalImportant > 0 
        ? Math.round((calculatedScore / totalImportant) * 100) 
        : Math.round((calculatedScore / checks.length) * 100)
    }

    // Parse display_name to get first and last name
    const nameParts = user.display_name?.split(' ') || []
    const first_name = nameParts[0] || 'Unknown'
    const last_name = nameParts[nameParts.length - 1] || ''

    return {
      id: user.id,
      first_name,
      last_name,
      profile_image_url: user.profile_image_url,
      city: user.location_city,
      state: user.location_state,
      age: null, // Not available in this query
      gender: user.gender,
      compatibility_score: score
    }
  }).sort((a: any, b: any) => (b.compatibility_score || 0) - (a.compatibility_score || 0))
  .slice(0, 4) // Limit to top 4 after filtering admins and sorting

  if (matchUsers.length === 0) {
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <Heart className="h-16 w-16 text-pink-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Finding Your Perfect Matches</h2>
            <p className="text-muted-foreground mb-8">
              We're working on finding compatible matches for you. Check back soon or attend events to meet people!
            </p>
            <Button size="lg" variant="outline" asChild>
              <Link href="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  return (
    <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-rose-950/20">
      <div className="container mx-auto px-4">
        <div className="text-center mb-12">
          <div className="inline-flex items-center gap-2 mb-4">
            <Sparkles className="h-8 w-8 text-pink-500" />
            <h2 className="text-3xl font-bold">Your Top Matches</h2>
            <Sparkles className="h-8 w-8 text-pink-500" />
          </div>
          <p className="text-xl text-muted-foreground">
            People who match your preferences and interests
          </p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto mb-8">
          {matchUsers.map((match) => (
            <Card key={match.id} className="group hover:shadow-xl transition-all duration-300 border-pink-200 dark:border-pink-900 overflow-hidden">
              <CardHeader className="pb-3">
                <div className="relative">
                  <Avatar className="h-32 w-32 mx-auto mb-4 ring-4 ring-pink-200 dark:ring-pink-800 group-hover:ring-pink-400 transition-all">
                    <AvatarImage src={match.profile_image_url || ""} alt={match.first_name} />
                    <AvatarFallback className="text-2xl bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                      {match.first_name?.[0]}{match.last_name?.[0]}
                    </AvatarFallback>
                  </Avatar>
                  {match.compatibility_score && (
                    <Badge className="absolute top-0 right-0 bg-gradient-to-r from-pink-500 to-purple-600">
                      {match.compatibility_score}% Match
                    </Badge>
                  )}
                </div>
                <CardTitle className="text-center text-xl">
                  {match.first_name} {match.last_name?.[0]}.
                </CardTitle>
                <CardDescription className="text-center">
                  <div className="flex items-center justify-center gap-2 text-sm">
                    {match.age && <span>{match.age} years</span>}
                    {match.gender && <span>• {match.gender}</span>}
                  </div>
                  {match.city && match.state && (
                    <div className="flex items-center justify-center gap-1 mt-1">
                      <MapPin className="h-3 w-3" />
                      <span className="text-xs">{match.city}, {match.state}</span>
                    </div>
                  )}
                </CardDescription>
              </CardHeader>
              <CardContent className="pt-0">
                <Button 
                  className="w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" 
                  asChild
                >
                  <Link href={`/dashboard/matches/${match.id}`}>
                    View Profile
                  </Link>
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="text-center">
          <Button size="lg" variant="outline" className="border-pink-300 hover:bg-pink-100 dark:border-pink-800 dark:hover:bg-pink-950" asChild>
            <Link href="/matchmaking">
              View All Matches
              <ArrowRight className="ml-2 h-5 w-5" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
