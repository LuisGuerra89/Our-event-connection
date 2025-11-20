import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import CompleteProfileForm from "@/components/complete-profile-form"

export default async function CompleteProfilePage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  // Check if profile is already complete
  const { data: profile } = await supabase
    .from("profiles")
    .select("is_profile_complete, full_name, email")
    .eq("id", user.id)
    .single()

  if (profile?.is_profile_complete) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto max-w-2xl py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-bold">Complete Your Profile</h1>
        <p className="text-muted-foreground mt-2">
          Welcome! Please complete your profile to continue using the platform.
        </p>
      </div>

      <CompleteProfileForm 
        userId={user.id} 
        initialEmail={profile?.email || user.email || ""}
        initialFullName={profile?.full_name || ""}
      />
    </div>
  )
}
