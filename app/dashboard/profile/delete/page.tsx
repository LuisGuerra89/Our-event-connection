import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { DeleteAccountForm } from "@/components/delete-account-form"

export default async function DeleteAccountPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("email, full_name").eq("id", user.id).single()

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-2xl mx-auto">
        <h1 className="text-3xl font-bold mb-6 text-destructive">Delete Account</h1>
        <DeleteAccountForm userEmail={profile?.email || user.email || ""} />
      </div>
    </div>
  )
}
