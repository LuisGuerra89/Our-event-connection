"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, Users, Loader2, Map } from "lucide-react"
import Link from "next/link"
import { EventMap } from "@/components/event-map"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { createClient } from "@/lib/supabase/client"

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

interface UserInfo {
  profileImageUrl?: string | null
  fullName?: string
  initials?: string
}

interface EventsNearYouProps {
  fallbackEvents: Event[]
}

export function EventsNearYou({ fallbackEvents }: EventsNearYouProps) {
  const [events, setEvents] = useState<Event[]>(fallbackEvents)
  const [loading, setLoading] = useState(false)
  const [userLocation, setUserLocation] = useState<{ lat: number; lon: number } | null>(null)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [userInfo, setUserInfo] = useState<UserInfo | null>(null)
  const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
  const [noNearbyEvents, setNoNearbyEvents] = useState(false)
  const [userLocationName, setUserLocationName] = useState<string | null>(null)

  // Fetch user profile info
  useEffect(() => {
    async function fetchUserProfile() {
      const supabase = createClient()
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("full_name, profile_image_url, profile_photo_url")
          .eq("id", user.id)
          .single()
        
        if (profile) {
          const fullName = profile.full_name || ""
          const initials = fullName
            .split(" ")
            .map((n: string) => n[0])
            .join("")
            .toUpperCase()
            .slice(0, 2)
          
          setUserInfo({
            profileImageUrl: profile.profile_image_url || profile.profile_photo_url,
            fullName,
            initials
          })
        }
      }
    }
    
    fetchUserProfile()
  }, [])

  useEffect(() => {
    // Request user's location
    if ("geolocation" in navigator) {
      setLoading(true)
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const { latitude, longitude } = position.coords
          setUserLocation({ lat: latitude, lon: longitude })

          // Get user's location name (city, state)
          try {
            const geoResponse = await fetch(
              `/api/location/reverse-geocode?lat=${latitude}&lng=${longitude}`
            )
            if (geoResponse.ok) {
              const geoData = await geoResponse.json()
              if (geoData.city && geoData.state) {
                setUserLocationName(`${geoData.city}, ${geoData.state}`)
              } else if (geoData.state) {
                setUserLocationName(geoData.state)
              }
            }
          } catch (error) {
            console.error("Error getting location name:", error)
          }

          // Fetch events near user's location
          try {
            const response = await fetch(
              `/api/events/nearby?lat=${latitude}&lon=${longitude}&limit=6&radius=50`
            )
            if (response.ok) {
              const data = await response.json()
              if (data.events && data.events.length > 0) {
                setEvents(data.events)
                setNoNearbyEvents(false)
              } else {
                // No events found within radius
                setEvents([])
                setNoNearbyEvents(true)
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
        {noNearbyEvents ? (
          <>
            <p className="text-muted-foreground mb-2">
              No events found within 50 miles of your location
              {userLocationName && <span className="block text-sm">({userLocationName})</span>}
            </p>
            <p className="text-sm text-muted-foreground mb-4">
              Try browsing all events or check back later for new events in your area.
            </p>
          </>
        ) : (
          <p className="text-muted-foreground">No events found near your location</p>
        )}
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
          Showing events near {userLocationName || "your location"}
        </p>
      )}
      {locationError && (
        <p className="text-sm text-muted-foreground mb-6 text-center">
          Showing popular events (location access denied)
        </p>
      )}

      <Tabs defaultValue="grid" className="w-full">
        <TabsList className="mb-6">
          <TabsTrigger value="grid">Grid View</TabsTrigger>
          <TabsTrigger value="map">
            <Map className="h-4 w-4 mr-2" />
            Map View
          </TabsTrigger>
        </TabsList>

        <TabsContent value="grid">
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
        </TabsContent>

        <TabsContent value="map">
          <div className="mb-6">
            <EventMap
              events={events.map((e) => ({
                id: e.id,
                title: e.title,
                latitude: e.latitude || 0,
                longitude: e.longitude || 0,
                location_name: e.location_city,
                location_address: `${e.location_city}, ${e.location_state}`,
                location_city: e.location_city,
                location_state: e.location_state,
                start_date: e.start_date,
                image_url: e.image_url || undefined,
              }))}
              center={userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : undefined}
              zoom={10}
              height="500px"
              userLocation={userLocation ? { lat: userLocation.lat, lng: userLocation.lon } : null}
              userInfo={userInfo}
              selectedEventId={selectedEventId}
              onEventSelect={(eventId) => setSelectedEventId(eventId || null)}
            />
          </div>
          <div className="grid gap-4 md:grid-cols-2">
            {events
              .slice(0, 6)
              .map((event) => {
              return (
              <Card 
                key={event.id} 
                className={`hover:shadow-lg transition-all cursor-pointer ${
                  selectedEventId === event.id 
                    ? 'ring-2 ring-primary shadow-lg bg-primary/5' 
                    : ''
                }`}
                onClick={() => {
                  setSelectedEventId(selectedEventId === event.id ? null : event.id)
                }}
              >
                <CardContent className="p-4">
                  <div className="flex gap-4">
                    <div className={`w-20 h-20 bg-muted rounded-full overflow-hidden flex-shrink-0 border-2 ${
                      selectedEventId === event.id ? 'border-primary ring-2 ring-primary/30' : 'border-gray-200'
                    }`}>
                      {event.image_url ? (
                        <img
                          src={event.image_url}
                          alt={event.title}
                          className="w-full h-full object-cover"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-primary/80 to-primary flex items-center justify-center">
                          <span className="text-white font-bold text-xl">
                            {event.title.charAt(0).toUpperCase()}
                          </span>
                        </div>
                      )}
                    </div>
                    <div className="flex-1 min-w-0">
                      <h3 className="font-semibold text-sm mb-2 line-clamp-1">{event.title}</h3>
                      <div className="space-y-1 text-xs text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="h-3 w-3" />
                          <span>
                            {new Date(event.start_date).toLocaleDateString("en-US", {
                              month: "short",
                              day: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="h-3 w-3" />
                          <span className="line-clamp-1">
                            {event.location_city}, {event.location_state}
                          </span>
                        </div>
                      </div>
                      <Button 
                        size="sm" 
                        className="mt-2 w-full" 
                        asChild
                        onClick={(e) => e.stopPropagation()}
                      >
                        <Link href={`/events/${event.id}`}>View</Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )})}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}
