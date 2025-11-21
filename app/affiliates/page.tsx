import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { AffiliatesHero } from "@/components/affiliates-hero"
import { AffiliatesList } from "@/components/affiliates-list"

export default async function AffiliatesPage() {
  const supabase = await createClient()

  // Fetch initial 9 approved affiliates
  const { data: affiliates } = await supabase
    .from("affiliates")
    .select("*")
    .eq("approval_status", "approved")
    .order("total_referrals", { ascending: false })
    .limit(9)

  return (
    <PublicPageLayout>
      <AffiliatesHero />
      <AffiliatesList initialAffiliates={affiliates || []} />
    </PublicPageLayout>
  )
}
