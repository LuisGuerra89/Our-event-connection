import type React from "react"
import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { AdminLayoutClient } from "@/components/admin/admin-layout-client"
import RecalculateMatchesOnMount from "@/components/dashboard/recalculate-matches-on-mount"

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
    .select("role_id, full_name, email, profile_image_url, roles(role_name)")
    .eq("id", data.user.id)
    .single()

  return (
    <div className="flex flex-col h-screen">
      {/* Recalculate matches whenever user enters dashboard */}
      <RecalculateMatchesOnMount />
      
      <div className="flex-1 overflow-hidden">
        <AdminLayoutClient
          userRole={(profile?.roles as { role_name: string } | null)?.role_name}
          userName={profile?.full_name || data.user.email?.split("@")[0]}
          userEmail={data.user.email}
          userImage={profile?.profile_image_url}
        >
          {children}
        </AdminLayoutClient>
      </div>
    </div >
  )
}
