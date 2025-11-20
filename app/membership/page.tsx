import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { MembershipHero } from "@/components/membership-hero"
import { MembershipPlansList } from "@/components/membership-plans-list"

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
