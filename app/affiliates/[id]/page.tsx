import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { AffiliateProfile } from "@/components/affiliate-profile"

export default async function AffiliateDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Fetch affiliate with profile data
  const { data: affiliate, error } = await supabase
    .from("affiliates")
    .select(`
      *,
      profile:profiles(
        full_name,
        email,
        profile_photo_url,
        referral_code,
        referral_count,
        free_events_earned,
        created_at
      )
    `)
    .eq("id", id)
    .single()

  if (error || !affiliate) {
    notFound()
  }

  // Only show if approved (or if admin/owner)
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  const isOwner = user?.id === affiliate.user_id
  const isAdmin = false // Could check admin role here

  if (affiliate.approval_status !== "approved" && !isOwner && !isAdmin) {
    notFound()
  }

  return (
    <PublicPageLayout>
      <AffiliateProfile affiliate={affiliate} isOwner={isOwner} />
    </PublicPageLayout>
  )
}
