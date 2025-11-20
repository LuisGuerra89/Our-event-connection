import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { ThisWeekEventsList } from "@/components/this-week-events-list"

export const metadata = {
  title: "This Week's Events | EventMatch",
  description: "Discover exciting events happening this week. Meet new people and find your perfect match.",
}

export default async function ThisWeekEventsPage() {
  const supabase = await createServerClient()

  // Get start and end of current week (Sunday to Saturday)
  const now = new Date()
  const startOfWeek = new Date(now)
  startOfWeek.setDate(now.getDate() - now.getDay()) // Start of week (Sunday)
  startOfWeek.setHours(0, 0, 0, 0)
  
  const endOfWeek = new Date(startOfWeek)
  endOfWeek.setDate(startOfWeek.getDate() + 6) // End of week (Saturday)
  endOfWeek.setHours(23, 59, 59, 999)

  // Fetch initial events for this week
  const { data: initialEvents, count } = await supabase
    .from("events")
    .select("*", { count: "exact" })
    .in("status", ["upcoming", "ongoing"])
    .gte("start_date", startOfWeek.toISOString())
    .lte("start_date", endOfWeek.toISOString())
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
              This Week's Events
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground text-pretty">
              Don't miss out! Discover amazing events happening this week and make meaningful connections.
            </p>
            <div className="mt-6 flex items-center justify-center gap-2 text-muted-foreground">
              <span className="text-lg font-semibold">
                {startOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric" })}
              </span>
              <span>-</span>
              <span className="text-lg font-semibold">
                {endOfWeek.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Event Listing with Filtering & Lazy Loading */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <ThisWeekEventsList 
            initialEvents={initialEvents || []}
            totalCount={count || 0}
            categories={categories || []}
            startOfWeek={startOfWeek.toISOString()}
            endOfWeek={endOfWeek.toISOString()}
          />
        </div>
      </section>
    </PublicPageLayout>
  )
}
