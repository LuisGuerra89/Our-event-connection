import { createServerClient } from "@/lib/supabase/server"
import { redirect, notFound } from "next/navigation"
import { CategoryForm } from "@/components/admin/category-form"

export default async function EditCategoryPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: category } = await supabase.from("event_categories").select("*").eq("id", id).single()

  if (!category) notFound()

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Edit Category</h1>
        <p className="text-muted-foreground">Update category details</p>
      </div>

      <CategoryForm mode="edit" category={category} />
    </div>
  )
}
