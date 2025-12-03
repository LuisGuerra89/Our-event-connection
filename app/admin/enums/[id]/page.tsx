import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnumForm } from "@/components/admin/enum-form"

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function EditEnumPage({ params }: PageProps) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role_id, roles(role_name)").eq("id", user.id).single()

  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") redirect("/dashboard")

  const { data: enumData } = await supabase.from("enums").select("*").eq("id", id).single()

  if (!enumData) redirect("/admin/enums")

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">Edit Enum</h1>
        <p className="text-muted-foreground">Update enum value information</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Enum Details</CardTitle>
          <CardDescription>Modify the enum value information below</CardDescription>
        </CardHeader>
        <CardContent>
          <EnumForm initialData={enumData} />
        </CardContent>
      </Card>
    </div>
  )
}
