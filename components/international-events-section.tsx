"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, Plane, ArrowRight, Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  start_date: string
  location_city: string
  location_state: string
  location_country: string
  price: number
  image_url?: string
  country_id?: string
}

interface Country {
  id: string
  name: string
  code: string
}

export function InternationalEventsSection() {
  const [events, setEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(true)
  const [page, setPage] = useState(1)
  const [usaCountryId, setUsaCountryId] = useState<string>("")
  
  const observerTarget = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  // Get USA country ID to exclude
  useEffect(() => {
    const getUsaId = async () => {
      const { data } = await supabase
        .from("countries")
        .select("id")
        .or("code.eq.US,name.ilike.%United States%")
        .single()
      
      if (data) {
        setUsaCountryId(data.id)
      }
    }
    getUsaId()
  }, [supabase])

  // Load initial events
  useEffect(() => {
    if (!usaCountryId) return
    loadEvents()
  }, [usaCountryId])

  const loadEvents = async () => {
    if (loading || !hasMore || !usaCountryId) return
    
    setLoading(true)
    const now = new Date().toISOString()
    const offset = (page - 1) * 6

    const { data, count } = await supabase
      .from("events")
      .select("*", { count: "exact" })
      .in("status", ["upcoming", "ongoing"])
      .gte("start_date", now)
      .neq("country_id", usaCountryId) // Exclude USA events
      .order("start_date", { ascending: true })
      .range(offset, offset + 5)

    if (data) {
      setEvents(prev => page === 1 ? data : [...prev, ...data])
      setHasMore((offset + 6) < (count || 0))
    }
    
    setLoading(false)
  }

  // Intersection Observer for lazy loading
  const handleObserver = useCallback((entries: IntersectionObserverEntry[]) => {
    const target = entries[0]
    if (target.isIntersecting && hasMore && !loading) {
      setPage(prev => prev + 1)
    }
  }, [hasMore, loading])

  useEffect(() => {
    const observer = new IntersectionObserver(handleObserver, {
      threshold: 0.5
    })

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [handleObserver])

  // Load more when page changes
  useEffect(() => {
    if (page > 1) {
      loadEvents()
    }
  }, [page])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric"
    })
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`
  }

  if (!usaCountryId) return null

  return (
    <section className="py-16">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8">
          <div>
            <h2 className="text-3xl font-bold mb-2 flex items-center gap-2">
              <Plane className="w-8 h-8 text-primary" />
              International Events
            </h2>
            <p className="text-muted-foreground">
              Discover events from around the world
            </p>
          </div>
        </div>

        {loading && events.length === 0 ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
          </div>
        ) : events.length === 0 ? (
          <div className="text-center py-16">
            <Plane className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg">
              No international events available at the moment.
            </p>
            <Button variant="outline" className="mt-4" asChild>
              <Link href="/events">View All Events</Link>
            </Button>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {events.map((event) => (
                <Link key={event.id} href={`/events/${event.id}`}>
                  <Card className="h-full hover:shadow-lg transition-shadow cursor-pointer group">
                    <div className="relative h-48 overflow-hidden rounded-t-lg">
                      {event.image_url ? (
                        <Image
                          src={event.image_url}
                          alt={event.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform duration-300"
                        />
                      ) : (
                        <div className="w-full h-full bg-gradient-to-br from-blue-500/20 to-purple-500/20 flex items-center justify-center">
                          <Plane className="w-16 h-16 text-primary/40" />
                        </div>
                      )}
                      <div className="absolute top-3 left-3">
                        <Badge variant="secondary" className="bg-blue-600 text-white">
                          <Plane className="w-3 h-3 mr-1" />
                          International
                        </Badge>
                      </div>
                      <div className="absolute top-3 right-3">
                        <Badge variant={event.price === 0 ? "secondary" : "default"}>
                          {formatPrice(event.price)}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-4 space-y-3">
                      <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
                        {event.title}
                      </h3>
                      <div className="space-y-2 text-sm text-muted-foreground">
                        <div className="flex items-center gap-2">
                          <Calendar className="w-4 h-4 flex-shrink-0" />
                          <span>{formatDate(event.start_date)}</span>
                        </div>
                        <div className="flex items-center gap-2">
                          <MapPin className="w-4 h-4 flex-shrink-0" />
                          <span className="line-clamp-1">
                            {event.location_city}, {event.location_country}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Lazy Loading Trigger */}
            {hasMore && (
              <div ref={observerTarget} className="flex justify-center py-8">
                {loading && (
                  <div className="flex items-center gap-2 text-muted-foreground">
                    <Loader2 className="w-5 h-5 animate-spin" />
                    <span>Loading more events...</span>
                  </div>
                )}
              </div>
            )}

            {/* View All Button */}
            {!hasMore && events.length > 0 && (
              <div className="flex justify-center mt-8">
                <Button asChild size="lg" variant="outline">
                  <Link href="/events?international=true">
                    View All International Events
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </section>
  )
}
