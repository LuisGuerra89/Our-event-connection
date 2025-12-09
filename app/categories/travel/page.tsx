import type { Metadata } from 'next'
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { PublicPageLayout } from "@/components/public-page-layout"
import { CategoryHeroBanner } from "@/components/category-hero-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventList } from "@/components/event-list"

export const metadata: Metadata = {
  title: 'Travel Events - Domestic & International - Social Activities for Singles | Our Love Connection',
  description: 'Discover travel events and group trips for singles. Explore domestic and international travel experiences.',
  keywords: 'travel events, group travel, singles travel, vacation, international travel, adventure travel',
  openGraph: {
    title: 'Travel Events – Domestic & International | Our Love Connection',
    description: 'Discover travel events and group trips for singles. Explore domestic and international travel experiences.',
    url: 'https://ourloveconnection.com/categories/travel',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Travel Events',
      },
    ],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com/categories/travel',
  },
}

export default async function TravelPage() {
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ""

  // Get the category ID for travel
  const { data: category } = await supabase
    .from("event_categories")
    .select("id")
    .eq("slug", "travel")
    .single()

  // Get events for this category through the mapping table
  let events = []
  if (category?.id) {
    // First get the event IDs from the mapping table
    const { data: mappings } = await supabase
      .from("event_category_mapping")
      .select("event_id")
      .eq("category_id", category.id)

    if (mappings && mappings.length > 0) {
      const eventIds = mappings.map(m => m.event_id)
      
      // Then get the actual events
      const { data: categoryEvents } = await supabase
        .from("events")
        .select("*")
        .in("id", eventIds)
        .eq("status", "upcoming")
        .order("start_date", { ascending: true })

      events = categoryEvents || []
    }
  }

  return (
    <PublicPageLayout>
      <CategoryHeroBanner
        categorySlug="travel"
        title="Travel – Domestic & International"
        description="Discover travel events and group trips for singles. Explore domestic and international travel experiences."
      />
      
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16">

        {events.length > 0 ? (
          <div className="mb-12">
            <EventList events={events} userId={userId} />
          </div>
        ) : (
          <div className="grid gap-6 w-full">
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">No Events Yet</CardTitle>
                <CardDescription className="text-sm sm:text-base">Check back soon for amazing travel experiences!</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/events?category=travel">View All Events</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
