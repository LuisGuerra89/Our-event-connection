import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { EnhancedProfileForm } from "@/components/enhanced-profile-form"

export default async function EditProfilePage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("*").eq("id", user.id).single()

  const { data: countries } = await supabase.from("countries").select("id, name").eq("status", "active").order("name")

  const { data: enums } = await supabase.from("enums").select("*").eq("status", "active")

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Edit Profile</h1>
        <EnhancedProfileForm profile={profile} countries={countries || []} enums={enums || []} />
      </div>
    </div>
  )
}
