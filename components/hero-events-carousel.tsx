"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Calendar, MapPin, Users, Sparkles } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

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

interface HeroEventsCarouselProps {
  events: Event[]
}

export function HeroEventsCarousel({ events }: HeroEventsCarouselProps) {
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isAutoplay, setIsAutoplay] = useState(true)
  const [isTransitioning, setIsTransitioning] = useState(false)
  const autoplayTimerRef = useRef<NodeJS.Timeout | null>(null)

  if (!events || events.length === 0) {
    return null
  }

  // Auto-cycle through events every 6 seconds
  useEffect(() => {
    if (!isAutoplay) return

    autoplayTimerRef.current = setInterval(() => {
      setIsTransitioning(true)
      setTimeout(() => {
        setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
        setIsTransitioning(false)
      }, 300)
    }, 6000)

    return () => {
      if (autoplayTimerRef.current) clearInterval(autoplayTimerRef.current)
    }
  }, [isAutoplay, events.length])

  const goToNext = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex + 1) % events.length)
      setIsTransitioning(false)
    }, 300)
    resetAutoplay()
  }

  const goToPrevious = () => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex((prevIndex) => (prevIndex - 1 + events.length) % events.length)
      setIsTransitioning(false)
    }, 300)
    resetAutoplay()
  }

  const goToSlide = (index: number) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setCurrentIndex(index)
      setIsTransitioning(false)
    }, 300)
    resetAutoplay()
  }

  const resetAutoplay = () => {
    setIsAutoplay(false)
    setTimeout(() => setIsAutoplay(true), 500)
  }

  const currentEvent = events[currentIndex]
  const nextIndex = (currentIndex + 1) % events.length
  const nextEvent = events[nextIndex]

  // Get featured badge color based on category or random
  const getBadgeColor = (index: number) => {
    const colors = [
      "bg-red-500/80",
      "bg-purple-500/80",
      "bg-blue-500/80",
      "bg-pink-500/80",
      "bg-orange-500/80",
    ]
    return colors[index % colors.length]
  }

  return (
    <div className="w-full space-y-8">
      {/* Main Hero Carousel */}
      <div
        className="relative w-full rounded-3xl shadow-2xl overflow-hidden group"
        onMouseEnter={() => setIsAutoplay(false)}
        onMouseLeave={() => setIsAutoplay(true)}
      >
        {/* Background gradient overlay container */}
        <div className="relative h-[500px] md:h-[600px] lg:h-[700px] overflow-hidden">
          {/* Multiple background layers for parallax effect */}
          {events.map((event, idx) => (
            <div
              key={event.id}
              className={cn(
                "absolute inset-0 transition-all duration-700",
                idx === currentIndex
                  ? "opacity-100 scale-100"
                  : "opacity-0 scale-105"
              )}
            >
              {/* Main background image */}
              <div
                className="absolute inset-0 bg-cover bg-center"
                style={{
                  backgroundImage: `url(${event.banner_image_url || event.image_url || "/placeholder.svg?height=700&width=1400"})`,
                }}
              />

              {/* Multiple gradient overlays for depth and readability */}
              <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-70" />
              <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-transparent to-black/20 opacity-50" />

              {/* Animated accent line */}
              <div className={cn(
                "absolute top-0 left-0 h-1 bg-gradient-to-r from-primary via-purple-500 to-pink-500",
                idx === currentIndex ? "w-full" : "w-0",
                "transition-all duration-1000"
              )} />
            </div>
          ))}

          {/* Content Layer */}
          <div className="relative h-full flex flex-col justify-between p-6 md:p-10 lg:p-16">
            {/* Top section with badge */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={cn(
                  "w-3 h-3 rounded-full animate-pulse",
                  getBadgeColor(currentIndex)
                )} />
                <span className="text-white/80 text-sm font-medium tracking-wider uppercase">
                  Featured Event
                </span>
              </div>
              <div className="hidden sm:flex items-center gap-2 bg-white/10 backdrop-blur-md px-4 py-2 rounded-full border border-white/20">
                <Sparkles className="h-4 w-4 text-primary" />
                <span className="text-white/90 text-sm font-medium">
                  {currentIndex + 1} of {events.length}
                </span>
              </div>
            </div>

            {/* Middle content section */}
            <div className="max-w-2xl space-y-4 md:space-y-6">
              {/* Event title with animation */}
              <div className={cn(
                "transition-all duration-700",
                isTransitioning ? "opacity-0 transform -translate-y-4" : "opacity-100 transform translate-y-0"
              )}>
                <h2 className="text-2xl sm:text-3xl md:text-5xl lg:text-6xl font-bold text-white mb-3 md:mb-4 text-balance leading-tight">
                  {currentEvent.title}
                </h2>
              </div>

              {/* Event description with animation */}
              <div className={cn(
                "transition-all duration-700 delay-75",
                isTransitioning ? "opacity-0 transform -translate-y-2" : "opacity-100 transform translate-y-0"
              )}>
                <p className="text-xs sm:text-sm md:text-base lg:text-lg text-white/80 line-clamp-2 sm:line-clamp-3 text-pretty max-w-xl">
                  {currentEvent.description}
                </p>
              </div>

              {/* Event details badges with animation */}
              <div className={cn(
                "flex flex-wrap gap-2 md:gap-3 transition-all duration-700 delay-150",
                isTransitioning ? "opacity-0" : "opacity-100"
              )}>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-full border border-white/20 hover:bg-white/15 transition-colors">
                  <Calendar className="h-4 md:h-5 w-4 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-white/90 text-xs md:text-sm font-medium">
                    {new Date(currentEvent.start_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </span>
                </div>
                <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-full border border-white/20 hover:bg-white/15 transition-colors">
                  <MapPin className="h-4 md:h-5 w-4 md:w-5 text-primary flex-shrink-0" />
                  <span className="text-white/90 text-xs md:text-sm font-medium">
                    {currentEvent.location_city}, {currentEvent.location_state}
                  </span>
                </div>
                {currentEvent.capacity > 0 && (
                  <div className="flex items-center gap-1.5 md:gap-2 bg-white/10 backdrop-blur-md px-3 md:px-4 py-2 md:py-3 rounded-full border border-white/20 hover:bg-white/15 transition-colors">
                    <Users className="h-4 md:h-5 w-4 md:w-5 text-primary flex-shrink-0" />
                    <span className="text-white/90 text-xs md:text-sm font-medium">{currentEvent.capacity} spots</span>
                  </div>
                )}
              </div>
            </div>

            {/* Bottom CTA buttons with animation */}
            <div className={cn(
              "flex flex-col sm:flex-row gap-3 md:gap-4 transition-all duration-700 delay-200 w-full sm:w-auto",
              isTransitioning ? "opacity-0 transform translate-y-4" : "opacity-100 transform translate-y-0"
            )}>
              <Button
                size="sm"
                className="bg-primary hover:bg-primary/90 text-white font-semibold shadow-lg hover:shadow-xl transition-all text-xs md:text-sm py-2 md:py-3"
                asChild
              >
                <Link href={`/events/${currentEvent.id}`} className="flex items-center justify-center gap-1">
                  <span className="hidden sm:inline">View Event Details</span>
                  <span className="sm:hidden">View Details</span>
                  <ChevronRight className="h-4 w-4" />
                </Link>
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="bg-white/10 border-white/20 text-white hover:bg-white/20 backdrop-blur-md font-semibold text-xs md:text-sm py-2 md:py-3"
                asChild
              >
                <Link href="/events" className="flex items-center justify-center">Browse Events</Link>
              </Button>
            </div>
          </div>
        </div>

        {/* Navigation Arrows */}
        <button
          onClick={goToPrevious}
          className={cn(
            "absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-2 md:p-3 rounded-full transition-all z-10",
            "border border-white/20 hover:border-white/40",
            "group-hover:bg-white/40 group-hover:scale-110",
            "touch-manipulation"
          )}
          aria-label="Previous event"
        >
          <ChevronLeft className="h-4 md:h-6 w-4 md:w-6 text-white" />
        </button>
        <button
          onClick={goToNext}
          className={cn(
            "absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/20 backdrop-blur-md hover:bg-white/30 p-2 md:p-3 rounded-full transition-all z-10",
            "border border-white/20 hover:border-white/40",
            "group-hover:bg-white/40 group-hover:scale-110",
            "touch-manipulation"
          )}
          aria-label="Next event"
        >
          <ChevronRight className="h-4 md:h-6 w-4 md:w-6 text-white" />
        </button>

        {/* Autoplay indicator */}
        <div className="absolute bottom-4 md:bottom-6 left-4 md:left-10 right-4 md:right-10 h-1 bg-white/10 rounded-full overflow-hidden z-10">
          <div
            className={cn(
              "h-full bg-gradient-to-r from-primary to-purple-500 rounded-full transition-all",
              isAutoplay ? "animate-[grow_6s_linear_infinite]" : ""
            )}
            style={{
              animation: isAutoplay ? `grow 6s linear infinite` : "none",
            }}
          />
        </div>
      </div>

      {/* Thumbnail preview of next events */}
      {events.length > 1 && (
        <div className="px-4 md:px-0">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
            {events.map((event, idx) => (
              <button
                key={event.id}
                onClick={() => goToSlide(idx)}
                className={cn(
                  "group relative overflow-hidden rounded-xl transition-all duration-300 h-24 md:h-28 cursor-pointer",
                  "border-2 transition-all",
                  idx === currentIndex
                    ? "border-primary ring-2 ring-primary ring-offset-2 scale-105"
                    : "border-muted hover:border-primary/50"
                )}
              >
                {/* Thumbnail image */}
                <div
                  className="absolute inset-0 bg-cover bg-center group-hover:scale-110 transition-transform duration-300"
                  style={{
                    backgroundImage: `url(${event.banner_image_url || event.image_url || "/placeholder.svg?height=120&width=120"})`,
                  }}
                />

                {/* Overlay */}
                <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent opacity-60" />

                {/* Active indicator */}
                {idx === currentIndex && (
                  <div className="absolute inset-0 bg-primary/20 border-2 border-primary rounded-xl" />
                )}

                {/* Event title */}
                <div className="absolute bottom-0 left-0 right-0 p-2">
                  <p className="text-white text-xs font-semibold line-clamp-2 text-balance">
                    {event.title}
                  </p>
                </div>

                {/* Badge for current slide */}
                {idx === currentIndex && (
                  <div className="absolute top-2 right-2 bg-primary text-white text-xs font-bold px-2 py-1 rounded-full">
                    Now
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Carousel indicators */}
      <div className="flex justify-center gap-2 md:gap-3 px-4 md:px-0">
        {events.map((_, index) => (
          <button
            key={index}
            onClick={() => goToSlide(index)}
            className={cn(
              "transition-all duration-300 rounded-full",
              index === currentIndex
                ? "w-8 md:w-10 h-2 md:h-2.5 bg-primary shadow-lg shadow-primary/50"
                : "w-2 md:w-2.5 h-2 md:h-2.5 bg-muted-foreground/40 hover:bg-muted-foreground/60"
            )}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      <style jsx>{`
        @keyframes grow {
          from {
            width: 0%;
          }
          to {
            width: 100%;
          }
        }
      `}</style>
    </div>
  )
}
