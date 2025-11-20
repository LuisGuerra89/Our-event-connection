import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { RecipientsTable } from "@/components/admin/recipients-table"

export default async function RecipientsPage() {
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

  const { data: recipients } = await supabase
    .from("email_recipients")
    .select("*, email_templates(template_name)")
    .order("created_at", { ascending: false })

  const { data: templates } = await supabase.from("email_templates").select("id, template_name").eq("status", "active")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Recipients Management</h1>
        <p className="text-muted-foreground">Manage email recipients for templates</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Recipients</CardTitle>
          <CardDescription>Email recipients for template distribution</CardDescription>
        </CardHeader>
        <CardContent>
          <RecipientsTable recipients={recipients || []} templates={templates || []} />
        </CardContent>
      </Card>
    </div>
  )
}
