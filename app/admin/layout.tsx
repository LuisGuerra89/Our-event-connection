import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"

export default async function AdminLayout({
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

  // Verify user is admin or moderator
  if (profile?.role !== "admin" && profile?.role !== "moderator") {
    redirect("/dashboard")
  }

  // Check admin_users status for active/inactive
  const { data: adminUser } = await supabase
    .from("admin_users")
    .select("id, status")
    .eq("user_id", data.user.id)
    .maybeSingle()

  // If admin exists in admin_users and is inactive, redirect to login
  if (adminUser && adminUser.status !== "active") {
    await supabase.auth.signOut()
    redirect("/auth/login")
  }

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
