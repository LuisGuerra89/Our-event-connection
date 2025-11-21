import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { BecomeAffiliateForm } from "@/components/become-affiliate-form"

export default async function ApplyAffiliatePage() {
  const supabase = await createClient()

  // Require authentication
  const { data: authData } = await supabase.auth.getUser()
  const user = authData?.user

  if (!user) {
    redirect("/auth/login?redirect=/affiliates/apply")
  }

  console.log("=== ApplyAffiliatePage Debug ===")
  console.log("User ID:", user.id)

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if user already has an affiliate application
  const { data: affiliatesData, error: affiliateError } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .order("application_date", { ascending: false })

  console.log("Affiliate Query Error:", affiliateError)
  console.log("Affiliates Data:", affiliatesData)
  console.log("Affiliates Count:", affiliatesData?.length)

  // Prioritize pending applications, then approved, then rejected
  let existingAffiliate = null
  if (affiliatesData && affiliatesData.length > 0) {
    // First, try to find a pending application
    existingAffiliate = affiliatesData.find((a) => a.approval_status === "pending")
    
    // If no pending, use the first one (most recent)
    if (!existingAffiliate) {
      existingAffiliate = affiliatesData[0]
    }
  }

  console.log("Existing Affiliate:", existingAffiliate)
  console.log("=== End Debug ===")

  return (
    <PublicPageLayout>
      <BecomeAffiliateForm 
        userId={user.id} 
        profile={profile}
        existingAffiliate={existingAffiliate}
      />
    </PublicPageLayout>
  )
}
