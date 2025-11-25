import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { EventCheckoutForm } from "@/components/event-checkout-form"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, DollarSign, Clock, ShieldCheck } from "lucide-react"
import { format } from "date-fns"

export default async function EventCheckoutPage({ 
  params 
}: { 
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()

  // Get user
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) {
    redirect(`/auth/login?redirect=/events/${id}/checkout`)
  }

  // Get event details
  const { data: event, error } = await supabase
    .from("events")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !event) {
    redirect("/events")
  }

  // Check if already registered
  const { data: existing } = await supabase
    .from("event_attendees")
    .select("*")
    .eq("event_id", event.id)
    .eq("user_id", user.id)
    .eq("status", "registered")
    .single()

  if (existing) {
    redirect(`/events/${params.id}`)
  }

  // Check if event is full
  if (event.capacity && event.current_attendees >= event.capacity) {
    redirect(`/events/${params.id}`)
  }

  // Check if membership is required and user has active subscription
  if (event.subscription_required) {
    const { data: subscriptions, error: subError } = await supabase
      .from("user_subscriptions")
      .select("id, status, end_date")
      .eq("user_id", user.id)

    const subscription = subscriptions?.[0]

    // Check if subscription exists and is active
    if (!subscription || subscription.status !== "active") {
      redirect(`/events/${params.id}`)
    }

    // Check if subscription has expired
    if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
      redirect(`/events/${params.id}`)
    }
  }

  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-12 max-w-6xl">
        <div className="grid lg:grid-cols-5 gap-8">
          {/* Order Summary - Left Side */}
          <div className="lg:col-span-2">
            <Card>
              <CardHeader>
                <CardTitle>Order Summary</CardTitle>
                <CardDescription>Review your ticket purchase</CardDescription>
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

                {/* Event Details */}
                <div>
                  <h3 className="font-semibold text-lg mb-1">{event.title}</h3>
                  {event.event_type && (
                    <Badge variant="secondary" className="capitalize">
                      {event.event_type.replace("_", " ")}
                    </Badge>
                  )}
                </div>

                <div className="space-y-3 text-sm">
                  <div className="flex items-start gap-3">
                    <Calendar className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Date</p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.start_date), "PPP")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <Clock className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Time</p>
                      <p className="text-muted-foreground">
                        {format(new Date(event.start_date), "p")} - {format(new Date(event.end_date), "p")}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <MapPin className="w-4 h-4 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="font-medium">Location</p>
                      <p className="text-muted-foreground">{event.location_name}</p>
                      <p className="text-muted-foreground text-xs">
                        {event.location_city}, {event.location_state}
                      </p>
                    </div>
                  </div>
                </div>

                {/* Price Breakdown */}
                <div className="border-t pt-4 space-y-2">
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Ticket Price</span>
                    <span className="font-medium">${event.price.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span className="font-medium">${(event.price * 0.05).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between text-lg font-bold border-t pt-2">
                    <span>Total</span>
                    <span>${(event.price * 1.05).toFixed(2)}</span>
                  </div>
                </div>

                {/* Security Badge */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground bg-muted p-3 rounded-lg">
                  <ShieldCheck className="w-4 h-4 text-green-600" />
                  <span>Secure payment powered by Stripe</span>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Payment Form - Right Side */}
          <div className="lg:col-span-3">
            <Card>
              <CardHeader>
                <CardTitle>Payment Information</CardTitle>
                <CardDescription>
                  Complete your purchase to secure your spot at this event
                </CardDescription>
              </CardHeader>
              <CardContent>
                <EventCheckoutForm 
                  eventId={event.id}
                  userId={user.id}
                  amount={(event.price * 1.05).toFixed(2)}
                  eventTitle={event.title}
                />
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </PublicPageLayout>
  )
}
