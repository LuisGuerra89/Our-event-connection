import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CreateContentForm } from "@/components/admin/create-content-form"

export default async function CreateContentPage() {
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

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Add Content Page</h1>
        <p className="text-muted-foreground">Create a new content page for the website</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Details</CardTitle>
          <CardDescription>Fill in the details to create a new content page</CardDescription>
        </CardHeader>
        <CardContent>
          <CreateContentForm />
        </CardContent>
      </Card>
    </div>
  )
}
