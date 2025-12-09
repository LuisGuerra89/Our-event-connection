import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { PastEventsList } from "@/components/past-events-list"

export const metadata = {
  title: "Past Events | EventMatch",
  description: "Browse our archive of past events. See photos, videos, and memories from previous gatherings.",
}

export default async function PastEventsPage() {
  const supabase = await createServerClient()

  // Get past events (ended before today)
  const now = new Date().toISOString()

  // Fetch initial past events
  const { data: initialEvents, count } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .lt("end_date", now)
    .order("start_date", { ascending: false })
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
      <section 
        className="relative bg-cover bg-center bg-no-repeat py-20 md:py-32"
        style={{
          backgroundImage: `url('/past-events.jpg')`
        }}
      >
        {/* Overlays for text readability */}
        <div className="absolute inset-0 bg-black/50" />
        <div className="absolute inset-0 bg-black/30" />
        
        <div className="container mx-auto px-4 relative z-10">
          <div className="max-w-4xl mx-auto text-center">
            <h1 className="text-4xl md:text-6xl font-bold mb-6 text-balance text-white drop-shadow-lg">
              Past Events
            </h1>
            <p className="text-xl md:text-2xl text-white/90 text-pretty drop-shadow-md">
              Relive the memories! Browse photos and videos from our previous events and see the amazing connections that were made.
            </p>
          </div>
        </div>
      </section>

      {/* Event Listing with Filtering & Lazy Loading */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <PastEventsList 
            initialEvents={initialEvents || []}
            totalCount={count || 0}
            categories={categories || []}
          />
        </div>
      </section>
    </PublicPageLayout>
  )
}
