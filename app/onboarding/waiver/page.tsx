import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { WaiverForm } from "@/components/waiver-form"

export default async function WaiverPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()

  console.log("[v0] Waiver page - User check:", {
    hasUser: !!data?.user,
    userId: data?.user?.id,
    error: error?.message,
  })

  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: existingWaiver, error: waiverError } = await supabase
    .from("waivers")
    .select("id")
    .eq("user_id", data.user.id)
    .maybeSingle()

  console.log("[v0] Waiver page - Waiver check:", {
    hasWaiver: !!existingWaiver,
    waiverId: existingWaiver?.id,
    error: waiverError?.message,
  })

  if (existingWaiver) {
    console.log("[v0] Waiver page - Waiver exists, checking if questionnaire completed")
    
    // Check if questionnaire is completed
    const { data: profile } = await supabase
      .from("profiles")
      .select("questionnaire_completed")
      .eq("id", data.user.id)
      .single()
    
    if (profile?.questionnaire_completed) {
      console.log("[v0] Waiver page - Questionnaire completed, redirecting to dashboard")
      redirect("/dashboard")
    } else {
      console.log("[v0] Waiver page - Questionnaire not completed, redirecting to wizard")
      redirect("/onboarding/complete-profile")
    }
  }

  console.log("[v0] Waiver page - Showing waiver form")

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <WaiverForm userId={data.user.id} userEmail={data.user.email || ""} />
      </div>
    </div>
  )
}
