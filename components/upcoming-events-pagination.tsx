"use client"

import { useState } from "react"
import Link from "next/link"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Calendar, MapPin, ChevronLeft, ChevronRight } from "lucide-react"

const ITEMS_PER_PAGE = 6

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  location_city: string
  location_state: string
  image_url?: string | null
}

interface UpcomingEventsPaginationProps {
  events: Event[]
}

export function UpcomingEventsPagination({ events }: UpcomingEventsPaginationProps) {
  const [currentPage, setCurrentPage] = useState(1)

  const totalPages = Math.ceil(events.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedEvents = events.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <div className="space-y-6">
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {paginatedEvents.map((event) => (
          <Card key={event.id} className="hover:shadow-lg transition-shadow">
            <CardHeader>
              {event.image_url && (
                <div className="w-full h-48 bg-muted rounded-md mb-4 overflow-hidden">
                  <img
                    src={event.image_url}
                    alt={event.title}
                    className="w-full h-full object-cover"
                  />
                </div>
              )}
              <CardTitle className="text-xl">{event.title}</CardTitle>
              <CardDescription className="line-clamp-2">{event.description}</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  {new Date(event.start_date).toLocaleDateString()}
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  {event.location_city}, {event.location_state}
                </div>
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

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-8">
          <Button
            variant="outline"
            size="sm"
            onClick={handlePreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4 mr-1" />
            Previous
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber
              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="sm"
                  onClick={() => setCurrentPage(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="sm"
            onClick={handleNextPage}
            disabled={currentPage === totalPages}
          >
            Next
            <ChevronRight className="h-4 w-4 ml-1" />
          </Button>
        </div>
      )}

      {/* Page Info */}
      <div className="text-center text-sm text-muted-foreground">
        Showing {startIndex + 1} to {Math.min(endIndex, events.length)} of {events.length} events
      </div>
    </div>
  )
}
