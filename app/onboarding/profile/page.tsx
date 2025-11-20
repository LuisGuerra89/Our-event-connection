import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ProfileForm } from "@/components/profile-form"

export default async function ProfilePage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Check if user signed waiver
  const { data: waiver } = await supabase.from("waivers").select("id").eq("user_id", data.user.id).maybeSingle()

  if (!waiver) {
    redirect("/onboarding/waiver")
  }

  // Fetch existing profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  return (
    <div className="min-h-svh bg-background py-8">
      <div className="container mx-auto px-4 max-w-4xl">
        <ProfileForm userId={data.user.id} existingProfile={profile} />
      </div>
    </div>
  )
}
