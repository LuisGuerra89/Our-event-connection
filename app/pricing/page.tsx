import { createServerClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { PricingPlansList } from "@/components/pricing-plans-list"

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
