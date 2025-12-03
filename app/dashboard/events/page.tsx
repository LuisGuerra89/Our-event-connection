import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Calendar, MapPin, Users, Clock } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

export default async function DashboardEventsPage() {
  const supabase = await createServerClient()

  const { data, error: authError } = await supabase.auth.getUser()
  const user = data?.user
  if (authError || !user) {
    redirect("/auth/login")
  }

  // Get events the user has registered for
  const { data: registrations } = await supabase
    .from("event_registrations")
    .select("event_id")
    .eq("user_id", user.id)
    .eq("status", "confirmed")

  if (!registrations || registrations.length === 0) {
    return (
      <div className="min-h-full py-8">
        <div className="container mx-auto px-4">
          <div className="mb-8">
            <h1 className="text-3xl font-bold">My Events</h1>
            <p className="text-muted-foreground mt-2">Events you've registered for</p>
          </div>

          <Card>
            <CardContent className="pt-6">
              <div className="text-center py-12">
                <Calendar className="h-12 w-12 text-muted-foreground mx-auto mb-4 opacity-50" />
                <h3 className="text-lg font-semibold mb-2">No Events Yet</h3>
                <p className="text-muted-foreground mb-6">You haven't registered for any events yet.</p>
                <Button asChild>
                  <Link href="/events">Browse Events</Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  // Get the events
  const eventIds = registrations.map((r) => r.event_id)
  const { data: events } = await supabase
    .from("events")
    .select(`
      *,
      locations(country_name, state_name, city_name)
    `)
    .in("id", eventIds)
    .order("start_date", { ascending: true })

  // Get user profile for display
  const { data: profile } = await supabase
    .from("profiles")
    .select("full_name")
    .eq("id", user.id)
    .single()

  return (
    <div className="min-h-full py-8">
      <div className="container mx-auto px-4">
        <div className="mb-8">
          <h1 className="text-3xl font-bold">My Events</h1>
          <p className="text-muted-foreground mt-2">
            {events?.length || 0} event{events?.length !== 1 ? "s" : ""} registered
          </p>
        </div>

        <div className="grid gap-6">
          {events?.map((event) => {
            const locationData = Array.isArray(event.locations) ? event.locations[0] : event.locations
            const location = locationData as unknown as {
              country_name: string
              state_name: string
              city_name: string
            } | null

            const startDate = new Date(event.start_date)
            const endDate = new Date(event.end_date)
            const now = new Date()

            const isUpcoming = startDate > now
            const isOngoing = startDate <= now && endDate >= now
            const isPast = endDate < now

            let status = "Upcoming"
            let statusColor = "bg-blue-500/10 text-blue-700"

            if (isPast) {
              status = "Past"
              statusColor = "bg-gray-500/10 text-gray-700"
            } else if (isOngoing) {
              status = "Ongoing"
              statusColor = "bg-green-500/10 text-green-700"
            }

            return (
              <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-2">
                        <h2 className="text-2xl font-bold">{event.name}</h2>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${statusColor}`}>
                          {status}
                        </span>
                      </div>
                      <p className="text-muted-foreground">{event.description}</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Date and Time */}
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Date & Time</p>
                        <p className="text-sm text-muted-foreground">
                          {startDate.toLocaleDateString()} at {startDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                          {isUpcoming
                            ? `Starts in ${formatDistanceToNow(startDate)}`
                            : isPast
                              ? `Ended ${formatDistanceToNow(endDate, { addSuffix: true })}`
                              : "Happening now"}
                        </p>
                      </div>
                    </div>

                    {/* Location */}
                    {location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm font-medium">Location</p>
                          <p className="text-sm text-muted-foreground">
                            {location.city_name}, {location.state_name}
                          </p>
                          <p className="text-xs text-muted-foreground">{location.country_name}</p>
                        </div>
                      </div>
                    )}

                    {/* Venue */}
                    <div className="flex items-start gap-3">
                      <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Venue</p>
                        <p className="text-sm text-muted-foreground">{event.venue_name || "TBD"}</p>
                        <p className="text-xs text-muted-foreground">{event.venue_type || "Location"}</p>
                      </div>
                    </div>

                    {/* Attendees */}
                    <div className="flex items-start gap-3">
                      <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm font-medium">Attendees</p>
                        <p className="text-sm text-muted-foreground">
                          {event.current_attendees || 0} / {event.max_attendees || "Unlimited"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Event Details */}
                  {event.entry_fee && (
                    <div className="pt-4 border-t">
                      <p className="text-sm">
                        <span className="font-medium">Entry Fee:</span> ${event.entry_fee}
                      </p>
                    </div>
                  )}

                  {/* Actions */}
                  <div className="pt-4 flex gap-2">
                    <Button asChild variant="default">
                      <Link href={`/events/${event.id}`}>View Details</Link>
                    </Button>
                    {isUpcoming && (
                      <Button asChild variant="outline">
                        <Link href={`/events/${event.id}/checkout`}>Manage Registration</Link>
                      </Button>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>

        {/* Browse More Events */}
        <div className="mt-12 pt-8 border-t">
          <div className="text-center">
            <h3 className="text-lg font-semibold mb-2">Looking for More Events?</h3>
            <p className="text-muted-foreground mb-6">Discover and register for more exciting events</p>
            <Button asChild size="lg">
              <Link href="/events">Browse All Events</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
