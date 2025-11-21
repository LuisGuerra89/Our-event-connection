"use client"

import { useState, useRef, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Users, MapPin, Award, X, ChevronLeft, ChevronRight } from "lucide-react"
import Link from "next/link"
import Image from "next/image"

interface AffiliatesListProps {
  initialAffiliates: any[]
}

export function AffiliatesList({ initialAffiliates }: AffiliatesListProps) {
  const [affiliates, setAffiliates] = useState(initialAffiliates)
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [selectedAffiliate, setSelectedAffiliate] = useState<any>(null)
  const [detailsModalOpen, setDetailsModalOpen] = useState(false)
  const scrollContainerRef = useRef<HTMLDivElement>(null)
  const autoScrollIntervalRef = useRef<NodeJS.Timeout | null>(null)

  // Auto-scroll carousel every 5 seconds
  useEffect(() => {
    const startAutoScroll = () => {
      autoScrollIntervalRef.current = setInterval(() => {
        if (scrollContainerRef.current) {
          const { scrollLeft, scrollWidth, clientWidth } = scrollContainerRef.current
          const cardWidth = 336 + 16 // w-80 (320px) + gap (16px)
          
          // If at the end, reset to start
          if (scrollLeft + clientWidth >= scrollWidth - 10) {
            scrollContainerRef.current.scrollTo({
              left: 0,
              behavior: "smooth",
            })
          } else {
            // Scroll to next card
            scrollContainerRef.current.scrollTo({
              left: scrollLeft + cardWidth,
              behavior: "smooth",
            })
          }
        }
      }, 5000)
    }

    startAutoScroll()

    return () => {
      if (autoScrollIntervalRef.current) {
        clearInterval(autoScrollIntervalRef.current)
      }
    }
  }, [])

  const loadAllAffiliates = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from("affiliates")
      .select("*")
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })

    if (data) {
      setAffiliates(data)
      setShowAll(true)
    }
    setIsLoading(false)
  }

  const displayedAffiliates = showAll ? affiliates : affiliates.slice(0, 9)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const openDetailsModal = (affiliate: any) => {
    setSelectedAffiliate(affiliate)
    setDetailsModalOpen(true)
  }

  const scroll = (direction: "left" | "right") => {
    if (scrollContainerRef.current) {
      const cardWidth = 336 + 16 // w-80 + gap
      const newScrollLeft =
        scrollContainerRef.current.scrollLeft + (direction === "left" ? -cardWidth : cardWidth)
      scrollContainerRef.current.scrollTo({
        left: newScrollLeft,
        behavior: "smooth",
      })
    }
  }

  return (
    <div id="affiliates" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Our Affiliate Partners</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover and support the businesses that partner with us
        </p>
      </div>

      {/* Mobile Carousel / Desktop Grid */}
      <div className="hidden md:grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedAffiliates.map((affiliate) => (
          <Card key={affiliate.id} className="flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailsModal(affiliate)}>
            {/* Image Section - Full Width */}
            <div className="relative w-full h-48 bg-muted overflow-hidden">
              {affiliate.image_url ? (
                <Image
                  src={affiliate.image_url}
                  alt={affiliate.name}
                  fill
                  className="object-cover hover:scale-105 transition-transform"
                />
              ) : (
                <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                  <div className="text-center">
                    <div className="text-4xl font-bold text-muted-foreground/50">
                      {getInitials(affiliate.name)}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Content Section */}
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between gap-2">
                <CardTitle className="text-lg line-clamp-2">
                  {affiliate.name}
                </CardTitle>
                {affiliate.approval_status === "approved" && (
                  <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                )}
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-3 pb-3">
              {affiliate.description && (
                <p className="text-sm text-muted-foreground line-clamp-2">
                  {affiliate.description}
                  {affiliate.description.length > 100 && "..."}
                </p>
              )}

              {(affiliate.city || affiliate.state || affiliate.country) && (
                <div className="flex items-start gap-2 text-xs text-muted-foreground">
                  <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                  <span>
                    {[affiliate.city, affiliate.state, affiliate.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter className="pt-0">
              <Button 
                className="w-full" 
                variant="outline"
                onClick={(e) => {
                  e.stopPropagation()
                  openDetailsModal(affiliate)
                }}
              >
                View Details
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {/* Mobile Carousel */}
      <div className="md:hidden space-y-4">
        {/* Navigation Buttons */}
        <div className="flex gap-2 justify-center">
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("left")}
            className="rounded-full"
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={() => scroll("right")}
            className="rounded-full"
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>

        {/* Scrollable Container */}
        <div 
          ref={scrollContainerRef}
          className="flex gap-4 overflow-x-auto pb-4 scroll-smooth"
          style={{ scrollbarWidth: 'none', msOverflowStyle: 'none' }}
        >
          {displayedAffiliates.map((affiliate) => (
            <div key={affiliate.id} className="flex-shrink-0 w-80">
              <Card className="h-full flex flex-col overflow-hidden hover:shadow-lg transition-shadow cursor-pointer" onClick={() => openDetailsModal(affiliate)}>
                {/* Image Section - Full Width */}
                <div className="relative w-full h-48 bg-muted overflow-hidden">
                  {affiliate.image_url ? (
                    <Image
                      src={affiliate.image_url}
                      alt={affiliate.name}
                      fill
                      className="object-cover hover:scale-105 transition-transform"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-muted to-muted-foreground/10">
                      <div className="text-center">
                        <div className="text-4xl font-bold text-muted-foreground/50">
                          {getInitials(affiliate.name)}
                        </div>
                      </div>
                    </div>
                  )}
                </div>

                {/* Content Section */}
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between gap-2">
                    <CardTitle className="text-lg line-clamp-2">
                      {affiliate.name}
                    </CardTitle>
                    {affiliate.approval_status === "approved" && (
                      <Award className="h-4 w-4 text-green-600 flex-shrink-0" />
                    )}
                  </div>
                </CardHeader>

                <CardContent className="flex-1 space-y-3 pb-3">
                  {affiliate.description && (
                    <p className="text-sm text-muted-foreground line-clamp-2">
                      {affiliate.description}
                      {affiliate.description.length > 100 && "..."}
                    </p>
                  )}

                  {(affiliate.city || affiliate.state || affiliate.country) && (
                    <div className="flex items-start gap-2 text-xs text-muted-foreground">
                      <MapPin className="h-3 w-3 flex-shrink-0 mt-0.5" />
                      <span>
                        {[affiliate.city, affiliate.state, affiliate.country]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </CardContent>

                <CardFooter className="pt-0">
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={(e) => {
                      e.stopPropagation()
                      openDetailsModal(affiliate)
                    }}
                  >
                    View Details
                  </Button>
                </CardFooter>
              </Card>
            </div>
          ))}
        </div>
      </div>

      {!showAll && affiliates.length > 9 && (
        <div className="flex justify-center mt-8">
          <Button
            variant="outline"
            size="lg"
            onClick={loadAllAffiliates}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "View All Affiliates"}
          </Button>
        </div>
      )}

      {displayedAffiliates.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Partners Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to become our partner!
          </p>
          <Button asChild size="lg">
            <Link href="/affiliates/apply">Become a Partner</Link>
          </Button>
        </div>
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
                    <Image
                      src={selectedAffiliate.image_url}
                      alt={selectedAffiliate.name}
                      fill
                      className="object-cover"
                    />
                  </div>
                )}

                {/* Status Badge */}
                <div className="flex items-center gap-2">
                  <Badge variant="default" className="bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100">
                    <Award className="h-3 w-3 mr-1" />
                    Verified Partner
                  </Badge>
                </div>

                {/* Description */}
                <div>
                  <h3 className="font-semibold mb-2">About the Business</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {selectedAffiliate.description || "No description provided"}
                  </p>
                </div>

                {/* Address */}
                <div>
                  <h3 className="font-semibold mb-2">Address</h3>
                  <div className="text-sm text-muted-foreground space-y-1">
                    <p>{selectedAffiliate.address || "Not provided"}</p>
                    {(selectedAffiliate.city || selectedAffiliate.state || selectedAffiliate.country) && (
                      <p>
                        {[selectedAffiliate.city, selectedAffiliate.state, selectedAffiliate.country]
                          .filter(Boolean)
                          .join(", ")}
                      </p>
                    )}
                  </div>
                </div>

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
