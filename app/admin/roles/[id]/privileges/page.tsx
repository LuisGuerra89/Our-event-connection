import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RolePrivilegesManager } from "@/components/admin/role-privileges-manager"

export default async function RolePrivilegesPage({ params }: { params: Promise<{ id: string }> }) {
  // Unwrap params Promise
  const { id } = await params
  
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

  // Fetch role details
  const { data: role } = await supabase.from("roles").select("*").eq("id", id).single()

  if (!role) {
    redirect("/admin/roles")
  }

  // Fetch all privileges
  const { data: allPrivileges } = await supabase.from("privileges").select("*").order("module_name")

  // Fetch role's current privileges
  const { data: rolePrivileges } = await supabase
    .from("role_privileges")
    .select("privilege_id")
    .eq("role_id", id)

  const assignedPrivilegeIds = rolePrivileges?.map((rp) => rp.privilege_id) || []

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Manage Privileges - {role.role_name}</h1>
        <p className="text-muted-foreground">Assign or remove privileges for this role</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Privileges</CardTitle>
          <CardDescription>Select the privileges this role should have access to</CardDescription>
        </CardHeader>
        <CardContent>
          <RolePrivilegesManager
            roleId={id}
            allPrivileges={allPrivileges || []}
            assignedPrivilegeIds={assignedPrivilegeIds}
          />
        </CardContent>
      </Card>
    </div>
  )
}
