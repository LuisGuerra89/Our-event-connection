import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EditContentForm } from "@/components/admin/edit-content-form"

export default async function EditContentPage({ params }: { params: Promise<{ id: string }> }) {
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

  // Fetch the content page to edit
  const { data: contentPage, error } = await supabase
    .from("cms_content")
    .select("*")
    .eq("id", id)
    .single()

  if (error || !contentPage) {
    notFound()
  }

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Edit Content Page</h1>
        <p className="text-muted-foreground">Update the content for this page</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Page Content</CardTitle>
          <CardDescription>Edit the title, content, and status for this page</CardDescription>
        </CardHeader>
        <CardContent>
          <EditContentForm contentPage={contentPage} />
        </CardContent>
      </Card>
    </div>
  )
}
