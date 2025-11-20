import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"

export default async function CreateCategoryPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Create Category</h1>
        <p className="text-muted-foreground">Add a new event category</p>
      </div>

      <CategoryForm mode="create" />
    </div>
  )
}
