import { redirect, notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PublicPageLayout } from "@/components/public-page-layout"
import { MembershipDetailCard } from "@/components/membership-detail-card"

export default async function MembershipDetailPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createClient()

  // Get user (required for subscription)
  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect(`/auth/login?redirect=/membership/${id}`)
  }

  // Fetch membership plan
  const { data: plan, error: planError } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", id)
    .eq("status", "active")
    .single()

  if (planError || !plan) {
    notFound()
  }

  // Check if user already has an active subscription for this plan
  const { data: existingSubscription } = await supabase
    .from("user_subscriptions")
    .select("*")
    .eq("user_id", user.id)
    .eq("plan_id", id)
    .eq("status", "active")
    .single()

  // Get user profile for referral info
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_count, free_events_earned")
    .eq("id", user.id)
    .single()

  return (
    <PublicPageLayout>
      <MembershipDetailCard
        plan={plan}
        userId={user.id}
        existingSubscription={existingSubscription}
        referralCount={profile?.referral_count || 0}
        freeEventsEarned={profile?.free_events_earned || 0}
      />
    </PublicPageLayout>
  )
}
