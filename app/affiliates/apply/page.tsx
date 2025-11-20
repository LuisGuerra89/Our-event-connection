import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { BecomeAffiliateForm } from "@/components/become-affiliate-form"

export default async function ApplyAffiliatePage() {
  const supabase = await createClient()

  // Require authentication
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/auth/login?redirect=/affiliates/apply")
  }

  // Get user profile
  const { data: profile } = await supabase
    .from("profiles")
    .select("*")
    .eq("id", user.id)
    .single()

  // Check if user already has an affiliate application
  const { data: existingAffiliate } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single()

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
