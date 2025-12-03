"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Event {
  id: string
  title: string
  description: string
  image_url: string | null
  banner_image_url: string | null
  start_date: string
  location_city: string
  location_state: string
  capacity: number
  entry_fee: number
}

interface FeaturedEventsCarouselProps {
  events: Event[]
}

export function FeaturedEventsCarousel({ events }: FeaturedEventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)

  // Auto-cycle through events every 5 seconds
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
    }, 5000)

    return () => clearInterval(timer)
  }, [events.length])

  const goToNext = () => {
    setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
  }

  const goToPrevious = () => {
    setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
  }

  const goToSlide = (index: number) => {
    setCurrentIndex(index)
  }

  const currentEvent = events[currentIndex]

  return (
    <div className="relative w-full max-w-6xl mx-auto">
      {/* Main carousel display */}
      <div className="relative overflow-hidden rounded-2xl shadow-2xl">
        <div className="relative h-[500px] md:h-[600px]">
          {/* Event image background */}
          <div
            className="absolute inset-0 bg-cover bg-center transition-all duration-700"
            style={{
              backgroundImage: `url(${currentEvent.banner_image_url || currentEvent.image_url || "/placeholder.svg?height=600&width=1200"})`,
            }}
          >
            {/* Gradient overlay for text readability */}
            <div className="absolute inset-0 bg-gradient-to-t from-background via-background/60 to-transparent" />
          </div>

          {/* Event content */}
          <div className="relative h-full flex flex-col justify-end p-8 md:p-12">
            <div className="max-w-2xl">
              <h3 className="text-4xl md:text-5xl font-bold mb-4 text-balance">{currentEvent.title}</h3>
              <p className="text-lg md:text-xl mb-6 text-muted-foreground line-clamp-2 text-pretty">
                {currentEvent.description}
              </p>

              <div className="flex flex-wrap gap-4 mb-6">
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                  <Calendar className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {new Date(currentEvent.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                  <MapPin className="h-5 w-5 text-primary" />
                  <span className="text-sm font-medium">
                    {currentEvent.location_city}, {currentEvent.location_state}
                  </span>
                </div>
                {currentEvent.capacity > 0 && (
                  <div className="flex items-center gap-2 bg-background/80 backdrop-blur-sm px-4 py-2 rounded-full">
                    <Users className="h-5 w-5 text-primary" />
                    <span className="text-sm font-medium">{currentEvent.capacity} spots</span>
                  </div>
                )}
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Button size="lg" asChild>
                  <Link href={`/events/${currentEvent.id}`}>View Event Details</Link>
                </Button>
                <Button size="lg" variant="outline" className="bg-background/80 backdrop-blur-sm" asChild>
                  <Link href="/events">Browse All Events</Link>
                </Button>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation arrows */}
        <button
          onClick={goToPrevious}
          className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background p-3 rounded-full transition-colors"
          aria-label="Previous event"
        >
          <ChevronLeft className="h-6 w-6" />
        </button>
        <button
          onClick={goToNext}
          className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm hover:bg-background p-3 rounded-full transition-colors"
          aria-label="Next event"
        >
          <ChevronRight className="h-6 w-6" />
        </button>
      </div>

      {/* Carousel indicators */}
      <div className="flex justify-center gap-2 mt-6">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "h-2 rounded-full transition-all",
              index === currentIndex ? "w-8 bg-primary" : "w-2 bg-muted-foreground/40 hover:bg-muted-foreground/60",
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>
    </div>
  )
}
