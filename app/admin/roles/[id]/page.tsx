import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditRoleForm } from "@/components/admin/edit-role-form"

export default async function EditRolePage({ params }: { params: Promise<{ id: string }> }) {
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

  // Get role details
  const { data: role, error } = await supabase
    .from("roles")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !role) {
    redirect("/admin/roles")
  }

  // System roles cannot be edited
  const systemRoles = ["admin", "moderator", "user"]
  if (systemRoles.includes(role.role_name)) {
    redirect("/admin/roles")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Role</h1>
        <p className="text-muted-foreground">Update role details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>Edit the role information</CardDescription>
        </CardHeader>
        <CardContent>
          <EditRoleForm role={role} />
        </CardContent>
      </Card>
    </div>
  )
}
