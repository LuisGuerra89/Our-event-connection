import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { UserManagementTable } from "@/components/admin/user-management-table"

export default async function AdminUsersPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()

  // Get user role (not admin, not moderator)
  const { data: userRole } = await supabase
    .from("roles")
    .select("id")
    .eq("role_name", "user")
    .single()

  // Fetch only regular users (not admin or moderators)
  const { data: users } = await supabase
    .from("profiles")
    .select(`
      *,
      roles!profiles_role_id_fkey(id, role_name, description)
    `)
    .eq("role_id", userRole?.id)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">User Management</h1>
        <p className="text-muted-foreground">View and manage all platform users</p>
      </div>

      <UserManagementTable users={users || []} />
    </div>
  )
}
