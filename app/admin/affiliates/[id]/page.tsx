import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import EditAffiliateClient from "./edit-client"

interface EditAffiliatePageProps {
  params: {
    id: string
  }
}

export default async function EditAffiliatePage({ params }: EditAffiliatePageProps) {
  const supabase = await createClient()

  const resolvedParams = await params

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role_id, roles(role_name)").eq("id", user.id).single()
  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") redirect("/dashboard")

  const { data: affiliate, error } = await supabase
    .from("affiliates")
    .select("*")
    .eq("id", resolvedParams.id)
    .single()

  if (error || !affiliate) {
    redirect("/admin/affiliates")
  }

  return <EditAffiliateClient affiliate={affiliate} affiliateId={resolvedParams.id} />
}
