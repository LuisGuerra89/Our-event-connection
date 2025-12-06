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

  // Get user's profile to check if complete
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if profile is complete
  const isProfileComplete = profile?.profile_completion_percentage === 100

  if (!isProfileComplete) {
    return (
      <section className="py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-rose-950/20">
        <div className="container mx-auto px-4">
          <div className="text-center max-w-2xl mx-auto">
            <Sparkles className="h-16 w-16 text-pink-500 mx-auto mb-6" />
            <h2 className="text-3xl font-bold mb-4">Complete Your Profile to Get Matches</h2>
            <p className="text-muted-foreground mb-8">
              Fill out your profile and preferences to start receiving personalized matches based on compatibility
            </p>
            <Button size="lg" className="bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700" asChild>
              <Link href="/dashboard/profile">
                Complete Profile
                <ArrowRight className="ml-2 h-5 w-5" />
              </Link>
            </Button>
          </div>
        </div>
      </section>
    )
  }

  // Get top 4 matches for the user
  const { data: matches } = await supabase
    .from("matches")
    .select(`
      id,
      user_id,
      matched_user_id,
      compatibility_score,
      status,
      matched_user:profiles!matches_matched_user_id_fkey(
        id,
        first_name,
        last_name,
        profile_image_url,
        city,
        state,
        age,
        gender
      )
    `)
    .eq("user_id", user.id)
    .eq("status", "active")
    .order("compatibility_score", { ascending: false })
    .limit(4)

  const matchUsers: MatchUser[] = matches?.map((match: any) => ({
    id: match.matched_user.id,
    first_name: match.matched_user.first_name,
    last_name: match.matched_user.last_name,
    profile_image_url: match.matched_user.profile_image_url,
    city: match.matched_user.city,
    state: match.matched_user.state,
    age: match.matched_user.age,
    gender: match.matched_user.gender,
    compatibility_score: match.compatibility_score
  })) || []

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
