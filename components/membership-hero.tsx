"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Users, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

export function MembershipHero() {
  return (
    <div 
      className="relative bg-cover bg-center bg-no-repeat py-20 md:py-32"
      style={{
        backgroundImage: `url('/membership.jpg')`
      }}
    >
      {/* Overlays for text readability */}
      <div className="absolute inset-0 bg-black/50" />
      <div className="absolute inset-0 bg-black/30" />
      
      <div className="container mx-auto px-4 relative z-10">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight text-white drop-shadow-lg">
            Premium Membership Plans with Exclusive Benefits
          </h1>
          <p className="text-xl text-white/90 max-w-2xl mx-auto drop-shadow-md">
            Unlock premium benefits, exclusive events, and connect with like-minded individuals. 
            Refer friends and earn free activities!
          </p>

          <div className="grid md:grid-cols-4 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Flexible Plans</h3>
              <p className="text-sm text-white/80 text-center">
                Daily, weekly, or monthly options
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Users className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Exclusive Events</h3>
              <p className="text-sm text-white/80 text-center">
                Members-only activities
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <Star className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Referral Rewards</h3>
              <p className="text-sm text-white/80 text-center">
                25 referrals = 1 free activity
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-white/20 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-white" />
              </div>
              <h3 className="font-semibold text-white">Auto-Renewal</h3>
              <p className="text-sm text-white/80 text-center">
                Cancel anytime, no commitment
              </p>
            </div>
          </div>

          <div className="pt-6">
            <Button size="lg" asChild>
              <Link href="#plans">View Membership Plans</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
