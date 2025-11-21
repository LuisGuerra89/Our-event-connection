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

  // Only load existing affiliate if status is "pending" (for editing)
  // If approved, allow them to create a new application
  let existingAffiliate = null
  if (affiliatesData && affiliatesData.length > 0) {
    const pendingAffiliate = affiliatesData.find((a) => a.approval_status === "pending")
    if (pendingAffiliate) {
      existingAffiliate = pendingAffiliate
    }
    // If no pending, pass the approved one to show info (but user can create new)
    // but don't set existingAffiliate so it treats it as a new form
  }

  console.log("Existing Affiliate (pending only):", existingAffiliate)
  console.log("All Affiliates:", affiliatesData)
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
