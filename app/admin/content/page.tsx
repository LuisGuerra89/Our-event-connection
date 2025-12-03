import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContentTable } from "@/components/admin/content-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function ContentManagementPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Check if user is admin using the auth utility
  const adminCheck = await isAdmin(user.id)
  if (!adminCheck) redirect("/dashboard")

  const { data: content } = await supabase.from("cms_content").select("*").order("created_at", { ascending: false })

  return (
    <div className="container mx-auto p-4 md:p-8 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-3xl font-bold">Content Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Manage website pages and content</p>
        </div>
        <Button asChild className="w-full md:w-auto">
          <Link href="/admin/content/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Page
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Pages</CardTitle>
          <CardDescription>Manage website content pages</CardDescription>
        </CardHeader>
        <CardContent>
          <ContentTable content={content || []} />
        </CardContent>
      </Card>
    </div>
  )
}
