"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import Link from "next/link"
import Image from "next/image"
import { Calendar, MapPin, ArrowRight, Loader2 } from "lucide-react"

interface Event {
  id: string
  title: string
  start_date: string
  location_city: string
  location_state: string
  price: number
  image_url?: string
  city_id?: string
  state_id?: string
  country_id?: string
}

interface Country {
  id: string
  name: string
  code: string
}

interface State {
  id: string
  name: string
  code: string
  country_id: string
}

interface City {
  id: string
  name: string
  state_id: string
}

export function DomesticEventsSection() {
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [events, setEvents] = useState<Event[]>([])
  const [allEvents, setAllEvents] = useState<Event[]>([])
  const [loading, setLoading] = useState(false)
  const [detectingLocation, setDetectingLocation] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)

  const [selectedCountry, setSelectedCountry] = useState<string>("")
  const [selectedState, setSelectedState] = useState<string>("")
  const [selectedCity, setSelectedCity] = useState<string>("")
  const [userDetectedState, setUserDetectedState] = useState<string | null>(null)

  const supabase = createBrowserClient()

  // Auto-detect user's location on mount
  useEffect(() => {
    const detectUserLocation = async () => {
      if ("geolocation" in navigator) {
        navigator.geolocation.getCurrentPosition(
          async (position) => {
            try {
              const response = await fetch(
                `/api/location/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
              )
              if (response.ok) {
                const data = await response.json()
                if (data.stateId) {
                  setUserDetectedState(data.state)
                  // Will be set after states are loaded
                  setSelectedState(data.stateId)
                }
                if (data.cityId) {
                  setSelectedCity(data.cityId)
                }
                if (data.countryId) {
                  setSelectedCountry(data.countryId)
                }
              }
            } catch (error) {
              console.error("Error detecting location:", error)
            } finally {
              setDetectingLocation(false)
            }
          },
          () => {
            // Location denied, continue without auto-detection
            setDetectingLocation(false)
          },
          { timeout: 5000 }
        )
      } else {
        setDetectingLocation(false)
      }
    }
    detectUserLocation()
  }, [])

  // Load countries on mount (USA and others)
  useEffect(() => {
    const loadCountries = async () => {
      const { data, error } = await supabase
        .from("countries")
        .select("*")
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error loading countries:", error)
        return
      }

      if (data) {
        setCountries(data)
        // Don't set default country here - wait for location detection
        // The location detection useEffect will set the country
      }
    }
    loadCountries()
  }, [supabase])

  // Set default country to USA only after location detection completes or fails
  useEffect(() => {
    if (!detectingLocation && !selectedCountry && countries.length > 0) {
      // Location detection is done, but no country was set
      // Default to USA
      const usa = countries.find(c => c.code === "US" || c.name === "United States" || c.name.toLowerCase().includes("united states"))
      if (usa) {
        setSelectedCountry(usa.id)
      } else if (countries.length > 0) {
        // Fallback to first country if USA not found
        setSelectedCountry(countries[0].id)
      }
    }
  }, [detectingLocation, selectedCountry, countries])

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([])
      return
    }

    const loadStates = async () => {
      const { data, error } = await supabase
        .from("states")
        .select("*")
        .eq("country_id", selectedCountry)
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error loading states:", error)
        return
      }

      if (data) {
        setStates(data)
        // Only reset state/city if they weren't set by location detection
        // Check if the current selectedState is valid for this country
        const isStateValid = data.some(s => s.id === selectedState)
        if (!isStateValid) {
          setSelectedState("")
          setSelectedCity("")
        }
      }
    }
    loadStates()
  }, [selectedCountry, supabase])

  // Load cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([])
      return
    }

    const loadCities = async () => {
      const { data, error } = await supabase
        .from("cities")
        .select("*")
        .eq("state_id", selectedState)
        .eq("status", "active")
        .order("name")

      if (error) {
        console.error("Error loading cities:", error)
        return
      }

      if (data) {
        setCities(data)
        setSelectedCity("")
      }
    }
    loadCities()
  }, [selectedState, supabase])

  // Load events based on selected location
  useEffect(() => {
    const loadEvents = async () => {
      setLoading(true)
      setCurrentPage(1) // Reset to first page when filters change
      const now = new Date().toISOString()

      let query = supabase
        .from("events")
        .select("*")
        .in("status", ["upcoming", "ongoing"])
        .gte("start_date", now)
        .order("start_date", { ascending: true })

      // Filter by country (domestic = USA)
      if (selectedCountry) {
        query = query.eq("country_id", selectedCountry)
      }

      // Filter by state if selected
      if (selectedState) {
        query = query.eq("state_id", selectedState)
      }

      // Filter by city if selected
      if (selectedCity) {
        query = query.eq("city_id", selectedCity)
      }

      const { data, error } = await query

      if (error) {
        console.error("Error loading events:", error)
      }

      if (data) {
        setAllEvents(data)
      } else {
        setAllEvents([])
      }
      setLoading(false)
    }

    loadEvents()
  }, [selectedCountry, selectedState, selectedCity, supabase])

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

  const buildViewAllUrl = () => {
    let url = "/events?domestic=true"
    if (selectedState) url += `&state=${selectedState}`
    if (selectedCity) url += `&city=${selectedCity}`
    return url
  }

  // Pagination logic
  const ITEMS_PER_PAGE = 6
  const totalPages = Math.ceil(allEvents.length / ITEMS_PER_PAGE)
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const endIndex = startIndex + ITEMS_PER_PAGE
  const paginatedEvents = allEvents.slice(startIndex, endIndex)

  const handlePreviousPage = () => {
    setCurrentPage((prev) => Math.max(prev - 1, 1))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(prev + 1, totalPages))
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  return (
    <section className="py-16 bg-muted/30">
      <div className="container mx-auto px-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-8 gap-4">
          <div>
            <h2 className="text-3xl font-bold mb-2">Domestic Events</h2>
            <p className="text-muted-foreground">
              {userDetectedState
                ? `Showing events in ${userDetectedState} (auto-detected)`
                : "Find events near you by selecting state and city"
              }
            </p>
          </div>

          {/* Location Filters */}
          <div className="flex flex-col sm:flex-row gap-3 w-full md:w-auto">
            <Select value={selectedState || "all-states"} onValueChange={(value) => setSelectedState(value === "all-states" ? "" : value)}>
              <SelectTrigger className="w-full sm:w-[180px]">
                <SelectValue placeholder={detectingLocation ? "Detecting..." : "Select State"} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all-states">All States</SelectItem>
                {states.map((state) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            {selectedState && (
              <Select value={selectedCity || "all-cities"} onValueChange={(value) => setSelectedCity(value === "all-cities" ? "" : value)}>
                <SelectTrigger className="w-full sm:w-[180px]">
                  <SelectValue placeholder="Select City" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all-cities">All Cities</SelectItem>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>
        </div>

        {loading || detectingLocation ? (
          <div className="flex justify-center items-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            {detectingLocation && (
              <span className="ml-3 text-muted-foreground">Detecting your location...</span>
            )}
          </div>
        ) : allEvents.length === 0 ? (
          <div className="text-center py-16">
            <MapPin className="w-12 h-12 mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground text-lg mb-2">
              {userDetectedState
                ? `No events found in ${userDetectedState}`
                : "No domestic events found for the selected location."
              }
            </p>
            {userDetectedState && (
              <p className="text-sm text-muted-foreground mb-4">
                Try selecting a different state or view all events
              </p>
            )}
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                variant="outline"
                onClick={() => {
                  setSelectedState("")
                  setSelectedCity("")
                  setUserDetectedState(null)
                }}
              >
                View All States
              </Button>
              <Button asChild>
                <Link href="/events">Browse All Events</Link>
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {paginatedEvents.map((event) => (
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
                            {event.location_city}, {event.location_state}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </Link>
              ))}
            </div>

            {/* Pagination */}
            {totalPages > 1 && (
              <div className="flex flex-col items-center gap-4 mt-8">
                <div className="flex items-center justify-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handlePreviousPage}
                    disabled={currentPage === 1}
                  >
                    <ArrowRight className="h-4 w-4 mr-1 rotate-180" />
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
                    <ArrowRight className="h-4 w-4 ml-1" />
                  </Button>
                </div>

                <div className="text-sm text-muted-foreground">
                  Showing {startIndex + 1} to {Math.min(endIndex, allEvents.length)} of {allEvents.length} events
                </div>
              </div>
            )}

            {/* View All Button */}
            <div className="flex justify-center mt-8">
              <Button asChild size="lg" variant="outline">
                <Link href={buildViewAllUrl()}>
                  View All Domestic Events
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </section>
  )
}
