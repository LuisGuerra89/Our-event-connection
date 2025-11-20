import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { EventDetails } from "@/components/event-details"
import { PublicPageLayout } from "@/components/public-page-layout"

export default async function EventPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get user if authenticated (but don't require it)
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  // Fetch event with location details
  const { data: event, error: eventError } = await supabase
    .from("events")
    .select(`
      *,
      country:countries(id, name, code),
      state:states(id, name),
      city:cities(id, name)
    `)
    .eq("id", id)
    .single()

  if (eventError || !event) {
    notFound()
  }

  // Add location names to event object for display
  if (event.country) {
    event.country_name = event.country.name
  }
  if (event.state) {
    event.state_name = event.state.name
  }
  if (event.city) {
    event.city_name = event.city.name
  }

  // Check if user is already registered (only if authenticated)
  let registration = null
  if (user) {
    const { data: reg } = await supabase
      .from("event_attendees")
      .select("id, status")
      .eq("event_id", id)
      .eq("user_id", user.id)
      .single()
    registration = reg
  }

  return (
    <PublicPageLayout>
      <EventDetails
        event={event}
        userId={user?.id || null}
        isRegistered={!!registration}
        registrationStatus={registration?.status}
      />
    </PublicPageLayout>
  )
}
