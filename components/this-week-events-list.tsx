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
import Link from "next/link"
import Image from "next/image"
import { 
  Calendar, 
  MapPin, 
  Users, 
  Search, 
  SlidersHorizontal,
  Loader2,
  Clock
} from "lucide-react"
import { LocationFilter } from "@/components/location-filter"

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
  price: number
  image_url?: string
  status: string
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
  startOfWeek: string
  endOfWeek: string
}

export function ThisWeekEventsList({ 
  initialEvents, 
  totalCount, 
  categories,
  startOfWeek,
  endOfWeek 
}: Props) {
  const [events, setEvents] = useState<Event[]>(initialEvents)
  const [loading, setLoading] = useState(false)
  const [hasMore, setHasMore] = useState(initialEvents.length < totalCount)
  const [page, setPage] = useState(1)
  const [filters, setFilters] = useState({
    search: "",
    category: "all",
    sortBy: "date_asc",
    priceFilter: "all",
    country: "",
    state: "",
    city: ""
  })
  const [showFilters, setShowFilters] = useState(false)
  
  const observerTarget = useRef<HTMLDivElement>(null)
  const supabase = createBrowserClient()

  // Load more events (lazy loading)
  const loadMoreEvents = useCallback(async () => {
    if (loading || !hasMore) return
    
    setLoading(true)
    const nextPage = page + 1
    const offset = page * 12

    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .in("status", ["upcoming", "ongoing"])
      .gte("start_date", startOfWeek)
      .lte("start_date", endOfWeek)

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_city.ilike.%${filters.search}%`)
    }
    if (filters.category !== "all") {
      query = query.eq("category_id", filters.category)
    }
    if (filters.priceFilter === "free") {
      query = query.eq("price", 0)
    } else if (filters.priceFilter === "paid") {
      query = query.gt("price", 0)
    }
    if (filters.country) {
      query = query.eq("country_id", filters.country)
    }
    if (filters.state) {
      query = query.eq("state_id", filters.state)
    }
    if (filters.city) {
      query = query.eq("city_id", filters.city)
    }

    // Apply sorting
    if (filters.sortBy === "date_asc") {
      query = query.order("start_date", { ascending: true })
    } else if (filters.sortBy === "date_desc") {
      query = query.order("start_date", { ascending: false })
    } else if (filters.sortBy === "price_asc") {
      query = query.order("price", { ascending: true })
    } else if (filters.sortBy === "price_desc") {
      query = query.order("price", { ascending: false })
    }

    const { data, count } = await query
      .range(offset, offset + 11)

    if (data) {
      setEvents(prev => [...prev, ...data])
      setPage(nextPage)
      setHasMore((offset + 12) < (count || 0))
    }
    
    setLoading(false)
  }, [loading, hasMore, page, filters, supabase, startOfWeek, endOfWeek])

  // Refetch events when filters change
  const refetchEvents = useCallback(async () => {
    setLoading(true)
    
    let query = supabase
      .from("events")
      .select("*", { count: "exact" })
      .in("status", ["upcoming", "ongoing"])
      .gte("start_date", startOfWeek)
      .lte("start_date", endOfWeek)

    // Apply filters
    if (filters.search) {
      query = query.or(`title.ilike.%${filters.search}%,description.ilike.%${filters.search}%,location_city.ilike.%${filters.search}%`)
    }
    if (filters.category !== "all") {
      query = query.eq("category_id", filters.category)
    }
    if (filters.priceFilter === "free") {
      query = query.eq("price", 0)
    } else if (filters.priceFilter === "paid") {
      query = query.gt("price", 0)
    }
    if (filters.country) {
      query = query.eq("country_id", filters.country)
    }
    if (filters.state) {
      query = query.eq("state_id", filters.state)
    }
    if (filters.city) {
      query = query.eq("city_id", filters.city)
    }

    // Apply sorting
    if (filters.sortBy === "date_asc") {
      query = query.order("start_date", { ascending: true })
    } else if (filters.sortBy === "date_desc") {
      query = query.order("start_date", { ascending: false })
    } else if (filters.sortBy === "price_asc") {
      query = query.order("price", { ascending: true })
    } else if (filters.sortBy === "price_desc") {
      query = query.order("price", { ascending: false })
    }

    const { data, count } = await query
      .limit(12)

    if (data) {
      setEvents(data)
      setPage(1)
      setHasMore(12 < (count || 0))
    }
    
    setLoading(false)
  }, [filters, supabase, startOfWeek, endOfWeek])

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
      weekday: "short",
      month: "short",
      day: "numeric",
      hour: "numeric",
      minute: "2-digit"
    })
  }

  const formatPrice = (price: number) => {
    return price === 0 ? "Free" : `$${price.toFixed(2)}`
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
              placeholder="Search events by title, description, or city..."
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
          <div className="space-y-4 pt-4 border-t">
            {/* Location Filters */}
            <div>
              <label className="text-sm font-medium mb-2 block">Location</label>
              <LocationFilter
                selectedCountry={filters.country}
                selectedState={filters.state}
                selectedCity={filters.city}
                onCountryChange={(value) => setFilters(prev => ({ ...prev, country: value, state: "", city: "" }))}
                onStateChange={(value) => setFilters(prev => ({ ...prev, state: value, city: "" }))}
                onCityChange={(value) => setFilters(prev => ({ ...prev, city: value }))}
              />
            </div>

            {/* Other Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
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

              {/* Price Filter */}
              <div className="space-y-2">
                <label className="text-sm font-medium">Price</label>
                <Select
                  value={filters.priceFilter}
                  onValueChange={(value) => setFilters(prev => ({ ...prev, priceFilter: value }))}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="All Prices" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Prices</SelectItem>
                    <SelectItem value="free">Free Only</SelectItem>
                    <SelectItem value="paid">Paid Only</SelectItem>
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
                    <SelectItem value="date_asc">Date: Earliest First</SelectItem>
                    <SelectItem value="date_desc">Date: Latest First</SelectItem>
                    <SelectItem value="price_asc">Price: Low to High</SelectItem>
                    <SelectItem value="price_desc">Price: High to Low</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between">
        <p className="text-muted-foreground">
          Showing {events.length} of {totalCount} events this week
        </p>
      </div>

      {/* Events Grid */}
      {events.length === 0 ? (
        <div className="text-center py-16">
          <Clock className="w-16 h-16 mx-auto text-muted-foreground mb-4" />
          <h3 className="text-2xl font-semibold mb-2">No Events Found</h3>
          <p className="text-muted-foreground">
            Try adjusting your filters or check back later for new events.
          </p>
        </div>
      ) : (
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
                    <div className="w-full h-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <Calendar className="w-16 h-16 text-primary/40" />
                    </div>
                  )}
                  <div className="absolute top-3 right-3">
                    <Badge 
                      variant={event.price === 0 ? "secondary" : "default"}
                      className="font-semibold"
                    >
                      {formatPrice(event.price)}
                    </Badge>
                  </div>
                </div>
                <CardContent className="p-4 space-y-3">
                  <h3 className="font-semibold text-lg line-clamp-2 group-hover:text-primary transition-colors">
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
                    {event.max_attendees && (
                      <div className="flex items-center gap-2">
                        <Users className="w-4 h-4 flex-shrink-0" />
                        <span>Max {event.max_attendees} attendees</span>
                      </div>
                    )}
                  </div>
                  <Button className="w-full mt-4" size="sm">
                    View Details & Get Tickets
                  </Button>
                </CardContent>
              </Card>
            </Link>
          ))}
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
          <p>You've seen all events for this week!</p>
        </div>
      )}
    </div>
  )
}
