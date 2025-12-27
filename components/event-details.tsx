"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users, Clock, DollarSign, ArrowLeft, Building2, Globe, User, Tag, FileText, CreditCard } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import Image from "next/image"
import { MembershipRequiredModal } from "@/components/membership-required-modal"
import { EventMap } from "@/components/event-map"
import { EventImageCarousel } from "@/components/event-image-carousel"

interface EventDetailsProps {
  event: any
  userId: string | null
  isRegistered: boolean
  registrationStatus?: string
  eventPhotos?: string[]
}

export function EventDetails({ event, userId, isRegistered, registrationStatus, eventPhotos = [] }: EventDetailsProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [registered, setRegistered] = useState(isRegistered)
  const [status, setStatus] = useState(registrationStatus)
  const [showMembershipModal, setShowMembershipModal] = useState(false)
  const [attendeeCount, setAttendeeCount] = useState(event.current_attendees || 0)
  const router = useRouter()

  // Fetch real-time attendee count
  useEffect(() => {
    const fetchAttendeeCount = async () => {
      const supabase = createClient()
      try {
        const { count, error } = await supabase
          .from("event_attendees")
          .select("id", { count: "exact", head: true })
          .eq("event_id", event.id)
          .eq("status", "registered")

        if (error) {
          console.error("Error fetching attendee count:", error.message, error.code)
          return
        }

        if (count !== null) {
          console.log(`Event ${event.id} attendee count: ${count}`)
          setAttendeeCount(count)
        }
      } catch (err) {
        console.error("Exception fetching attendee count:", err)
      }
    }

    // Fetch immediately
    fetchAttendeeCount()

    // Poll every 2 seconds
    const pollInterval = setInterval(fetchAttendeeCount, 2000)

    return () => clearInterval(pollInterval)
  }, [event.id, registered])

  const handleRegister = async () => {
    setIsLoading(true)
    const supabase = createClient()

    // Get current authenticated user from Supabase
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    console.log("Auth check in handleRegister:", { user: user?.id, authError })

    if (!user) {
      setIsLoading(false)
      router.push(`/auth/login?redirect=/events/${event.id}`)
      return
    }

    // Check if membership is required and user has active subscription
    if (event.subscription_required) {
      try {
        // Get user's subscriptions (returns array, not single)
        const { data: subscriptions, error } = await supabase
          .from("user_subscriptions")
          .select("id, status, end_date")
          .eq("user_id", user.id)

        console.log("Subscription check:", { 
          subscriptions, 
          error, 
          userId: user.id, 
          count: subscriptions?.length,
          firstSub: subscriptions?.[0],
          errorCode: error?.code,
          errorMessage: error?.message
        })

        // Log the full error object to see what's wrong
        if (error) {
          console.error("Full error object:", JSON.stringify(error, null, 2))
        }

        if (error && error.code !== 'PGRST116') {
          console.error("Error checking subscription:", error)
          setShowMembershipModal(true)
          setIsLoading(false)
          return
        }

        // Check if subscription exists and is active
        const subscription = subscriptions?.[0]
        if (!subscription || subscription.status !== "active") {
          console.log("No active subscription found for user", user.id, "Status:", subscription?.status)
          setShowMembershipModal(true)
          setIsLoading(false)
          return
        }

        // Check if subscription has expired
        if (subscription.end_date && new Date(subscription.end_date) < new Date()) {
          console.log("Subscription expired for user", user.id)
          setShowMembershipModal(true)
          setIsLoading(false)
          return
        }

        // User has active membership, continue with registration
        console.log("User has active subscription, proceeding with registration")
      } catch (err) {
        console.error("Error checking subscription:", err)
        setShowMembershipModal(true)
        setIsLoading(false)
        return
      }
    }

    // If event has a price, redirect to payment/checkout
    if (event.price > 0) {
      router.push(`/events/${event.id}/checkout`)
      setIsLoading(false)
      return
    }

    // Free event - register directly
    try {
      const { error } = await supabase.from("event_attendees").insert({
        event_id: event.id,
        user_id: user.id,
        status: "registered",
      })

      if (error) throw error

      // Increment local attendee count (DB trigger updates current_attendees)
      setAttendeeCount(prev => prev + 1)
      setRegistered(true)
      setStatus("registered")
      router.refresh()
    } catch (err) {
      console.error("[v0] Registration error:", err)
      alert("Failed to register for event")
    } finally {
      setIsLoading(false)
    }
  }

  const handleCancel = async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("event_attendees")
        .update({ status: "cancelled" })
        .eq("event_id", event.id)
        .eq("user_id", userId)

      if (error) throw error

      // Decrement local attendee count (DB trigger updates current_attendees)
      setAttendeeCount(prev => Math.max(0, prev - 1))
      setStatus("cancelled")
      router.refresh()
    } catch (err) {
      console.error("[v0] Cancellation error:", err)
      alert("Failed to cancel registration")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-5xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/events">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Events
        </Link>
      </Button>

      <Card>
        {/* Event Banner - Carousel or Single Image */}
        {eventPhotos && eventPhotos.length > 0 ? (
          <EventImageCarousel 
            images={eventPhotos}
            title={event.title}
            eventType={event.event_type}
          />
        ) : (
          <div className="aspect-video bg-muted relative">
            {event.image_url ? (
              <img src={event.image_url || "/placeholder.svg"} alt={event.title} className="object-cover w-full h-full" />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="h-16 w-16 text-muted-foreground" />
              </div>
            )}
            {event.event_type && (
              <Badge className="absolute top-4 right-4 capitalize text-base">{event.event_type.replace("_", " ")}</Badge>
            )}
          </div>
        )}

        <CardHeader>
          <div className="flex items-start justify-between gap-4">
            <div className="flex-1">
              <CardTitle className="text-3xl">{event.title}</CardTitle>
              <CardDescription className="text-base mt-2">{event.description || "No description available"}</CardDescription>
            </div>
            {/* Event Logo */}
            {event.logo_url && (
              <div className="relative w-20 h-20 rounded-lg overflow-hidden border-2 border-border flex-shrink-0">
                <Image src={event.logo_url} alt={`${event.title} logo`} fill className="object-contain" />
              </div>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Event Type & Subscription Badge */}
          <div className="flex flex-wrap gap-2">
            {event.event_type && (
              <Badge variant="outline" className="capitalize">
                <Tag className="h-3 w-3 mr-1" />
                {event.event_type.replace("_", " ")}
              </Badge>
            )}
            {event.subscription_required && (
              <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                <CreditCard className="h-3 w-3 mr-1" />
                Membership Required
              </Badge>
            )}
          </div>

          {/* Main Event Details Grid */}
          <div className="grid gap-4 md:grid-cols-2">
            {/* Start Date & Time */}
            <div className="flex items-start gap-3">
              <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Start Date & Time</p>
                <p className="text-sm text-muted-foreground">{format(new Date(event.start_date), "PPP 'at' p")}</p>
              </div>
            </div>

            {/* End Date & Time */}
            <div className="flex items-start gap-3">
              <Clock className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">End Date & Time</p>
                <p className="text-sm text-muted-foreground">{format(new Date(event.end_date), "PPP 'at' p")}</p>
              </div>
            </div>

            {/* Venue */}
            <div className="flex items-start gap-3">
              <Building2 className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Venue</p>
                <p className="text-sm text-muted-foreground">{event.location_name || "TBA"}</p>
                {event.location_address && (
                  <p className="text-sm text-muted-foreground">{event.location_address}</p>
                )}
                {event.venue_type && (
                  <Badge variant="outline" className="mt-1 text-xs capitalize">{event.venue_type}</Badge>
                )}
              </div>
            </div>

            {/* Location Details */}
            <div className="flex items-start gap-3">
              <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div className="w-full">
                <p className="font-medium">Location</p>
                <p className="text-sm text-muted-foreground">
                  {event.location_city || event.city_name || "City"}, {event.location_state || event.state_name || "State"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {event.location_country || event.country_name || "Country"}
                </p>
                
                {/* Google Map */}
                {event.latitude && event.longitude && (
                  <div className="mt-4">
                    <EventMap
                      events={[{
                        id: event.id,
                        title: event.title,
                        latitude: event.latitude,
                        longitude: event.longitude,
                        location_name: event.location_name,
                        location_address: event.location_address,
                        location_city: event.location_city || event.city_name,
                        location_state: event.location_state || event.state_name,
                        start_date: event.start_date,
                      }]}
                      center={{ lat: event.latitude, lng: event.longitude }}
                      zoom={15}
                      height="300px"
                    />
                  </div>
                )}
              </div>
            </div>

            {/* Capacity */}
            <div className="flex items-start gap-3">
              <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Capacity</p>
                <p className="text-sm text-muted-foreground">
                  {attendeeCount}
                  {event.capacity && ` / ${event.capacity}`} registered
                </p>
              </div>
            </div>

            {/* Gender Limitations */}
            {event.gender_limitation && (
              <div className="flex items-start gap-3">
                <User className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Gender Limitations</p>
                  <p className="text-sm text-muted-foreground capitalize">
                    {event.gender_limitation.replace("_", " ")}
                  </p>
                </div>
              </div>
            )}

            {/* Age Range */}
            {(event.min_age || event.max_age) && (
              <div className="flex items-start gap-3">
                <Users className="h-5 w-5 text-muted-foreground mt-0.5" />
                <div>
                  <p className="font-medium">Age Range</p>
                  <p className="text-sm text-muted-foreground">
                    {event.min_age && event.max_age
                      ? `${event.min_age} - ${event.max_age} years`
                      : event.min_age
                        ? `${event.min_age}+ years`
                        : `Up to ${event.max_age} years`}
                  </p>
                </div>
              </div>
            )}

            {/* Entry Fee / Ticket Price */}
            <div className="flex items-start gap-3">
              <DollarSign className="h-5 w-5 text-muted-foreground mt-0.5" />
              <div>
                <p className="font-medium">Entry Fee / Ticket Price</p>
                <p className="text-sm text-muted-foreground font-semibold">
                  {event.price > 0 ? `$${Number(event.price).toFixed(2)}` : "Free"}
                </p>
              </div>
            </div>
          </div>

          {/* Registration Dates Section */}
          {(event.registration_start_date || event.registration_end_date) && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-3 flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Registration Period
              </h3>
              <div className="grid gap-3 md:grid-cols-2">
                {event.registration_start_date && (
                  <div>
                    <p className="text-sm font-medium">Registration Opens</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.registration_start_date), "PPP 'at' p")}
                    </p>
                  </div>
                )}
                {event.registration_end_date && (
                  <div>
                    <p className="text-sm font-medium">Registration Closes</p>
                    <p className="text-sm text-muted-foreground">
                      {format(new Date(event.registration_end_date), "PPP 'at' p")}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Refund Policy */}
          {event.refund_policy && (
            <div className="border-t pt-4">
              <h3 className="font-semibold mb-2 flex items-center gap-2">
                <FileText className="h-4 w-4" />
                Refund Policy
              </h3>
              <p className="text-sm text-muted-foreground whitespace-pre-wrap">{event.refund_policy}</p>
            </div>
          )}

          <div className="pt-4 border-t">
            {!userId ? (
              <div className="space-y-3">
                <p className="text-sm text-muted-foreground text-center">
                  Sign in to register for this event
                </p>
                <Button asChild className="w-full" size="lg">
                  <Link href={`/auth/login?redirect=/events/${event.id}`}>
                    Sign In to Register
                  </Link>
                </Button>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/auth/sign-up">
                    Create Account
                  </Link>
                </Button>
              </div>
            ) : registered && status === "registered" ? (
              <div className="space-y-3">
                <Badge variant="secondary" className="text-base px-4 py-2">
                  You are registered for this event
                </Badge>
                <Button variant="destructive" onClick={handleCancel} disabled={isLoading} className="w-full">
                  {isLoading ? "Cancelling..." : "Cancel Registration"}
                </Button>
              </div>
            ) : status === "cancelled" ? (
              <Badge variant="outline" className="text-base px-4 py-2">
                Registration cancelled
              </Badge>
            ) : (
              <Button
                onClick={handleRegister}
                disabled={isLoading || (event.capacity && attendeeCount >= event.capacity)}
                className="w-full"
                size="lg"
              >
                {isLoading
                  ? event.price > 0 ? "Redirecting to checkout..." : "Registering..."
                  : event.capacity && attendeeCount >= event.capacity
                    ? "Event Full"
                    : event.price > 0 
                      ? `Purchase Ticket - $${event.price.toFixed(2)}`
                      : "Register for Free Event"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Membership Required Modal */}
      <MembershipRequiredModal
        isOpen={showMembershipModal}
        onClose={() => setShowMembershipModal(false)}
        eventTitle={event.title}
        onUpgrade={() => {
          setShowMembershipModal(false)
          router.push("/membership")
        }}
        isLoading={isLoading}
      />
    </div>
  )
}
