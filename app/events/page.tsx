import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Heart, Shield } from "lucide-react"
import Link from "next/link"
import { PublicPageLayout } from "@/components/public-page-layout"

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ category?: string; status?: string; q?: string; location?: string; date?: string; page?: string }>
}) {
  const supabase = await createClient()
  const params = await searchParams
  
  // Get page number from params (default to 1)
  const page = Math.max(1, parseInt(params.page || "1"))
  const itemsPerPage = 12
  const offset = (page - 1) * itemsPerPage

  // Fetch categories for filter
  const { data: categories } = await supabase
    .from("event_categories")
    .select("*")
    .eq("is_active", true)
    .order("display_order", { ascending: true })

  // Get category ID if filtering by category slug
  let categoryId: string | null = null
  if (params.category && categories) {
    const category = categories.find((cat) => cat.slug === params.category)
    categoryId = category?.id || null
  }

  // Build query
  let query = supabase
    .from("events")
    .select("*", { count: "exact" })
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: true })
    .range(offset, offset + itemsPerPage - 1)

  // Filter by category if provided
  if (categoryId) {
    query = query.eq("category_id", categoryId)
  }

  // Filter by status if provided
  if (params.status) {
    query = query.eq("status", params.status)
  } else {
    // Default: show only upcoming and ongoing events
    query = query.in("status", ["upcoming", "ongoing"])
  }

  // Filter by keyword (search in title and description)
  if (params.q) {
    query = query.or(`title.ilike.%${params.q}%,description.ilike.%${params.q}%`)
  }

  // Filter by location (city or state)
  if (params.location) {
    query = query.or(`location_city.ilike.%${params.location}%,location_state.ilike.%${params.location}%`)
  }

  // Filter by date (events on or after the selected date)
  if (params.date) {
    const startOfDay = new Date(params.date)
    startOfDay.setHours(0, 0, 0, 0)
    const endOfDay = new Date(params.date)
    endOfDay.setHours(23, 59, 59, 999)

    query = query
      .gte("start_date", startOfDay.toISOString())
      .lte("start_date", endOfDay.toISOString())
  }

  const { data: events, count, error: eventsError } = await query
  // Calculate pagination info
  const totalPages = Math.ceil((count || 0) / itemsPerPage)

  // Helper function to build search params with page
  const buildPageUrl = (pageNum: number) => {
    const searchParams = new URLSearchParams()
    if (params.category) searchParams.append("category", params.category)
    if (params.status) searchParams.append("status", params.status)
    if (params.q) searchParams.append("q", params.q)
    if (params.location) searchParams.append("location", params.location)
    if (params.date) searchParams.append("date", params.date)
    searchParams.append("page", String(pageNum))
    return `/events?${searchParams.toString()}`
  }

  return (
    <PublicPageLayout>
        {/* Hero Section */}
        <section className="bg-gradient-to-b from-primary/5 to-background py-12">
          <div className="container mx-auto px-4">
            <div className="max-w-3xl mx-auto text-center">
              <h1 className="text-4xl md:text-5xl font-bold mb-4">Browse Events</h1>
              <p className="text-lg text-muted-foreground">
                Discover exciting events and connect with like-minded people
              </p>
            </div>
          </div>
        </section>

        {/* Filters & Events */}
        <section className="py-8">
          <div className="container mx-auto px-4">
            {/* Filters */}
            {categories && categories.length > 0 && (
              <div className="mb-8">
                <h2 className="text-sm font-semibold text-muted-foreground mb-3">Filter by Category</h2>
                <div className="flex flex-wrap gap-2">
                  <Button 
                    size="sm"
                    variant={!params.category ? "default" : "outline"} 
                    asChild
                  >
                    <Link href="/events">All Categories</Link>
                  </Button>
                  {categories.map((category) => (
                    <Button
                      key={category.id}
                      size="sm"
                      variant={params.category === category.slug ? "default" : "outline"}
                      asChild
                    >
                      <Link href={`/events?category=${category.slug}`}>
                        {category.name}
                      </Link>
                    </Button>
                  ))}
                </div>
              </div>
            )}

        {/* Events Count & Active Filters */}
        {events && events.length > 0 && (
          <div className="mb-6">
            <p className="text-sm text-muted-foreground mb-2">
              {params.category 
                ? `Showing ${events.length} event${events.length !== 1 ? 's' : ''} in this category`
                : `${events.length} event${events.length !== 1 ? 's' : ''} found`}
            </p>
            {(params.q || params.location || params.date) && (
              <div className="flex flex-wrap gap-2">
                {params.q && (
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                    📝 {params.q}
                  </span>
                )}
                {params.location && (
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                    📍 {params.location}
                  </span>
                )}
                {params.date && (
                  <span className="text-xs bg-primary/10 text-primary px-3 py-1 rounded-full">
                    📅 {new Date(params.date).toLocaleDateString()}
                  </span>
                )}
                <Button 
                  variant="ghost" 
                  size="sm" 
                  className="text-xs h-auto py-1 px-2"
                  asChild
                >
                  <Link href="/events">Clear Filters</Link>
                </Button>
              </div>
            )}
          </div>
        )}

        {/* Events Grid */}
        {!events || events.length === 0 ? (
          <div className="text-center py-16">
            <div className="inline-flex items-center justify-center w-16 h-16 rounded-full bg-muted mb-4">
              <Calendar className="h-8 w-8 text-muted-foreground" />
            </div>
            <h3 className="text-lg font-semibold mb-2">No Events Found</h3>
            <p className="text-muted-foreground mb-6 max-w-sm mx-auto">
              {params.q || params.location || params.date
                ? "No events match your search criteria. Try adjusting your filters or searching for something else."
                : params.category
                ? "There are no events in this category at the moment. Try selecting a different category."
                : "There are no upcoming events at the moment. Check back soon for new events!"}
            </p>
            <div className="flex gap-3 justify-center flex-wrap">
              {(params.q || params.location || params.date || params.category) && (
                <Button variant="outline" asChild>
                  <Link href="/events">Clear All Filters</Link>
                </Button>
              )}
              <Button asChild>
                <Link href="/">Back to Home</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {events.map((event) => (
                <Card key={event.id} className="hover:shadow-lg transition-shadow">
                  <CardHeader>
                    {event.image_url && (
                      <div className="w-full h-48 bg-muted rounded-md mb-4 overflow-hidden">
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      </div>
                    )}
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className={`text-xs px-2 py-1 rounded-full ${
                          event.status === "upcoming"
                            ? "bg-blue-100 text-blue-800"
                            : event.status === "ongoing"
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-800"
                        }`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <CardTitle className="text-xl">{event.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {event.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3 text-sm">
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <Calendar className="h-4 w-4" />
                        <span>
                          {new Date(event.start_date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-muted-foreground">
                        <MapPin className="h-4 w-4" />
                        <span>
                          {event.location_city}, {event.location_state}
                        </span>
                      </div>
                      {event.capacity && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Users className="h-4 w-4" />
                          <span>Capacity: {event.capacity}</span>
                        </div>
                      )}
                      {event.price !== null && event.price !== undefined && (
                        <div className="pt-2 text-lg font-semibold">
                          {event.price === 0 ? (
                            <span className="text-green-600">Free</span>
                          ) : (
                            <span>${event.price}</span>
                          )}
                        </div>
                      )}
                      <div className="pt-2">
                        <Button className="w-full" asChild>
                          <Link href={`/events/${event.id}`}>View Details</Link>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-12">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === 1}
                  asChild={page > 1}
                >
                  {page > 1 ? (
                    <Link href={buildPageUrl(page - 1)}>
                      ← Previous
                    </Link>
                  ) : (
                    <span>← Previous</span>
                  )}
                </Button>

                <div className="flex items-center gap-1">
                  {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                    let pageNum: number
                    if (totalPages <= 5) {
                      pageNum = i + 1
                    } else if (page <= 3) {
                      pageNum = i + 1
                    } else if (page >= totalPages - 2) {
                      pageNum = totalPages - 4 + i
                    } else {
                      pageNum = page - 2 + i
                    }
                    
                    return (
                      <Button
                        key={pageNum}
                        variant={page === pageNum ? "default" : "outline"}
                        size="sm"
                        asChild={page !== pageNum}
                      >
                        {page === pageNum ? (
                          <span>{pageNum}</span>
                        ) : (
                          <Link href={buildPageUrl(pageNum)}>
                            {pageNum}
                          </Link>
                        )}
                      </Button>
                    )
                  })}
                </div>

                <Button
                  variant="outline"
                  size="sm"
                  disabled={page === totalPages}
                  asChild={page < totalPages}
                >
                  {page < totalPages ? (
                    <Link href={buildPageUrl(page + 1)}>
                      Next →
                    </Link>
                  ) : (
                    <span>Next →</span>
                  )}
                </Button>
              </div>
            )}

            {/* Page Info */}
            {events && events.length > 0 && (
              <div className="text-center mt-8 text-sm text-muted-foreground">
                Showing {offset + 1} to {Math.min(offset + itemsPerPage, count || 0)} of {count || 0} events
              </div>
            )}
          </>
        )}
          </div>
        </section>
    </PublicPageLayout>
  )
}
