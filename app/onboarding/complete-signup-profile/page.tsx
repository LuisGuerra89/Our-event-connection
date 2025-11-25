import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { CompleteSignupProfileForm } from "@/components/complete-signup-profile-form"

export default async function CompleteSignupProfilePage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  return <CompleteSignupProfileForm userId={data.user.id} />
}
