import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailTemplateForm } from "@/components/admin/email-template-form"

export default async function EditEmailTemplatePage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(role_name)")
    .eq("id", user.id)
    .single()

  const isAdmin = profile?.roles && typeof profile.roles === 'object' && 'role_name' in profile.roles 
    ? profile.roles.role_name === "admin" 
    : false

  if (!isAdmin) redirect("/dashboard")

  const { data: template } = await supabase
    .from("email_templates")
    .select("*")
    .eq("id", id)
    .single()

  if (!template) redirect("/admin/email-templates")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Email Template</h1>
        <p className="text-muted-foreground">Update the email template details</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Template Details</CardTitle>
          <CardDescription>Edit the email template information</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailTemplateForm template={template} />
        </CardContent>
      </Card>
    </div>
  )
}
