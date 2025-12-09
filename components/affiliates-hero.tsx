"use client"

import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Award, Handshake } from "lucide-react"
import Link from "next/link"

export function AffiliatesHero() {
  return (
    <div 
      className="relative bg-cover bg-center bg-no-repeat py-20 md:py-32"
      style={{
        backgroundImage: `url('/affiliates.jpg')`
      }}
    >
      {/* Overlays for text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
            Our Affiliate Partners
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Discover amazing businesses and exclusive discounts from our trusted partners. 
            Restaurants, gyms, shops and more - all in one place!
          </p>

          <div className="grid md:grid-cols-4 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Local Businesses</h3>
              <p className="text-sm text-white/80 text-center">
                Partner companies in your area
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Exclusive Deals</h3>
              <p className="text-sm text-white/80 text-center">
                Special offers & discounts
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Award className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Verified Partners</h3>
              <p className="text-sm text-white/80 text-center">
                Trusted & approved businesses
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Handshake className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Benefits</h3>
              <p className="text-sm text-white/80 text-center">
                Member-only advantages
              </p>
            </div>
          </div>

          <div className="pt-6 flex flex-col sm:flex-row gap-4 justify-center">
            <Button size="lg" asChild className="w-full sm:w-auto">
              <Link href="#affiliates">View All Partners</Link>
            </Button>
            <Button size="lg" variant="outline" asChild className="w-full sm:w-auto">
              <Link href="/affiliates/apply">Apply as a Partner</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
