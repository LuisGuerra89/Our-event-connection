import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AffiliatesTable } from "@/components/admin/affiliates-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AffiliatesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role_id, roles(role_name)").eq("id", user.id).single()
  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") redirect("/dashboard")

  const { data: affiliates } = await supabase.from("affiliates").select("*").order("created_at", { ascending: false })

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Partners Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Review and manage business partner applications</p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/admin/affiliates/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Partner
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Partners</CardTitle>
          <CardDescription>Review applications and manage approved partners</CardDescription>
        </CardHeader>
        <CardContent>
          <AffiliatesTable affiliates={affiliates || []} />
        </CardContent>
      </Card>
    </div>
  )
}
