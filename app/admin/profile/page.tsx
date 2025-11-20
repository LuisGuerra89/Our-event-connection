import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditProfileForm } from "@/components/admin/edit-profile-form"

export default async function AdminProfilePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  if (profile?.role !== "admin") {
    redirect("/dashboard")
  }

  const { data: adminUser } = await supabase.from("admin_users").select("*").eq("user_id", user.id).maybeSingle()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Profile</h1>
        <p className="text-muted-foreground">Update your profile information</p>
      </div>

      <div className="grid gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Profile Information</CardTitle>
            <CardDescription>Update your personal details</CardDescription>
          </CardHeader>
          <CardContent>
            <EditProfileForm userId={user.id} profile={profile} adminUser={adminUser} userEmail={user.email || ""} />
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
