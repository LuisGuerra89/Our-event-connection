import type { Metadata } from 'next'
import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { PricingCards } from "@/components/pricing-cards"
import { PricingComparisonTable } from "@/components/pricing-comparison-table"
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Heart, Users } from 'lucide-react'

export const metadata: Metadata = {
  title: 'Pricing Plans | Affordable Dating Solutions | Our Love Connection',
  description: 'Browse our transparent and affordable pricing plans. Choose the perfect plan for your dating journey with no hidden fees.',
  keywords: 'pricing plans, subscription pricing, dating subscription, affordable dating, membership cost, pricing comparison',
  openGraph: {
    title: 'Pricing Plans | Affordable Dating Solutions | Our Love Connection',
    description: 'Browse our transparent and affordable pricing plans with flexible options for every budget.',
    url: 'https://ourloveconnection.com/pricing',
    images: [
      {
        url: '/og-image.png',
        width: 1200,
        height: 630,
        alt: 'Pricing Plans',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Pricing Plans | Affordable Dating Solutions | Our Love Connection',
    description: 'Browse our transparent and affordable pricing plans with flexible options.',
    images: ['/og-image.png'],
  },
  alternates: {
    canonical: 'https://ourloveconnection.com/pricing',
  },
}

export default async function PricingPage() {
  const supabase = await createServerClient()

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("status", "active")
    .order("price", { ascending: true })

  return (
    <PublicPageLayout>
      <PricingCards initialPlans={plans || []} />
      
      {/* Comparison Table */}
      {plans && plans.length > 0 && (
        <PricingComparisonTable plans={plans} />
      )}
      
      {/* Internal Linking Section */}
      <section className="py-12 md:py-16 bg-slate-50">
        <div className="container mx-auto px-4">
          <h2 className="text-2xl md:text-3xl font-bold mb-8 text-center">Ready to Start Connecting?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Heart className="h-6 w-6 text-rose-600 mb-2" />
                <CardTitle>Explore Matchmaking</CardTitle>
                <CardDescription>Browse compatible matches with our AI-powered system</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/matchmaking">Start Matching →</Link>
                </Button>
              </CardContent>
            </Card>
            <Card className="hover:shadow-lg transition-shadow">
              <CardHeader>
                <Users className="h-6 w-6 text-blue-600 mb-2" />
                <CardTitle>Attend Events</CardTitle>
                <CardDescription>Meet singles in person at our social events</CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild variant="outline" className="w-full">
                  <Link href="/events">Browse Events →</Link>
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>
    </PublicPageLayout>
  )
}
