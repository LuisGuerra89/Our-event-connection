"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar, Clock } from "lucide-react"
import { useEventSearch } from "@/hooks/useEventSearch"

export function EventSearchBar() {
  const router = useRouter()
  const { searchHistory, addToHistory, clearHistory } = useEventSearch()
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")
  const [showHistory, setShowHistory] = useState(false)
  const [userLocation, setUserLocation] = useState<string | null>(null)
  const [showLocationTooltip, setShowLocationTooltip] = useState(false)

  // Auto-detect user location
  useEffect(() => {
    if ("geolocation" in navigator) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          try {
            const response = await fetch(
              `/api/location/reverse-geocode?lat=${position.coords.latitude}&lng=${position.coords.longitude}`
            )
            if (response.ok) {
              const data = await response.json()
              if (data.city && data.state) {
                setUserLocation(`${data.city}, ${data.state}`)
              }
            }
          } catch (error) {
            console.error("Error getting location:", error)
          }
        },
        () => {
          // Location permission denied
        },
        { timeout: 5000 }
      )
    }
  }, [])

  const handleSearch = (e: React.FormEvent, searchKeyword?: string, searchLocation?: string, searchDate?: string) => {
    e.preventDefault()

    const finalKeyword = searchKeyword ?? keyword
    const finalLocation = searchLocation ?? location
    const finalDate = searchDate ?? date

    // Save to search history
    if (finalKeyword || finalLocation || finalDate) {
      addToHistory(finalKeyword, finalLocation, finalDate)
    }

    const params = new URLSearchParams()
    if (finalKeyword) params.append("q", finalKeyword)
    if (finalLocation) params.append("location", finalLocation)
    if (finalDate) params.append("date", finalDate)

    setShowHistory(false)
    router.push(`/events?${params.toString()}`)
  }

  const clearSearchHistory = (e: React.MouseEvent) => {
    e.stopPropagation()
    clearHistory()
  }

  const useUserLocation = () => {
    if (userLocation) {
      setLocation(userLocation)
      setShowHistory(false)
    }
  }

  return (
    <div className="w-full max-w-5xl mx-auto relative">
      <form onSubmit={handleSearch} className="bg-background border rounded-2xl shadow-lg p-2">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Keyword Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Event name, category..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              onFocus={() => setShowHistory(true)}
              className="pl-12 h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Location */}
          <div className="flex-1 relative flex items-center">
            <div className="absolute left-4 relative">
              <button
                type="button"
                onClick={useUserLocation}
                onMouseEnter={() => userLocation && setShowLocationTooltip(true)}
                onMouseLeave={() => setShowLocationTooltip(false)}
                disabled={!userLocation}
                className={`h-5 w-5 transition-colors cursor-pointer flex items-center justify-center ${
                  userLocation ? "text-red-500 hover:text-red-600" : "text-muted-foreground"
                }`}
              >
                <MapPin className="h-5 w-5" />
              </button>
              {showLocationTooltip && userLocation && (
                <div className="absolute bottom-full left-0 mb-2 bg-gray-900 text-white text-xs px-3 py-2 rounded whitespace-nowrap pointer-events-none z-50">
                  Click to use: {userLocation}
                  <div className="absolute top-full left-2 w-0 h-0 border-l-4 border-r-4 border-t-4 border-l-transparent border-r-transparent border-t-gray-900"></div>
                </div>
              )}
            </div>
            <Input
              type="text"
              placeholder="City, state..."
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              onFocus={() => setShowHistory(true)}
              className="pl-12 h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Date */}
          <div className="flex-1 relative">
            <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="pl-12 h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0 cursor-pointer"
              title="Select event date"
            />
          </div>

          {/* Search Button */}
          <Button type="submit" size="lg" className="h-14 px-8">
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </form>

      {/* Search History Dropdown */}
      {showHistory && searchHistory.length > 0 && (
        <div className="absolute top-full left-0 right-0 mt-2 bg-background border rounded-lg shadow-lg z-50 max-w-5xl mx-auto w-full">
          <div className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-2 text-sm font-semibold text-muted-foreground">
                <Clock className="h-4 w-4" />
                Recent Searches
              </div>
              <button
                onClick={clearSearchHistory}
                className="text-xs text-muted-foreground hover:text-foreground transition-colors"
              >
                Clear
              </button>
            </div>
            <div className="space-y-2">
              {searchHistory.map((search, idx) => (
                <button
                  key={idx}
                  onClick={(e) => {
                    e.preventDefault()
                    handleSearch(
                      e,
                      search.keyword,
                      search.location,
                      search.date
                    )
                  }}
                  className="w-full text-left px-3 py-2 rounded-md hover:bg-muted transition-colors text-sm"
                >
                  <div className="flex items-center gap-2 mb-1">
                    {search.keyword && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        <Search className="h-3 w-3" />
                        {search.keyword}
                      </span>
                    )}
                    {search.location && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        <MapPin className="h-3 w-3" />
                        {search.location}
                      </span>
                    )}
                    {search.date && (
                      <span className="inline-flex items-center gap-1 bg-primary/10 text-primary px-2 py-1 rounded text-xs">
                        <Calendar className="h-3 w-3" />
                        {new Date(search.date).toLocaleDateString()}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
