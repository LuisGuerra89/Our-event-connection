"use client"

import { Button } from "@/components/ui/button"
import { CreditCard, Users, Star, TrendingUp } from "lucide-react"
import Link from "next/link"

export function MembershipHero() {
  return (
    <div className="relative bg-gradient-to-br from-primary/10 via-primary/5 to-background py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto text-center space-y-6">
          <h1 className="text-5xl font-bold tracking-tight">
            Join Our Exclusive Membership
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Unlock premium benefits, exclusive events, and connect with like-minded individuals. 
            Refer friends and earn free activities!
          </p>

          <div className="grid md:grid-cols-4 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <CreditCard className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Flexible Plans</h3>
              <p className="text-sm text-muted-foreground text-center">
                Daily, weekly, or monthly options
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Exclusive Events</h3>
              <p className="text-sm text-muted-foreground text-center">
                Members-only activities
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Star className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Referral Rewards</h3>
              <p className="text-sm text-muted-foreground text-center">
                25 referrals = 1 free activity
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Auto-Renewal</h3>
              <p className="text-sm text-muted-foreground text-center">
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
