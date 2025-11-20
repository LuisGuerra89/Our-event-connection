import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { AttributesForm } from "@/components/attributes-form"

export default async function AttributesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: attributes } = await supabase
    .from("user_attributes")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle()

  return (
    <div className="min-h-svh bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <AttributesForm userId={data.user.id} existingAttributes={attributes} />
      </div>
    </div>
  )
}
