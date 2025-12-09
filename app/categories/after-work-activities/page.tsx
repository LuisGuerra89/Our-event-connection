import type { Metadata } from 'next'
import { createClient } from "@/lib/supabase/server"
import Link from "next/link"
import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { EventList } from "@/components/event-list"

export const metadata: Metadata = {
  title: 'After Work Activities - Social Events for Singles | Our Love Connection',
  description: 'Join fun after-work activities and events designed for singles to meet and connect.',
  keywords: 'after work activities, social events, networking, singles meetups, after work dating',
  openGraph: {
    title: 'After Work Activities | Our Love Connection',
    description: 'Join fun after-work activities and events designed for singles to meet and connect.',
    url: 'https://ourloveconnection.com/categories/after-work-activities',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'After Work Activities',
      },
    ],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com/categories/after-work-activities',
  },
}

export default async function AfterWorkActivitiesPage() {
  const supabase = await createClient()

  // Get the authenticated user
  const { data: { user } } = await supabase.auth.getUser()
  const userId = user?.id || ""

  // Get the category ID for after-work-activities
  const { data: category } = await supabase
    .from("event_categories")
    .select("id")
    .eq("slug", "after-work-activities")
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
      <div className="w-full max-w-4xl mx-auto px-4 py-8 sm:py-12 md:py-16">
        <div className="text-center mb-8 sm:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 sm:mb-6">After Work Activities</h1>
          <p className="text-base sm:text-lg md:text-xl text-muted-foreground">
            Discover social events and activities happening after work hours. Meet like-minded singles in a relaxed environment.
          </p>
        </div>

        {events.length > 0 ? (
          <div className="mb-12">
            <EventList events={events} userId={userId} />
          </div>
        ) : (
          <div className="grid gap-6 w-full">
            <Card className="w-full">
              <CardHeader className="text-center">
                <CardTitle className="text-xl sm:text-2xl">No Events Yet</CardTitle>
                <CardDescription className="text-sm sm:text-base">Check back soon for upcoming after-work activities!</CardDescription>
              </CardHeader>
              <CardContent className="flex justify-center">
                <Button size="lg" asChild className="w-full sm:w-auto">
                  <Link href="/events?category=after-work-activities">View All Events</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </PublicPageLayout>
  )
}
