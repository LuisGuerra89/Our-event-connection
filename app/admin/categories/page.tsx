import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CategoriesTable } from "@/components/admin/categories-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function CategoriesPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: categories } = await supabase.from("event_categories").select("*").order("display_order")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Event Categories</h1>
          <p className="text-muted-foreground">Manage event categories</p>
        </div>
        <Button asChild>
          <Link href="/admin/categories/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Category
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Categories</CardTitle>
          <CardDescription>Organize events by categories</CardDescription>
        </CardHeader>
        <CardContent>
          <CategoriesTable categories={categories || []} />
        </CardContent>
      </Card>
    </div>
  )
}
