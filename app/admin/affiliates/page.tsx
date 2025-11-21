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

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: affiliates } = await supabase.from("affiliates").select("*").order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Partners Management</h1>
          <p className="text-muted-foreground">Review and manage business partner applications</p>
        </div>
        <Button asChild>
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
