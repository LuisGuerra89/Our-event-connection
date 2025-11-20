"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, ExternalLink } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"

interface Affiliate {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website_url: string | null
  status: string
}

interface AffiliatesSliderProps {
  affiliates: Affiliate[]
}

export function AffiliatesSlider({ affiliates }: AffiliatesSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)

  const checkScrollability = () => {
    if (scrollContainerRef.current) {
      const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
      setCanScrollLeft(scrollLeft > 0)
      setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 10)
    }
  }

  useEffect(() => {
    checkScrollability()
    window.addEventListener("resize", checkScrollability)
    return () => window.removeEventListener("resize", checkScrollability)
  }, [])

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const scrollAmount = 300
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "left" ? -scrollAmount : scrollAmount)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
      setTimeout(checkScrollability, 100)
    }
  }

  // Auto-scroll functionality
  useEffect(() => {
    const interval = setInterval(() => {
      if (scrollContainerRef.current) {
        const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
        if (scrollLeft >= scrollWidth - clientWidth - 10) {
          // Reset to start
          scrollContainerRef.current.scrollTo({ left: 0, behavior: "smooth" })
        } else {
          scroll("right")
        }
      }
    }, 3000) // Auto-scroll every 3 seconds

    return () => clearInterval(interval)
  }, [])

  if (affiliates.length === 0) {
    return null
  }

  return (
    <div className="relative group">
      {/* Left Arrow */}
      {canScrollLeft && (
        <Button
          variant="outline"
          size="icon"
          className="absolute left-0 top-1/2 -translate-y-1/2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("left")}
        >
          <ChevronLeft className="h-6 w-6" />
        </Button>
      )}

      {/* Scrollable Container */}
      <div
        ref={scrollContainerRef}
        onScroll={checkScrollability}
        className="flex gap-6 overflow-x-auto scrollbar-hide scroll-smooth pb-4"
        style={{ scrollbarWidth: "none", msOverflowStyle: "none" }}
      >
        {affiliates.map((affiliate) => (
          <div
            key={affiliate.id}
            className="flex-shrink-0 w-56 group/card"
          >
            <div className="bg-background border rounded-xl p-6 h-full flex flex-col items-center justify-center hover:shadow-lg transition-shadow">
              {affiliate.image_url ? (
                <img
                  src={affiliate.image_url}
                  alt={affiliate.name}
                  className="h-20 object-contain mb-4 grayscale group-hover/card:grayscale-0 transition-all"
                />
              ) : (
                <div className="h-20 flex items-center justify-center mb-4">
                  <p className="font-bold text-lg text-center">{affiliate.name}</p>
                </div>
              )}
              
              <h3 className="font-semibold text-center text-sm mb-2 line-clamp-2">
                {affiliate.name}
              </h3>
              
              {affiliate.description && (
                <p className="text-xs text-muted-foreground text-center line-clamp-2 mb-3">
                  {affiliate.description}
                </p>
              )}

              {affiliate.website_url && (
                <Button variant="ghost" size="sm" asChild className="mt-auto">
                  <a 
                    href={affiliate.website_url} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-xs"
                  >
                    Visit Website
                    <ExternalLink className="h-3 w-3 ml-1" />
                  </a>
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>

      {/* Right Arrow */}
      {canScrollRight && (
        <Button
          variant="outline"
          size="icon"
          className="absolute right-0 top-1/2 -translate-y-1/2 z-10 shadow-lg opacity-0 group-hover:opacity-100 transition-opacity"
          onClick={() => scroll("right")}
        >
          <ChevronRight className="h-6 w-6" />
        </Button>
      )}
    </div>
  )
}
