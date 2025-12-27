import { redirect, notFound } from "next/navigation"
import Script from "next/script"
import { createClient } from "@/lib/supabase/server"
import { EventDetails } from "@/components/event-details"
import { PublicPageLayout } from "@/components/public-page-layout"
import { eventSchema } from "@/components/schema-org"

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

  // Fetch event photos
  const { data: eventPhotos } = await supabase
    .from("event_photos")
    .select("*")
    .eq("event_id", id)
    .order("display_order", { ascending: true })

  // Combine photos from event_photos table and banner_images field
  const allPhotos = [
    ...(eventPhotos?.filter((p) => p.photo_type === "photo").map((p) => p.photo_url) || []),
    ...(event.banner_images && Array.isArray(event.banner_images) ? event.banner_images : []),
    ...(event.image_url ? [event.image_url] : [])
  ].filter(Boolean) // Remove any undefined/null values

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

  // Build Event Schema for SEO
  const eventSchemaData = eventSchema({
    name: event.title,
    description: event.description,
    startDate: event.start_date,
    endDate: event.end_date,
    location: {
      name: event.venue_name || `${event.city_name || event.location_city}, ${event.state_name || event.location_state}`,
      address: event.venue_address || `${event.location_city}, ${event.location_state}, ${event.country_name}`,
    },
    image: event.image_url || 'https://ourloveconnection.com/og-image.png',
    url: `https://ourloveconnection.com/events/${id}`,
    price: event.price || 0,
    priceCurrency: 'USD',
  })

  return (
    <PublicPageLayout>
      <Script
        id="event-schema"
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify(eventSchemaData),
        }}
      />
      <EventDetails
        event={event}
        userId={user?.id || null}
        isRegistered={!!registration}
        registrationStatus={registration?.status}
        eventPhotos={allPhotos}
      />
    </PublicPageLayout>
  )
}
