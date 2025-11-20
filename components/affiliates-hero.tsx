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
            Join Our Affiliate Program
          </h1>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Become an affiliate by sharing your referral code. Earn rewards for every member you bring 
            to our community and build your network!
          </p>

          <div className="grid md:grid-cols-4 gap-6 pt-8">
            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Build Network</h3>
              <p className="text-sm text-muted-foreground text-center">
                Connect with members you refer
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Earn Rewards</h3>
              <p className="text-sm text-muted-foreground text-center">
                Get free activities & benefits
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Award className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Recognition</h3>
              <p className="text-sm text-muted-foreground text-center">
                Featured affiliate profile
              </p>
            </div>

            <div className="flex flex-col items-center gap-2">
              <div className="h-12 w-12 rounded-full bg-primary/10 flex items-center justify-center">
                <Handshake className="h-6 w-6 text-primary" />
              </div>
              <h3 className="font-semibold">Community</h3>
              <p className="text-sm text-muted-foreground text-center">
                Exclusive affiliate network
              </p>
            </div>
          </div>

          <div className="pt-6 flex gap-4 justify-center">
            <Button size="lg" asChild>
              <Link href="#affiliates">View Affiliates</Link>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <Link href="/affiliates/apply">Become an Affiliate</Link>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
