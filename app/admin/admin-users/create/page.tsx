import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateAdminUserForm } from "@/components/admin/create-admin-user-form"

export default async function CreateAdminUserPage() {
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

  // Type assertion for the joined data
  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null

  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Add Admin User</h1>
        <p className="text-muted-foreground">Create a new admin user account</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin User Details</CardTitle>
          <CardDescription>Fill in the details to create a new admin user</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateAdminUserForm />
        </CardContent>
      </Card>
    </div>
  )
}
