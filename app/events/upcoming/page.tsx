import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { UpcomingEventsList } from "@/components/upcoming-events-list"

export const metadata = {
  title: "Upcoming Events | EventMatch",
  description: "Discover all upcoming events. Meet new people and find your perfect match at our carefully curated social gatherings.",
}

export default async function UpcomingEventsPage() {
  const supabase = await createServerClient()

  // Get all upcoming events (future events)
  const now = new Date().toISOString()

  // Fetch initial events
  const { data: initialEvents, count } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .in("status", ["upcoming", "ongoing"])
    .gte("start_date", now)
    .order("start_date", { ascending: true })
    .limit(12)

  // Fetch categories for filtering
  const { data: categories } = await supabase
    .from("event_categories")
    .select("*")
    .eq("status", "active")
    .order("name")

  return (
    <PublicPageLayout>
      {/* Hero Banner */}
      <section className="relative bg-gradient-to-b from-primary/10 via-primary/5 to-background py-20 md:py-32">
        <div className="container mx-auto px-4">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance">
              Upcoming Events
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
              Browse all our upcoming events and secure your spot. Your next meaningful connection is just one event away!
            </p>
          </div>
        </div>
      </section>

      {/* Event Listing with Filtering & Lazy Loading */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <UpcomingEventsList 
            initialEvents={initialEvents || []}
            totalCount={count || 0}
            categories={categories || []}
          />
        </div>
      </section>
    </PublicPageLayout>
  )
}
