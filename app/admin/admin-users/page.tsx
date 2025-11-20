import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminUsersManagementPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles!profiles_role_id_fkey(role_name)")
    .eq("id", user.id)
    .single()

  const userRole = profile?.roles?.role_name

  if (userRole !== "admin" && userRole !== "moderator") {
    redirect("/dashboard")
  }

  // Get admin and moderator roles
  const { data: adminRoles } = await supabase
    .from("roles")
    .select("id, role_name")
    .in("role_name", ["admin", "moderator"])

  const adminRoleIds = adminRoles?.map((r) => r.id) || []

  // Fetch admin users with admin or moderator roles
  const { data: adminUsers, error } = await supabase
    .from("admin_users")
    .select(`
      *,
      roles (
        id,
        role_name
      )
    `)
    .in("role_id", adminRoleIds)
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Admin Users</h1>
          <p className="text-muted-foreground">Manage admin user accounts</p>
        </div>
        <Button asChild>
          <Link href="/admin/admin-users/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Admin User
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Admin Users</CardTitle>
          <CardDescription>View and manage admin accounts</CardDescription>
        </CardHeader>
        <CardContent>
          <AdminUsersTable adminUsers={adminUsers || []} />
        </CardContent>
      </Card>
    </div>
  )
}
