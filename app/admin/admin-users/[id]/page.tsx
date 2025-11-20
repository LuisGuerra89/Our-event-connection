import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditAdminUserForm } from "@/components/admin/edit-admin-user-form"

export default async function EditAdminUserPage({ params }: { params: Promise<{ id: string }> }) {
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
    .select("role_id, roles:roles!profiles_role_id_fkey(role_name)")
    .eq("id", user.id)
    .single()

  const userRole = (profile?.roles as any)?.role_name

  if (userRole !== "admin" && userRole !== "moderator") {
    redirect("/dashboard")
  }

  // Fetch the admin user to edit
  const { data: adminUser, error } = await supabase
    .from("admin_users")
    .select(`
      *,
      roles (
        id,
        role_name
      )
    `)
    .eq("id", id)
    .single()

  if (error || !adminUser) {
    notFound()
  }

  // Fetch only admin and moderator roles
  const { data: roles } = await supabase
    .from("roles")
    .select("*")
    .in("role_name", ["admin", "moderator"])
    .eq("status", "active")
    .order("role_name")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Admin User</h1>
        <p className="text-muted-foreground">Update admin user account details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Admin User Details</CardTitle>
          <CardDescription>Update the details for this admin user</CardDescription>
        </CardHeader>
        <CardContent>
          <EditAdminUserForm adminUser={adminUser} roles={roles || []} />
        </CardContent>
      </Card>
    </div>
  )
}
