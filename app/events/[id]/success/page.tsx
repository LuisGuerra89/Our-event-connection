import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { CheckCircle, Calendar, MapPin, Mail } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { TicketPDFDownload } from "@/components/ticket-pdf-download"

export default async function EventSuccessPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/events/${id}`)
  }

  // Get event details
  const { data: event } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (!event) {
    redirect("/events")
  }

  // Check registration
  const { data: registration } = await supabase
    .from("event_attendees")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("status", "registered")
    .single()

  if (!registration) {
    redirect(`/events/${id}`)
  }

  // Get user profile for email
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name, first_name, last_name")
    .eq("id", user.id)
    .single()

  // Get latest payment transaction ID
  const { data: payment } = await supabase
    .from("payments")
    .select("transaction_id")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .order("created_at", { ascending: false })
    .limit(1)
    .single()

  const transactionId = payment?.transaction_id || "N/A"

  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-12 max-w-3xl">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-green-100 mb-4">
            <CheckCircle className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold mb-2">Payment Successful!</h1>
          <p className="text-xl text-muted-foreground">
            Your ticket has been confirmed
          </p>
        </div>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Event Details</span>
              <Badge variant="secondary" className="text-base">
                Confirmed
              </Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Event Image */}
            {event.image_url && (
              <div className="relative aspect-video rounded-lg overflow-hidden">
                <img 
                  src={event.image_url} 
                  alt={event.title}
                  className="object-cover w-full h-full"
                />
              </div>
            )}

            {/* Event Information */}
            <div>
              <h2 className="text-2xl font-semibold mb-4">{event.title}</h2>
              
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <Calendar className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Date & Time</p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.start_date), "PPPP")}
                    </p>
                    <p className="text-muted-foreground">
                      {format(new Date(event.start_date), "p")} - {format(new Date(event.end_date), "p")}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <MapPin className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Location</p>
                    <p className="text-muted-foreground">{event.location_name}</p>
                    <p className="text-muted-foreground">{event.location_address}</p>
                    <p className="text-muted-foreground">
                      {event.location_city}, {event.location_state} {event.location_zip}
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <Mail className="w-5 h-5 text-muted-foreground mt-0.5" />
                  <div>
                    <p className="font-medium">Confirmation Email</p>
                    <p className="text-muted-foreground">
                      A confirmation email has been sent to {profile?.email}
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="border-t pt-6 space-y-3">
              <TicketPDFDownload
                eventId={event.id}
                userId={user.id}
                eventTitle={event.title}
                eventDate={format(new Date(event.start_date), "PPPP")}
                eventTime={`${format(new Date(event.start_date), "p")} - ${format(new Date(event.end_date), "p")}`}
                eventLocation={`${event.location_name}, ${event.location_city}`}
                userName={profile?.first_name ? `${profile.first_name} ${profile.last_name || ""}`.trim() : profile?.full_name || "Guest"}
                transactionId={transactionId}
              />
              
              <div className="grid grid-cols-2 gap-3">
                <Button asChild variant="outline">
                  <Link href={`/events/${event.id}`}>
                    View Event
                  </Link>
                </Button>
                <Button asChild variant="outline">
                  <Link href="/events">
                    Browse Events
                  </Link>
                </Button>
              </div>

              <Button asChild className="w-full" size="lg">
                <Link href="/dashboard">
                  Go to Dashboard
                </Link>
              </Button>
            </div>

            {/* Important Info */}
            <div className="bg-muted p-4 rounded-lg space-y-2 text-sm">
              <p className="font-semibold">Important Information:</p>
              <ul className="list-disc list-inside space-y-1 text-muted-foreground">
                <li>Please arrive 15 minutes before the event start time</li>
                <li>Bring a valid ID for check-in</li>
                <li>Your ticket will be available in your dashboard</li>
                <li>Check your email for additional event details</li>
              </ul>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageLayout>
  )
}
