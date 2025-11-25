import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"
import { getUserPrivileges } from "@/lib/auth-utils"

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
    .select("role_id, roles(role_name), full_name, email")
    .eq("id", data.user.id)
    .single()

  // Type assertion for the joined data
  const profileWithRole = profile as {
    role_id: string;
    roles: { role_name: string };
    full_name: string | null;
    email: string;
  } | null

  const userRole = profileWithRole?.roles?.role_name

  // Verify user is admin or moderator
  if (!userRole || (userRole !== "admin" && userRole !== "moderator")) {
    redirect("/dashboard")
  }

  // Get user privileges
  const privileges = await getUserPrivileges(data.user.id)

  return (
    <AdminLayoutClient
      userRole={userRole}
      userName={profileWithRole?.full_name || data.user.email?.split("@")[0]}
      userEmail={data.user.email}
      userPrivileges={privileges}
    >
      {children}
    </AdminLayoutClient>
  )
}
