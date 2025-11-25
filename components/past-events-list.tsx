"use client"

import { useState, useEffect, useRef, useCallback } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  SlidersHorizontal,
  Loader2,
  ImageIcon,
  Video,
  Eye
} from "lucide-react"

interface Event {
  id: string
  title: string
  description: string
  start_date: string
  end_date: string
  location_name: string
  location_city: string
  location_state: string
  location_country: string
  category: string
  max_attendees: number
  current_attendees: number
  price: number
  image_url?: string
  status: string
  event_type?: string
  gallery_photos?: string[]
  gallery_videos?: string[]
}

interface Category {
  id: string
  name: string
  slug: string
}

interface Props {
  initialEvents: Event[]
  totalCount: number
  categories: Category[]
}

export function PastEventsList({ 
  initialEvents, 
  totalCount, 
  categories 
}: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialEvents.length < totalCount)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sortBy: "date_desc",
    year: "all"
  })
  const [showFilters, setShowFilters] = useState(false)
  const [selectedGallery, setSelectedGallery] = useState<Event | null>(null)
  
  const observerTarget = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  // Get unique years from events for filter
  const availableYears = Array.from(
    new Set(
      initialEvents.map(e => new Date(e.start_date).getFullYear())
    )
  ).sort((a, b) => b - a)

  // Load more events (lazy loading)
  const loadMoreEvents = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextPage = page + 1
    const offset = page * 12
    const now = new Date().toISOString()

    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .lt("end_date", now)

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_city.ilike.%${filters.search}%`)
    }
    if (filters.category !== "all") {
      query = query.eq("category_id", filters.category)
    }
    if (filters.year !== "all") {
      const yearStart = new Date(`${filters.year}-01-01`).toISOString()
      const yearEnd = new Date(`${filters.year}-12-31T23:59:59`).toISOString()
      query = query.gte("start_date", yearStart).lte("start_date", yearEnd)
    }

    // Apply sorting
    if (filters.sortBy === "date_desc") {
      query = query.order("start_date", { ascending: false })
    } else if (filters.sortBy === "date_asc") {
      query = query.order("start_date", { ascending: true })
    } else if (filters.sortBy === "attendees_desc") {
      query = query.order("current_attendees", { ascending: false })
    }

    const { data, count } = await query.range(offset, offset + 11)

    if (data) {
      setEvents(prev => [...prev, ...data])
      setPage(nextPage)
      setHasMore((offset + 12) < (count || 0))
    }
    
    setLoading(false)
  }, [loading, hasMore, page, filters, supabase])

  // Refetch events when filters change
  const refetchEvents = useCallback(async () => {
    setLoading(true)
    const now = new Date().toISOString()
    
    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .lt("end_date", now)

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_city.ilike.%${filters.search}%`)
    }
    if (filters.category !== "all") {
      query = query.eq("category_id", filters.category)
    }
    if (filters.year !== "all") {
      const yearStart = new Date(`${filters.year}-01-01`).toISOString()
      const yearEnd = new Date(`${filters.year}-12-31T23:59:59`).toISOString()
      query = query.gte("start_date", yearStart).lte("start_date", yearEnd)
    }

    // Apply sorting
    if (filters.sortBy === "date_desc") {
      query = query.order("start_date", { ascending: false })
    } else if (filters.sortBy === "date_asc") {
      query = query.order("start_date", { ascending: true })
    } else if (filters.sortBy === "attendees_desc") {
      query = query.order("current_attendees", { ascending: false })
    }

    const { data, count } = await query.limit(12)

    if (data) {
      setEvents(data)
      setPage(1)
      setHasMore(12 < (count || 0))
    }
    
    setLoading(false)
  }, [filters, supabase])

  // Intersection Observer for infinite scroll
  useEffect(() => {
    const observer = new IntersectionObserver(
      entries => {
        if (entries[0].isIntersecting && hasMore && !loading) {
          loadMoreEvents()
        }
      },
      { threshold: 0.5 }
    )

    const currentTarget = observerTarget.current
    if (currentTarget) {
      observer.observe(currentTarget)
    }

    return () => {
      if (currentTarget) {
        observer.unobserve(currentTarget)
      }
    }
  }, [hasMore, loading, loadMoreEvents])

  // Refetch when filters change
  useEffect(() => {
    refetchEvents()
  }, [filters])

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric"
    })
  }

  return (
    <div className="space-y-8">
      {/* Filters Bar */}
      <div className="bg-card border rounded-lg p-4 space-y-4">
        <div className="flex flex-col md:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground w-4 h-4" />
            <Input
              placeholder="Search past events..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="pl-10"
            />
          </div>
          
          {/* Toggle Filters Button */}
          <Button
            variant="outline"
            onClick={() => setShowFilters(!showFilters)}
            className="md:w-auto"
          >
            <SlidersHorizontal className="w-4 h-4 mr-2" />
            Filters
          </Button>
        </div>

        {/* Advanced Filters */}
        {showFilters && (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 pt-4 border-t">
            {/* Category Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Category</label>
              <Select
                value={filters.category || "all"}
                onValueChange={(value) => setFilters(prev => ({ ...prev, category: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Categories" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  {categories.map((cat) => (
                    <SelectItem key={cat.id} value={cat.slug}>
                      {cat.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Year Filter */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Year</label>
              <Select
                value={filters.year}
                onValueChange={(value) => setFilters(prev => ({ ...prev, year: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="All Years" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Years</SelectItem>
                  {availableYears.map((year) => (
                    <SelectItem key={year} value={year.toString()}>
                      {year}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Sort By */}
            <div className="space-y-2">
              <label className="text-sm font-medium">Sort By</label>
              <Select
                value={filters.sortBy}
                onValueChange={(value) => setFilters(prev => ({ ...prev, sortBy: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Sort by..." />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="date_desc">Date: Newest First</SelectItem>
                  <SelectItem value="date_asc">Date: Oldest First</SelectItem>
                  <SelectItem value="attendees_desc">Most Popular</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {events.length} of {totalCount} past events
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <Calendar className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Past Events Found</h3>
          <p className="text-muted-foreground mb-6">
            Try adjusting your filters or check out our upcoming events.
          </p>
          <Button asChild>
            <Link href="/events">View Upcoming Events</Link>
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {events.map((event) => {
            const hasGallery = (event.gallery_photos && event.gallery_photos.length > 0) || 
                             (event.gallery_videos && event.gallery_videos.length > 0)
            
            return (
              <Card key={event.id} className="h-full hover:shadow-lg transition-shadow">
                <div className="relative h-48 overflow-hidden rounded-t-lg">
                  {event.image_url ? (
                    <Image
                      src={event.image_url}
                      alt={event.title}
                      fill
                      className="object-cover grayscale hover:grayscale-0 transition-all duration-300"
                    />
                  ) : (
                    <div className="w-full h-full bg-gradient-to-br from-muted to-muted/50 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-muted-foreground/40" />
                    </div>
                  )}
                  <div className="absolute top-3 left-3">
                    <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                      Completed
                    </Badge>
                  </div>
                  {hasGallery && (
                    <div className="absolute top-3 right-3 flex gap-2">
                      {event.gallery_photos && event.gallery_photos.length > 0 && (
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          <ImageIcon className="w-3 h-3 mr-1" />
                          {event.gallery_photos.length}
                        </Badge>
                      )}
                      {event.gallery_videos && event.gallery_videos.length > 0 && (
                        <Badge variant="secondary" className="bg-background/80 backdrop-blur-sm">
                          <Video className="w-3 h-3 mr-1" />
                          {event.gallery_videos.length}
                        </Badge>
                      )}
                    </div>
                  )}
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-2">
                    {event.title}
                  </h3>
                  <div className="space-y-2 text-sm text-muted-foreground">
                    <div className="flex items-start gap-2">
                      <Calendar className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">{formatDate(event.start_date)}</span>
                    </div>
                    <div className="flex items-start gap-2">
                      <MapPin className="w-4 h-4 mt-0.5 flex-shrink-0" />
                      <span className="line-clamp-1">
                        {event.location_city}, {event.location_state}
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Users className="w-4 h-4 flex-shrink-0" />
                      <span>{event.current_attendees || 0} attended</span>
                    </div>
                  </div>
                  <div className="flex gap-2 mt-4">
                    <Button variant="outline" className="flex-1" size="sm" asChild>
                      <Link href={`/events/${event.id}`}>
                        <Eye className="w-4 h-4 mr-1" />
                        View Details
                      </Link>
                    </Button>
                    {hasGallery && (
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button 
                            variant="default" 
                            size="sm" 
                            className="flex-1"
                            onClick={() => setSelectedGallery(event)}
                          >
                            <ImageIcon className="w-4 h-4 mr-1" />
                            Gallery
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto">
                          <DialogHeader>
                            <DialogTitle>{event.title} - Gallery</DialogTitle>
                          </DialogHeader>
                          <div className="space-y-6">
                            {/* Photos */}
                            {event.gallery_photos && event.gallery_photos.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <ImageIcon className="w-5 h-5" />
                                  Photos ({event.gallery_photos.length})
                                </h3>
                                <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                                  {event.gallery_photos.map((photo, idx) => (
                                    <div key={idx} className="relative aspect-square rounded-lg overflow-hidden">
                                      <Image
                                        src={photo}
                                        alt={`${event.title} photo ${idx + 1}`}
                                        fill
                                        className="object-cover hover:scale-110 transition-transform duration-300"
                                      />
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                            
                            {/* Videos */}
                            {event.gallery_videos && event.gallery_videos.length > 0 && (
                              <div>
                                <h3 className="font-semibold mb-3 flex items-center gap-2">
                                  <Video className="w-5 h-5" />
                                  Videos ({event.gallery_videos.length})
                                </h3>
                                <div className="space-y-3">
                                  {event.gallery_videos.map((video, idx) => (
                                    <div key={idx} className="relative aspect-video rounded-lg overflow-hidden bg-black">
                                      <video
                                        src={video}
                                        controls
                                        className="w-full h-full"
                                      >
                                        Your browser does not support the video tag.
                                      </video>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </DialogContent>
                      </Dialog>
                    )}
                  </div>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}

      {/* Lazy Loading Trigger & Loader */}
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

      {/* No More Events */}
      {!hasMore && events.length > 0 && (
        <div className="text-center py-8 text-muted-foreground">
          <p>You've seen all past events!</p>
        </div>
      )}
    </div>
  )
}
