import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SiteSettingsForm } from "@/components/admin/site-settings-form"

export default async function AdminSettingsPage() {
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

  const { data: settings } = await supabase.from("site_settings").select("*").order("setting_key")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-foreground">Site Settings</h1>
        <p className="text-muted-foreground">Manage SMTP configuration and other site settings</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>SMTP Configuration</CardTitle>
          <CardDescription>Configure email server settings for system notifications</CardDescription>
        </CardHeader>
        <CardContent>
          <SiteSettingsForm settings={settings || []} />
        </CardContent>
      </Card>
    </div>
  )
}
