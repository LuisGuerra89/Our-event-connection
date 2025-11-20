"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Plane } from "lucide-react"
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
}

interface InternationalEventsProps {
  events: Event[]
}

export function InternationalEvents({ events }: InternationalEventsProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <Plane className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
        <p className="text-muted-foreground">No international events available at the moment</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            {event.image_url && (
              <div className="relative w-full h-48 bg-muted rounded-md mb-4 overflow-hidden">
                <img
                  src={event.image_url}
                  alt={event.title}
                  className="w-full h-full object-cover hover:scale-105 transition-transform"
                />
                <Badge className="absolute top-3 right-3 bg-primary/90 backdrop-blur">
                  <Plane className="h-3 w-3 mr-1" />
                  International
                </Badge>
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
                  {event.location_city}, {event.location_state}, {event.location_country}
                </span>
              </div>
              {event.entry_fee > 0 && (
                <div className="flex items-center gap-2 font-semibold text-primary">
                  From ${event.entry_fee}
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
  )
}
