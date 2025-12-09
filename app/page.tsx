import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Users, Heart, Shield, ArrowRight, MapPin } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { HeroEventsCarousel } from "@/components/hero-events-carousel"
import { EventSearchBar } from "@/components/event-search-bar"
import { RotatingHeroBackground } from "@/components/rotating-hero-background"
import { EventsNearYou } from "@/components/events-near-you"
import { AffiliatesGrid } from "@/components/affiliates-grid"
import { DomesticEventsSection } from "@/components/domestic-events-section"
import { UpcomingEventsPagination } from "@/components/upcoming-events-pagination"
import { MatchmakingHomeSection } from "@/components/matchmaking-home-section"
import { SchemaOrg, organizationSchema } from "@/components/schema-org"
import { Metadata } from "next"

export const metadata: Metadata = {
  title: 'Our Love Connection - It all starts with one Event to find a perfect Match',
  description: 'It all starts with one Event to find a perfect Match. Discover authentic connections through curated social events with Our Love Connection.',
  keywords: 'dating events, singles events, meet singles, social dating, event dating, speed dating, networking events, singles networking, find love',
  openGraph: {
    title: 'Our Love Connection - It all starts with one Event to find a perfect Match',
    description: 'It all starts with one Event to find a perfect Match. Join Our Love Connection today.',
    url: 'https://ourloveconnection.com',
    type: 'website',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Our Love Connection - Dating Events',
      },
    ],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com',
  },
}

export default async function HomePage() {
  const supabase = await createServerClient()

  // Get authenticated user
  const { data: { user } } = await supabase.auth.getUser()

  const [{ data: categories }, { data: allCategories }, { data: events }, { data: affiliates }] = await Promise.all([
    supabase.from("event_categories").select("*").eq("is_featured", true).eq("status", "active").order("display_order").limit(4),
    supabase.from("event_categories").select("*").eq("is_featured", true).eq("status", "active").order("display_order"),
    supabase
      .from("events")
      .select("*")
      .in("status", ["upcoming", "ongoing"])
      .gte("start_date", new Date().toISOString())
      .order("start_date")
      .limit(12),
    supabase.from("affiliates").select("*").eq("approval_status", "approved").limit(12),
  ])

  const carouselEvents = events?.slice(0, 5) || []
  const upcomingEvents = events?.slice(0, 6) || []
  const nearbyEventsFallback = events?.slice(0, 6) || []
  
  // Filter international events (not USA)
  const internationalEvents = events?.filter(event => event.location_country && event.location_country !== 'USA').slice(0, 6) || []

  return (
    <div className="min-h-svh bg-background">
      <SchemaOrg data={organizationSchema} />
      <PublicHeader />

      <main className="pt-16 md:pt-20">
        {/* Hero Section with Search Bar and Rotating Background */}
        <RotatingHeroBackground>
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white drop-shadow-lg">
                It all starts with one Event to find a perfect Match
              </h1>
              <p className="text-xl text-white/90 mb-8 text-pretty drop-shadow-md">
                Join curated social events and connect with compatible singles based on your preferences. Real
                connections, real events, real chemistry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {!user && (
                  <Button size="lg" asChild className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg">
                    <Link href="/auth/sign-up">Start Your Journey</Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild className="bg-white/10 border-white text-white hover:bg-white/20 backdrop-blur-sm font-semibold">
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </div>

            {/* Event Search Bar */}
            <EventSearchBar />
          </div>
        </RotatingHeroBackground>

        {/* Hero Events Carousel with Multiple Events Slideshow */}
        {carouselEvents && carouselEvents.length > 0 && (
          <section className="py-12 md:py-20 bg-gradient-to-b from-background via-muted/20 to-background">
            <div className="container mx-auto px-4">
              <HeroEventsCarousel events={carouselEvents} />
            </div>
          </section>
        )}

        {/* Events Near You */}
        <section className="py-16">
          <div className="container mx-auto px-4">
            <div className="flex flex-col gap-4 mb-12">
              <div>
                <h2 className="text-3xl font-bold mb-2">Events Near You</h2>
                <p className="text-muted-foreground">Discover local events based on your location</p>
              </div>
              <div className="flex justify-start">
                <Button variant="outline" asChild>
                  <Link href="/events?nearby=true">View All</Link>
                </Button>
              </div>
            </div>
            <EventsNearYou fallbackEvents={nearbyEventsFallback} />
          </div>
        </section>

        {/* Upcoming Events */}
        {upcomingEvents && upcomingEvents.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="flex flex-col gap-4 mb-12">
                <div>
                  <h2 className="text-3xl font-bold mb-2">Upcoming Events</h2>
                  <p className="text-muted-foreground">Join our next events</p>
                </div>
                <div className="flex justify-start">
                  <Button variant="outline" asChild>
                    <Link href="/events/upcoming">View All</Link>
                  </Button>
                </div>
              </div>
              <UpcomingEventsPagination events={upcomingEvents} />
            </div>
          </section>
        )}

        {/* Events by Locations - Domestic Events */}
        <DomesticEventsSection />

        {/* Matchmaking Section */}
        <MatchmakingHomeSection />

        {/* CTA Section - Only show if not authenticated */}
        {!user && (
          <section className="py-20 bg-primary text-primary-foreground">
            <div className="container mx-auto px-4 text-center">
              <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to Find Your Match?</h2>
              <p className="text-xl mb-8 opacity-90">Join thousands of singles attending our events</p>
              <Button size="lg" variant="secondary" asChild>
                <Link href="/auth/sign-up">Create Free Account</Link>
              </Button>
            </div>
          </section>
        )}

        {/* Affiliates Showcase */}
        {affiliates && affiliates.length > 0 && (
          <AffiliatesGrid affiliates={affiliates} />
        )}
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
