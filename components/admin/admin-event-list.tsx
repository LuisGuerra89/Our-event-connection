"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter } from "next/navigation"
import { Pencil, Trash2, Eye } from "lucide-react"
import Link from "next/link"

type Event = {
  id: string
  title: string
  start_date: string
  location_city: string
  location_state: string
  capacity: number
  current_attendees: number
  status: string
  price: number
  profiles: {
    full_name: string
    email: string
  }
}

export function AdminEventList({ events }: { events: Event[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleDelete = async (eventId: string) => {
    if (!confirm("Are you sure you want to delete this event?")) return

    setDeleting(eventId)
    try {
      const { error } = await supabase.from("events").delete().eq("id", eventId)

      if (error) throw error

      router.refresh()
    } catch (error) {
      console.error("Error deleting event:", error)
      alert("Failed to delete event")
    } finally {
      setDeleting(null)
    }
  }

  const getStatusBadgeVariant = (status: string) => {
    switch (status) {
      case "published":
        return "default"
      case "draft":
        return "secondary"
      case "cancelled":
        return "destructive"
      default:
        return "secondary"
    }
  }

  return (
    <div className="border rounded-lg">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Event</TableHead>
            <TableHead>Date</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Capacity</TableHead>
            <TableHead>Price</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Organizer</TableHead>
            <TableHead>Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {events.map((event) => (
            <TableRow key={event.id}>
              <TableCell className="font-medium">{event.title}</TableCell>
              <TableCell>{new Date(event.start_date).toLocaleDateString()}</TableCell>
              <TableCell>
                {event.location_city}, {event.location_state}
              </TableCell>
              <TableCell>
                {event.current_attendees} / {event.capacity}
              </TableCell>
              <TableCell>${event.price}</TableCell>
              <TableCell>
                <Badge variant={getStatusBadgeVariant(event.status)}>{event.status}</Badge>
              </TableCell>
              <TableCell>{event.profiles.full_name}</TableCell>
              <TableCell>
                <div className="flex items-center gap-2">
                  <Link href={`/events/${event.id}`}>
                    <Button variant="ghost" size="icon">
                      <Eye className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Link href={`/admin/events/${event.id}/edit`}>
                    <Button variant="ghost" size="icon">
                      <Pencil className="h-4 w-4" />
                    </Button>
                  </Link>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleDelete(event.id)}
                    disabled={deleting === event.id}
                  >
                    <Trash2 className="h-4 w-4" />
                  </Button>
                </div>
              </TableCell>
            </TableRow>
          ))}
        </TableBody>
      </Table>

      {events.length === 0 && <div className="text-center py-12 text-muted-foreground">No events found</div>}
    </div>
  )
}
