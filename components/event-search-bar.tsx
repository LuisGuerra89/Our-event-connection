"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Search, MapPin, Calendar } from "lucide-react"
import { cn } from "@/lib/utils"

export function EventSearchBar() {
  const router = useRouter()
  const [keyword, setKeyword] = useState("")
  const [location, setLocation] = useState("")
  const [date, setDate] = useState("")

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault()
    
    const params = new URLSearchParams()
    if (keyword) params.append("q", keyword)
    if (location) params.append("location", location)
    if (date) params.append("date", date)
    
    router.push(`/events?${params.toString()}`)
  }

  return (
    <div className="w-full max-w-5xl mx-auto">
      <form onSubmit={handleSearch} className="bg-background border rounded-2xl shadow-lg p-2">
        <div className="flex flex-col md:flex-row gap-2">
          {/* Keyword Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Search events..."
              value={keyword}
              onChange={(e) => setKeyword(e.target.value)}
              className="pl-12 h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Location */}
          <div className="flex-1 relative">
            <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
            <Input
              type="text"
              placeholder="Location (city, state)"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
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
              className="pl-12 h-14 border-0 focus-visible:ring-0 focus-visible:ring-offset-0"
            />
          </div>

          {/* Search Button */}
          <Button type="submit" size="lg" className="h-14 px-8">
            <Search className="h-5 w-5 mr-2" />
            Search
          </Button>
        </div>
      </form>
    </div>
  )
}
