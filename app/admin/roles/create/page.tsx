import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateRoleForm } from "@/components/admin/create-role-form"

export default async function CreateRolePage() {
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Create Role</h1>
        <p className="text-muted-foreground">Add a new role to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Role Details</CardTitle>
          <CardDescription>Enter the details for the new role</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateRoleForm />
        </CardContent>
      </Card>
    </div>
  )
}
