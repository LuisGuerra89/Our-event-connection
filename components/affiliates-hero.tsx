"use client"

import { Button } from "@/components/ui/button"
import { Users, TrendingUp, Award, Handshake } from "lucide-react"
import Link from "next/link"

export function AffiliatesHero() {
  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Our Affiliate Partners
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Discover amazing businesses and exclusive discounts from our trusted partners. 
            Restaurants, gyms, shops and more - all in one place!
          </p>

          <div className="grid md:grid-cols-4 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Local Businesses</h3>
              <p className="text-sm text-muted-foreground text-center">
                Partner companies in your area
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Exclusive Deals</h3>
              <p className="text-sm text-muted-foreground text-center">
                Special offers & discounts
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Verified Partners</h3>
              <p className="text-sm text-muted-foreground text-center">
                Trusted & approved businesses
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Handshake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Benefits</h3>
              <p className="text-sm text-muted-foreground text-center">
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
