import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { EnumsTable } from "@/components/admin/enums-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function EnumsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role_id").eq("id", user.id).single()

  if (!profile?.role_id) redirect("/dashboard")

  const { data: role } = await supabase.from("roles").select("role_name").eq("id", profile.role_id).single()

  if (role?.role_name !== "admin") redirect("/dashboard")

  const { data: enums } = await supabase.from("enums").select("*").order("enum_type").order("display_order")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Enums Management</h1>
          <p className="text-muted-foreground">Manage dropdown values and system enums</p>
        </div>
        <Button asChild>
          <Link href="/admin/enums/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Enum
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Enums</CardTitle>
          <CardDescription>System enums for dropdowns and selections</CardDescription>
        </CardHeader>
        <CardContent>
          <EnumsTable enums={enums || []} />
        </CardContent>
      </Card>
    </div>
  )
}
