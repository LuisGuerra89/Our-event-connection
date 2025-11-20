"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Calendar, MapPin, Users } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface Event {
  id: string
  title: string
  description: string | null
  event_type: string | null
  location_name: string
  location_city: string
  location_state: string
  start_date: string
  end_date: string
  capacity: number | null
  current_attendees: number
  price: number
  image_url: string | null
}

interface EventListProps {
  events: Event[]
  userId: string
}

export function EventList({ events }: EventListProps) {
  if (events.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No events available at the moment.</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {events.map((event) => (
        <Card key={event.id} className="overflow-hidden hover:shadow-lg transition-shadow">
          <div className="aspect-video bg-muted relative">
            {event.image_url ? (
              <img
                src={event.image_url || "/placeholder.svg"}
                alt={event.title}
                className="object-cover w-full h-full"
              />
            ) : (
              <div className="flex items-center justify-center h-full">
                <Calendar className="h-12 w-12 text-muted-foreground" />
              </div>
            )}
            {event.event_type && (
              <Badge className="absolute top-2 right-2 capitalize">{event.event_type.replace("_", " ")}</Badge>
            )}
          </div>

          <CardHeader>
            <CardTitle className="line-clamp-1">{event.title}</CardTitle>
            <CardDescription className="line-clamp-2">
              {event.description || "No description available"}
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-3">
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Calendar className="h-4 w-4" />
              <span>{format(new Date(event.start_date), "PPP")}</span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <MapPin className="h-4 w-4" />
              <span>
                {event.location_city}, {event.location_state}
              </span>
            </div>

            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Users className="h-4 w-4" />
              <span>
                {event.current_attendees}
                {event.capacity && ` / ${event.capacity}`} attending
              </span>
            </div>

            <div className="flex items-center justify-between pt-2">
              <span className="text-lg font-bold">{event.price > 0 ? `$${event.price}` : "Free"}</span>
              <Button asChild>
                <Link href={`/events/${event.id}`}>View Details</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
