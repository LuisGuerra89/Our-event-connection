import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Calendar, Users, Heart, Shield, ArrowRight, MapPin } from "lucide-react"
import { createServerClient } from "@/lib/supabase/server"
import { PublicHeader } from "@/components/public-header"
import { Footer } from "@/components/footer"
import { FeaturedEventsCarousel } from "@/components/featured-events-carousel"
import { EventSearchBar } from "@/components/event-search-bar"
import { EventCategoriesSlider } from "@/components/event-categories-slider"
import { EventsNearYou } from "@/components/events-near-you"
import { InternationalEvents } from "@/components/international-events"
import { AffiliatesSlider } from "@/components/affiliates-slider"
import { DomesticEventsSection } from "@/components/domestic-events-section"
import { InternationalEventsSection } from "@/components/international-events-section"
import { UpcomingEventsPagination } from "@/components/upcoming-events-pagination"

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
      <PublicHeader />

      <main>
        {/* Hero Section with Search Bar */}
        <section className="relative bg-gradient-to-b from-primary/5 to-background py-20 md:py-32">
          <div className="container mx-auto px-4">
            <div className="text-center max-w-3xl mx-auto mb-12">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
                Find Your Perfect Match at Amazing Events
              </h1>
              <p className="text-xl text-muted-foreground mb-8 text-pretty">
                Join curated social events and connect with compatible singles based on your preferences. Real
                connections, real events, real chemistry.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
                {!user && (
                  <Button size="lg" asChild>
                    <Link href="/auth/sign-up">Start Your Journey</Link>
                  </Button>
                )}
                <Button size="lg" variant="outline" asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </div>

            {/* Event Search Bar */}
            <EventSearchBar />
          </div>
        </section>

        {/* Featured Events Carousel */}
        {carouselEvents && carouselEvents.length > 0 && (
          <section className="py-16 bg-background">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Featured Events</h2>
                <p className="text-muted-foreground">Don't miss these extreme and exciting events</p>
              </div>
              <FeaturedEventsCarousel events={carouselEvents} />
            </div>
          </section>
        )}

        {/* Event Categories Slider */}
        {allCategories && allCategories.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Event Categories</h2>
                <p className="text-muted-foreground">Explore events by category</p>
              </div>
              <EventCategoriesSlider categories={allCategories} />
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

        {/* Events by Locations - International Events */}
        <InternationalEventsSection />

        {/* Features */}
        <section className="py-16 bg-muted/30">
          <div className="container mx-auto px-4">
            <div className="text-center mb-12">
              <h2 className="text-3xl font-bold mb-4">Why Choose Our Love Connection?</h2>
              <p className="text-muted-foreground">Everything you need to find meaningful connections</p>
            </div>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
              <Card>
                <CardHeader>
                  <Calendar className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Curated Events</CardTitle>
                  <CardDescription>Attend speed dating, social mixers, and activity-based events</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Heart className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Smart Matching</CardTitle>
                  <CardDescription>Advanced algorithm matches you based on your detailed preferences</CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Users className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Real Connections</CardTitle>
                  <CardDescription>
                    Meet people in person at events designed for meaningful interactions
                  </CardDescription>
                </CardHeader>
              </Card>
              <Card>
                <CardHeader>
                  <Shield className="h-10 w-10 text-primary mb-2" />
                  <CardTitle>Safe & Secure</CardTitle>
                  <CardDescription>Verified profiles and liability waivers ensure a safe experience</CardDescription>
                </CardHeader>
              </Card>
            </div>
          </div>
        </section>

        {/* Affiliates Showcase */}
        {affiliates && affiliates.length > 0 && (
          <section className="py-16 bg-muted/30">
            <div className="container mx-auto px-4">
              <div className="text-center mb-12">
                <h2 className="text-3xl font-bold mb-4">Our Partners & Affiliates</h2>
                <p className="text-muted-foreground">Trusted partners making your events extraordinary</p>
              </div>
              <AffiliatesSlider affiliates={affiliates} />
            </div>
          </section>
        )}

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
      </main>

      {/* Footer */}
      <Footer />
    </div>
  )
}
