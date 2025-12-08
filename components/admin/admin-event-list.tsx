"use client"

import { useState, useMemo, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { useRouter, useSearchParams } from "next/navigation"
import { Pencil, Trash2, Eye, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

type Event = {
  id: string
  title: string
  start_date: string
  end_date: string
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

type EventType = "upcoming" | "ongoing" | "past" | "all"

const ITEMS_PER_PAGE = 10

function getEventType(startDate: string, endDate: string): EventType {
  const now = new Date()
  const start = new Date(startDate)
  const end = new Date(endDate)

  if (start > now) {
    return "upcoming"
  } else if (end < now) {
    return "past"
  } else {
    return "ongoing"
  }
}

export function AdminEventList({ events }: { events: Event[] }) {
  const [deleting, setDeleting] = useState<string | null>(null)
  const [currentTab, setCurrentTab] = useState<EventType>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const router = useRouter()
  const searchParams = useSearchParams()
  const supabase = createBrowserClient()

  // Initialize tab from URL parameter
  useEffect(() => {
    const tabFromUrl = searchParams?.get("tab") as EventType | null
    if (tabFromUrl && ["upcoming", "ongoing", "past", "all"].includes(tabFromUrl)) {
      setCurrentTab(tabFromUrl)
      setCurrentPage(1)
    }
  }, [searchParams])

  // Filter events by type
  const filteredEvents = useMemo(() => {
    if (currentTab === "all") {
      return events
    }
    return events.filter((event) => getEventType(event.start_date, event.end_date) === currentTab)
  }, [events, currentTab])

  // Paginate events
  const paginatedEvents = useMemo(() => {
    const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
    const endIndex = startIndex + ITEMS_PER_PAGE
    return filteredEvents.slice(startIndex, endIndex)
  }, [filteredEvents, currentPage])

  const totalPages = Math.ceil(filteredEvents.length / ITEMS_PER_PAGE)

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

  const handleTabChange = (tab: EventType) => {
    setCurrentTab(tab)
    setCurrentPage(1) // Reset to first page when changing tabs
    // Update URL parameter
    const params = new URLSearchParams()
    params.set("tab", tab)
    router.push(`/admin/events?${params.toString()}`)
  }

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
  }

  const getStatusBadge = (eventType: EventType) => {
    return {
      label: eventType,
      color: getEventTypeColor(eventType)
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

  const getEventTypeColor = (eventType: EventType) => {
    switch (eventType) {
      case "upcoming":
        return "bg-blue-100 text-blue-800"
      case "ongoing":
        return "bg-green-100 text-green-800"
      case "past":
        return "bg-gray-100 text-gray-800"
      default:
        return ""
    }
  }

  const getEventCount = (type: EventType) => {
    if (type === "all") return events.length
    return events.filter((event) => getEventType(event.start_date, event.end_date) === type).length
  }

  return (
    <div className="space-y-4">
      {/* Tabs for filtering */}
      <Tabs value={currentTab} onValueChange={(value) => handleTabChange(value as EventType)} className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="all" className="text-xs md:text-sm">
            All Events ({getEventCount("all")})
          </TabsTrigger>
          <TabsTrigger value="upcoming" className="text-xs md:text-sm">
            Upcoming ({getEventCount("upcoming")})
          </TabsTrigger>
          <TabsTrigger value="ongoing" className="text-xs md:text-sm">
            Ongoing ({getEventCount("ongoing")})
          </TabsTrigger>
          <TabsTrigger value="past" className="text-xs md:text-sm">
            Past ({getEventCount("past")})
          </TabsTrigger>
        </TabsList>

        {/* Events Table */}
        <TabsContent value={currentTab} className="mt-6">
          <div className="border rounded-lg overflow-hidden">
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
                {paginatedEvents.map((event) => {
                  const eventType = getEventType(event.start_date, event.end_date)
                  const statusBadge = getStatusBadge(eventType)
                  return (
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
                        <Badge 
                          variant="outline"
                          className={statusBadge.color}
                        >
                          {statusBadge.label}
                        </Badge>
                      </TableCell>
                      <TableCell>{event.profiles.full_name}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Link href={`/events/${event.id}`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Eye className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Link href={`/admin/events/${event.id}/edit`}>
                            <Button variant="ghost" size="icon" className="h-8 w-8">
                              <Pencil className="h-4 w-4" />
                            </Button>
                          </Link>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8"
                            onClick={() => handleDelete(event.id)}
                            disabled={deleting === event.id}
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>

            {paginatedEvents.length === 0 && (
              <div className="text-center py-12 text-muted-foreground">No events found</div>
            )}
          </div>

          {/* Pagination Controls */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Page {currentPage} of {totalPages} ({filteredEvents.length} total events)
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePreviousPage}
                  disabled={currentPage === 1}
                  className="gap-1"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="gap-1"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
