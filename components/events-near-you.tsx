"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Loader2 } from "lucide-react"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string
  image_url: string | null
  start_date: string
  location_city: string
  location_state: string
  location_country: string
  capacity: number
  entry_fee: number
  latitude?: number
  longitude?: number
}

interface EventsNearYouProps {
  fallbackEvents: Event[]
}

export function EventsNearYou({ fallbackEvents }: EventsNearYouProps) {
  const [events, setEvents] = useState<Event[]>(fallbackEvents)
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)

  useEffect(() => {
    // Request user's location
    if ("geolocation" in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lon: longitude })

          // Fetch events near user's location
          try {
            const response = await fetch(
              `/api/events/nearby?lat=${latitude}&lon=${longitude}&limit=6`
            )
            if (response.ok) {
              const data = await response.json()
              if (data.events && data.events.length > 0) {
                setEvents(data.events)
              }
            }
          } catch (error) {
            console.error("Error fetching nearby events:", error)
          } finally {
            setLoading(false)
          }
        },
        (error) => {
          console.error("Geolocation error:", error)
          setLocationError("Unable to detect your location")
          setLoading(false)
        }
      )
    }
  }, [])

  if (loading) {
    return (
      <div className="text-center py-12">
        <Loader2 className="h-8 w-8 animate-spin mx-auto text-primary" />
        <p className="text-muted-foreground mt-4">Finding events near you...</p>
      </div>
    )
  }

  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <MapPin className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No events found near your location</p>
        <Button className="mt-4" asChild>
          <Link href="/events">Browse All Events</Link>
        </Button>
      </div>
    )
  }

  return (
    <div>
      {userLocation && !locationError && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Showing events near your location
        </p>
      )}
      {locationError && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Showing popular events (location access denied)
        </p>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {events.slice(0, 6).map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {event.image_url && (
                <div className="w-full h-48 bg-muted rounded-md mb-4 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover hover:scale-105 transition-transform"
                  />
                </div>
              )}
              <CardTitle className="text-xl line-clamp-1">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
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
                  <span className="line-clamp-1">
                    {event.location_city}, {event.location_state}
                  </span>
                </div>
                {event.capacity > 0 && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Users className="h-4 w-4" />
                    <span>{event.capacity} spots available</span>
                  </div>
                )}
                <div className="pt-4">
                  <Button className="w-full" asChild>
                    <Link href={`/events/${event.id}`}>View Details</Link>
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
