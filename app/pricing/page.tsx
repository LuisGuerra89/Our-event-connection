import type { Metadata } from 'next'
import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { PricingPlansList } from "@/components/pricing-plans-list"

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
      <PricingPlansList initialPlans={plans || []} />
    </PublicPageLayout>
  )
}
