import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolesTable } from "@/components/admin/roles-table"
import { isAdmin } from "@/lib/auth-utils"

export default async function AdminRolesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if user is admin
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(role_name)")
    .eq("id", user.id)
    .single()

  // Check if user is admin
  const isAdminUser = profile?.roles && typeof profile.roles === 'object' && 'role_name' in profile.roles 
    ? profile.roles.role_name === "admin" 
    : false

  if (!isAdminUser) {
    redirect("/dashboard")
  }

  // Get user counts by role from profiles table using role_id and roles join
  let rolesWithCount = []
  
  // Fetch all roles first
  const { data: allRoles } = await supabase
    .from("roles")
    .select("*")
    .eq("status", "active")
    .order("role_name")
  
  // Count users for each role
  if (allRoles) {
    rolesWithCount = await Promise.all(
      allRoles.map(async (role) => {
        const { count } = await supabase
          .from("profiles")
          .select("*", { count: "exact", head: true })
          .eq("role_id", role.id)
        
        return {
          ...role,
          user_count: count || 0
        }
      })
    )
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Roles Management</h1>
          <p className="text-muted-foreground">Manage user roles and permissions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Roles</CardTitle>
          <CardDescription>View and manage system roles</CardDescription>
        </CardHeader>
        <CardContent>
          <RolesTable roles={rolesWithCount} />
        </CardContent>
      </Card>
    </div>
  )
}
