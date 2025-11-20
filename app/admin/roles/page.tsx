import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolesTable } from "@/components/admin/roles-table"

export default async function AdminRolesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(role_name)")
    .eq("id", user.id)
    .single()

  // Check if user is admin
  const isAdmin = profile?.roles && typeof profile.roles === 'object' && 'role_name' in profile.roles 
    ? profile.roles.role_name === "admin" 
    : false

  if (!isAdmin) {
    redirect("/dashboard")
  }

  // Get roles
  const { data: roles, error: rolesError } = await supabase
    .from("roles")
    .select("*")
    .order("created_at", { ascending: false })

  // Get user count for each role
  let rolesWithCount = roles || []
  if (roles) {
    const countsPromises = roles.map(async (role) => {
      const { count } = await supabase
        .from("profiles")
        .select("*", { count: "exact", head: true })
        .eq("role_id", role.id)
      
      return {
        ...role,
        profiles: [{ count: count || 0 }]
      }
    })
    rolesWithCount = await Promise.all(countsPromises)
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
