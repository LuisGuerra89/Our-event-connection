import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EmailTemplatesTable } from "@/components/admin/email-templates-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function EmailTemplatesPage() {
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

  const { data: templates } = await supabase
    .from("email_templates")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Email Templates</h1>
          <p className="text-muted-foreground">Manage email templates for notifications</p>
        </div>
        <Button asChild>
          <Link href="/admin/email-templates/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Template
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Templates</CardTitle>
          <CardDescription>Email templates for system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <EmailTemplatesTable templates={templates || []} />
        </CardContent>
      </Card>
    </div>
  )
}
