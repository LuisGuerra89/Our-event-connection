import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { PreferencesForm } from "@/components/preferences-form"

export default async function PreferencesPage() {
  const supabase = await createClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle()

  return (
    <div className="min-h-svh bg-background py-8">
      <div className="container mx-auto px-4 max-w-5xl">
        <PreferencesForm userId={data.user.id} existingPreferences={preferences} />
      </div>
    </div>
  )
}
