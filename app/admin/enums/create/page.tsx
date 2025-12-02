import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnumForm } from "@/components/admin/enum-form"

export default async function CreateEnumPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role_id, roles(role_name)").eq("id", user.id).single()

  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") redirect("/dashboard")

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Enum</h1>
        <p className="text-muted-foreground">Add a new enum value to the system</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enum Details</CardTitle>
          <CardDescription>Fill in the information for the new enum value</CardDescription>
        </CardHeader>
        <CardContent>
          <EnumForm />
        </CardContent>
      </Card>
    </div>
  )
}
