import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export default async function AppLayout({
  children,
}: {
  children: React.ReactNode
}) {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role, full_name, email")
    .eq("id", data.user.id)
    .single()

  return (
    <AdminLayoutClient
      userRole={profile?.role}
      userName={profile?.full_name || data.user.email?.split("@")[0]}
      userEmail={data.user.email}
    >
      {children}
    </AdminLayoutClient>
  )
}
