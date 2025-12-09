import type { Metadata } from 'next'
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { PublicPageLayout } from "@/components/public-page-layout"
import { CategoryHeroBanner } from "@/components/category-hero-banner"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventList } from "@/components/event-list"

export const metadata: Metadata = {
  title: 'Weekend Activities - Social Events for Singles | Our Love Connection',
  description: 'Discover fun weekend activities and events designed for singles to meet and connect.',
  keywords: 'weekend activities, weekend events, social gatherings, brunch, hiking, outdoor activities',
  openGraph: {
    title: 'Weekend Activities | Our Love Connection',
    description: 'Discover fun weekend activities and events designed for singles to meet and connect.',
    url: 'https://ourloveconnection.com/categories/weekend-activities',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Weekend Activities',
      },
    ],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com/categories/weekend-activities',
  },
}

export default async function WeekendActivitiesPage() {
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ""

  // Get the category ID for weekend-activities
  const { data: category } = await supabase
    .from("event_categories")
    .select("id")
    .eq("slug", "weekend-activities")
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
        categorySlug="weekend-activities"
        title="Weekend Activities"
        description="Discover fun weekend activities and events designed for singles to meet and connect."
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
                <CardDescription className="text-sm sm:text-base">Check back soon for fun weekend activities!</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/events?category=weekend-activities">View All Events</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
