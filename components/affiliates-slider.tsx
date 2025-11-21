"use client"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { ChevronLeft, ChevronRight, ExternalLink, Award, MapPin } from "lucide-react"
import Link from "next/link"
import { cn } from "@/lib/utils"
import Image from "next/image"

interface Affiliate {
  id: string
  name: string
  description: string | null
  image_url: string | null
  website_url: string | null
  status: string
  city?: string
  state?: string
  country?: string
  address?: string
}

interface AffiliatesSliderProps {
  affiliates: Affiliate[]
}

export function AffiliatesSlider({ affiliates }: AffiliatesSliderProps) {
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(true)
  const [selectedAffiliate, setSelectedAffiliate] = useState<Affiliate | null>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)

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
            className="flex-shrink-0 w-56 group/card cursor-pointer"
            onClick={() => {
              setSelectedAffiliate(affiliate)
              setDetailsModalOpen(true)
            }}
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

              <Button variant="ghost" size="sm" className="mt-auto text-xs">
                View Details
              </Button>
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

      {/* Details Modal */}
      <Dialog open={detailsModalOpen} onOpenChange={setDetailsModalOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          {selectedAffiliate && (
            <>
              <DialogHeader>
                <DialogTitle className="text-2xl">{selectedAffiliate.name}</DialogTitle>
                <DialogDescription>Partner Business Details</DialogDescription>
              </DialogHeader>

              <div className="space-y-6">
                {/* Image */}
                {selectedAffiliate.image_url && (
                  <div className="relative w-full h-64 rounded-lg overflow-hidden">
                    <img
                      src={selectedAffiliate.image_url}
                      alt={selectedAffiliate.name}
                      className="w-full h-full object-cover"
                    />
                  </div>
                )}

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About the Business</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedAffiliate.description || "No description provided"}
                  </p>
                </div>

                {/* Location */}
                {(selectedAffiliate.city || selectedAffiliate.state || selectedAffiliate.country) && (
                  <div>
                    <div className="flex items-center gap-2 mb-2">
                      <MapPin className="h-4 w-4" />
                      <h3 className="font-semibold">Location</h3>
                    </div>
                    <div className="text-sm text-muted-foreground space-y-1">
                      {selectedAffiliate.address && <p>{selectedAffiliate.address}</p>}
                      <p>
                        {[selectedAffiliate.city, selectedAffiliate.state, selectedAffiliate.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    </div>
                  </div>
                )}

                {/* Footer */}
                <div className="pt-4 border-t flex gap-2">
                  <Button 
                    variant="outline" 
                    className="flex-1"
                    onClick={() => setDetailsModalOpen(false)}
                  >
                    Close
                  </Button>
                </div>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </div>
  )
}
