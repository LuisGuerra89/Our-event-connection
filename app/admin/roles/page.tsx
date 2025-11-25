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

  // Get role IDs from database
  // admin = "admin", moderator = "moderator", user = "user"
  const roleMapping = {
    'admin': 'admin',
    'moderator': 'moderator',
    'user': 'user'
  }

  // Get user counts by role from profiles table
  let rolesWithCount = []
  
  // Count admins
  const { count: adminCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "admin")
  
  // Count moderators
  const { count: moderatorCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "moderator")
  
  // Count regular users
  const { count: userCount } = await supabase
    .from("profiles")
    .select("*", { count: "exact", head: true })
    .eq("role", "user")

  rolesWithCount = [
    {
      id: "1",
      role_name: "Admin",
      description: "System administrator",
      status: "active",
      created_at: new Date().toISOString(),
      profiles: [{ count: adminCount || 0 }]
    },
    {
      id: "2",
      role_name: "Moderator",
      description: "Content moderator",
      status: "active",
      created_at: new Date().toISOString(),
      profiles: [{ count: moderatorCount || 0 }]
    },
    {
      id: "3",
      role_name: "User",
      description: "Regular user",
      status: "active",
      created_at: new Date().toISOString(),
      profiles: [{ count: userCount || 0 }]
    }
  ]

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
