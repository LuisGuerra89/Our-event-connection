import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EditSubscriptionPlanForm } from "@/components/admin/edit-subscription-plan-form"

export default async function EditSubscriptionPlanPage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: plan } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("id", params.id)
    .single()

  if (!plan) redirect("/admin/subscriptions")

  return <EditSubscriptionPlanForm plan={plan} />
}
