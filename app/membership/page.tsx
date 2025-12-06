import type { Metadata } from 'next'
import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { MembershipHero } from "@/components/membership-hero"
import { MembershipPlansList } from "@/components/membership-plans-list"
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users, Zap } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Membership Plans | Join Our Community | Our Love Connection',
  description: 'Explore our membership plans and unlock exclusive benefits. Get premium access to events, advanced matching, messaging, and VIP features.',
  keywords: 'membership plans, premium membership, dating membership, membership benefits, subscription plans, exclusive dating access',
  openGraph: {
    title: 'Membership Plans | Join Our Community | Our Love Connection',
    description: 'Explore our membership plans and unlock exclusive benefits with premium features.',
    url: 'https://ourloveconnection.com/membership',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Membership Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Membership Plans | Join Our Community | Our Love Connection',
    description: 'Explore our membership plans and unlock exclusive benefits with premium features.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com/membership',
  },
}

export default async function MembershipPage() {
  const supabase = await createClient()

  // Fetch initial 6 active membership plans
  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("status", "active")
    .order("price", { ascending: true })
    .limit(6)

  return (
    <PublicPageLayout>
      <MembershipHero />
      <MembershipPlansList initialPlans={plans || []} />
      
      {/* Internal Linking Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Maximize Your Connection Experience</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-6 w-6 text-rose-600 mb-2" />
                <CardTitle>Matchmaking</CardTitle>
                <CardDescription>Use our AI to find compatible matches</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/matchmaking">Explore Matches →</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle>Social Events</CardTitle>
                <CardDescription>Meet singles in person at our events</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/events">View Events →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
