import { createServerClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Sparkles, Users, ArrowRight, Star, Zap, Target, Shield, MessageCircle } from "lucide-react"
import Link from "next/link"
import { PaginatedMatchesGrid } from "@/components/paginated-matches-grid"

interface MatchUser {
  id: string
  display_name: string
  profile_image_url: string | null
  location_city: string | null
  location_state: string | null
  gender: string | null
  bio: string | null
  matchScore?: number
  user_attributes?: any
  matchId?: string
}

export default async function MatchmakingPage() {
  const supabase = await createServerClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  let matches: MatchUser[] = []
  let isProfileComplete = false

  if (user) {
    // Get user's profile to check if questionnaire is complete
    const { data: userProfile } = await supabase
      .from("profiles")
      .select("questionnaire_completed")
      .eq("id", user.id)
      .single()

    isProfileComplete = userProfile?.questionnaire_completed === true

    if (isProfileComplete) {
      // Get matches for the user using the same query as dashboard/matches
      const { data: matchesData } = await supabase
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
        .eq("user_id", user.id)

      // Fetch current user's preferences to calculate match scores
      const { data: myPreferences } = await supabase
        .from("user_preferences")
        .select("*")
        .eq("user_id", user.id)
        .maybeSingle()

      // Transform matches data
      const matchedUsers = matchesData?.map((match: any) => ({
        ...match.profiles,
        matchId: match.id
      })) || []

      // Calculate match scores (same logic as MatchList component)
      matches = matchedUsers.map((user: any) => {
        let score = 50 // Default score
        
        if (myPreferences && user.user_attributes) {
          let calculatedScore = 0
          let totalImportant = 0
          const attrs = user.user_attributes

          const checks = [
            { importance: myPreferences.hair_color_importance, preferenceArr: myPreferences.hair_color_preference, attr: attrs.hair_color },
            { importance: myPreferences.hair_length_importance, preferenceArr: myPreferences.hair_length_preference, attr: attrs.hair_length },
            { importance: myPreferences.eye_color_importance, preferenceArr: myPreferences.eye_color_preference, attr: attrs.eye_color },
            { importance: myPreferences.body_type_importance, preferenceArr: myPreferences.body_type_preference, attr: attrs.body_type },
            { importance: myPreferences.race_importance, preferenceArr: myPreferences.race_preference, attr: attrs.race },
            { importance: myPreferences.religion_importance, preferenceArr: myPreferences.religion_preference, attr: attrs.religion },
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

        return {
          ...user,
          matchScore: score
        }
      }).sort((a: any, b: any) => (b.matchScore || 0) - (a.matchScore || 0))
    }
  }

  return (
    <div className="min-h-svh bg-background">
      <PublicHeader />

      <main>
        {/* Hero Section */}
        <section className="relative bg-gradient-to-br from-pink-100 via-purple-100 to-rose-100 dark:from-pink-950/40 dark:via-purple-950/40 dark:to-rose-950/40 py-12 md:py-20">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-4xl mx-auto">
              <div className="flex flex-col md:flex-row items-center justify-center gap-2 md:gap-3 mb-6">
                <Sparkles className="hidden md:block h-8 w-8 md:h-10 md:w-10 text-pink-500 flex-shrink-0" />
                <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-bold bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 bg-clip-text text-transparent">
                  Smart Matchmaking
                </h1>
                <Sparkles className="hidden md:block h-8 w-8 md:h-10 md:w-10 text-pink-500 flex-shrink-0" />
              </div>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl text-muted-foreground mb-6 md:mb-8 text-pretty px-4">
                Find your perfect match using our advanced compatibility algorithm. Real connections, real chemistry, real love.
              </p>
              {!user && (
                <Button 
                  size="lg" 
                  className="bg-gradient-to-r from-pink-500 via-purple-600 to-rose-600 hover:from-pink-600 hover:via-purple-700 hover:to-rose-700 text-base md:text-lg px-6 md:px-8"
                  asChild
                >
                  <Link href="/auth/sign-up">
                    Start Your Love Story
                    <Heart className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </Button>
              )}
            </div>
          </div>
        </section>

        {/* Matches Section - Only for authenticated users with complete profile */}
        {user && isProfileComplete && matches.length > 0 && (
          <section className="py-12 md:py-16 bg-gradient-to-br from-pink-50 via-purple-50 to-rose-50 dark:from-pink-950/20 dark:via-purple-950/20 dark:to-rose-950/20">
            <div className="container mx-auto px-4">
              <div className="text-center mb-8 md:mb-12">
                <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Your Matches</h2>
                <p className="text-base sm:text-lg md:text-xl text-muted-foreground px-4">
                  People who best match your preferences
                </p>
              </div>

              <PaginatedMatchesGrid matches={matches} currentUserId={user?.id} itemsPerPage={4} />
            </div>
          </section>
        )}

        {/* How It Works Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">How Our Matchmaking Works</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Our intelligent algorithm analyzes multiple factors to find your perfect match
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-4 max-w-6xl mx-auto">
              <Card className="border-pink-200 dark:border-pink-900 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-pink-500 to-purple-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Target className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-center">1. Complete Your Profile</CardTitle>
                  <CardDescription className="text-center">
                    Fill out your preferences, interests, and what you're looking for in a partner
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-purple-200 dark:border-purple-900 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-purple-500 to-rose-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Zap className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-center">2. Get Matched</CardTitle>
                  <CardDescription className="text-center">
                    Our algorithm finds compatible singles based on personality, values, and lifestyle
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-rose-200 dark:border-rose-900 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-rose-500 to-pink-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <MessageCircle className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-center">3. Connect & Chat</CardTitle>
                  <CardDescription className="text-center">
                    Start conversations with your matches and get to know each other better
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-pink-200 dark:border-pink-900 hover:shadow-xl transition-all">
                <CardHeader>
                  <div className="h-16 w-16 bg-gradient-to-br from-pink-500 to-rose-600 rounded-full flex items-center justify-center mb-4 mx-auto">
                    <Heart className="h-8 w-8 text-white" />
                  </div>
                  <CardTitle className="text-center">4. Meet in Person</CardTitle>
                  <CardDescription className="text-center">
                    Attend our events to meet your matches face-to-face in a safe, fun environment
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section className="py-12 md:py-16 bg-background">
          <div className="container mx-auto px-4">
            <div className="text-center mb-8 md:mb-12">
              <h2 className="text-2xl sm:text-3xl md:text-4xl font-bold mb-3 md:mb-4">Why Our Matchmaking is Different</h2>
              <p className="text-base sm:text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto px-4">
                Advanced technology meets human touch for meaningful connections
              </p>
            </div>

            <div className="grid gap-6 sm:gap-8 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
              <Card className="border-pink-200 dark:border-pink-900">
                <CardHeader>
                  <Star className="h-12 w-12 text-pink-500 mb-4" />
                  <CardTitle>Advanced Algorithm</CardTitle>
                  <CardDescription>
                    Our AI-powered matching system analyzes 100+ data points including personality traits, values, lifestyle preferences, and dating goals to find your ideal match
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-purple-200 dark:border-purple-900">
                <CardHeader>
                  <Heart className="h-12 w-12 text-purple-500 mb-4" />
                  <CardTitle>Personality Compatibility</CardTitle>
                  <CardDescription>
                    Match based on deep personality compatibility, not just surface-level attributes. Find someone who truly gets you
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-rose-200 dark:border-rose-900">
                <CardHeader>
                  <Users className="h-12 w-12 text-rose-500 mb-4" />
                  <CardTitle>Real-World Meetups</CardTitle>
                  <CardDescription>
                    Connect online and meet in person at our curated events. Build genuine chemistry in real-life settings
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-pink-200 dark:border-pink-900">
                <CardHeader>
                  <Shield className="h-12 w-12 text-pink-500 mb-4" />
                  <CardTitle>Verified Profiles</CardTitle>
                  <CardDescription>
                    All profiles are verified to ensure authenticity. Feel confident knowing you're connecting with real people
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-purple-200 dark:border-purple-900">
                <CardHeader>
                  <Target className="h-12 w-12 text-purple-500 mb-4" />
                  <CardTitle>Targeted Matching</CardTitle>
                  <CardDescription>
                    Set your preferences for age, location, interests, and lifestyle. We'll only show you matches that meet your criteria
                  </CardDescription>
                </CardHeader>
              </Card>

              <Card className="border-rose-200 dark:border-rose-900">
                <CardHeader>
                  <Sparkles className="h-12 w-12 text-rose-500 mb-4" />
                  <CardTitle>Chemistry Indicators</CardTitle>
                  <CardDescription>
                    See compatibility scores and shared interests at a glance. Know which matches have the highest potential
                  </CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* CTA Section */}
        {!user && (
          <section className="py-12 md:py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">Ready to Find Your Perfect Match?</h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto px-4">
                Join thousands of singles who found love through our intelligent matchmaking system
              </p>
              <div className="flex flex-col sm:flex-row gap-3 md:gap-4 justify-center px-4">
                <Button size="lg" variant="secondary" className="text-base md:text-lg px-6 md:px-8" asChild>
                  <Link href="/auth/sign-up">
                    Create Free Account
                    <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                  </Link>
                </Button>
                <Button size="lg" variant="outline" className="text-base md:text-lg px-6 md:px-8 bg-transparent border-white text-white hover:bg-white/20" asChild>
                  <Link href="/how-it-works">
                    Learn More
                  </Link>
                </Button>
              </div>
            </div>
          </section>
        )}

        {/* Complete Profile CTA - for authenticated users without complete profile */}
        {user && !isProfileComplete && (
          <section className="py-12 md:py-20 bg-gradient-to-r from-pink-600 via-purple-600 to-rose-600 text-white">
            <div className="container mx-auto px-4 text-center">
              <Sparkles className="h-14 w-14 md:h-20 md:w-20 mx-auto mb-4 md:mb-6" />
              <h2 className="text-2xl sm:text-3xl md:text-4xl lg:text-5xl font-bold mb-4 md:mb-6 px-4">Complete Your Profile to Get Matched</h2>
              <p className="text-base sm:text-lg md:text-xl lg:text-2xl mb-6 md:mb-8 opacity-90 max-w-3xl mx-auto px-4">
                Fill out your profile and preferences to start receiving personalized matches
              </p>
              <Button size="lg" variant="secondary" className="text-base md:text-lg px-6 md:px-8" asChild>
                <Link href="/dashboard/profile">
                  Complete Your Profile Now
                  <ArrowRight className="ml-2 h-4 w-4 md:h-5 md:w-5" />
                </Link>
              </Button>
            </div>
          </section>
        )}
      </main>

      <Footer />
    </div>
  )
}
