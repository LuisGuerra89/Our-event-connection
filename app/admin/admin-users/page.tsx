import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AdminUsersTable } from "@/components/admin/admin-users-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"
import { isAdmin } from "@/lib/auth-utils"

export default async function AdminUsersManagementPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin or moderator
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase.from("profiles").select("role_id, roles(role_name)").eq("id", user.id).single()
  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  const userRole = profileWithRole?.roles?.role_name
  if (!userRole || (userRole !== "admin" && userRole !== "moderator")) {
    redirect("/dashboard")
  }

  // Fetch users with admin or moderator roles from profiles
  const { data: adminUsersRaw, error } = await supabase
    .from("profiles")
    .select("id, full_name, email, role_id, status, created_at, roles(role_name)")
    .eq("status", "active")
    .order("created_at", { ascending: false })

  // Filter to only include admin and moderator users
  const adminUsers = adminUsersRaw
    ?.filter((user: any) => {
      const roleName = user.roles?.role_name
      return roleName === "admin" || roleName === "moderator"
    })
    .map((user: any) => ({
      ...user,
      role: user.roles?.role_name || "user",
    })) || []

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
