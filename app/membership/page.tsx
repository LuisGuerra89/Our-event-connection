import type { Metadata } from 'next'
import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { MembershipHero } from "@/components/membership-hero"
import { MembershipPlansList } from "@/components/membership-plans-list"

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
    </PublicPageLayout>
  )
}
