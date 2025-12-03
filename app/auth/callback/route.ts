import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")
  const ref = requestUrl.searchParams.get("ref") // Get referral code from URL

  console.log("[v0] Auth callback received, code:", code ? "present" : "missing", "referral:", ref || "none")

  if (code) {
    const supabase = await createServerClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.log("[v0] Error exchanging code for session:", error.message)
        return NextResponse.redirect(new URL("/auth/error", request.url))
      }

      console.log("[v0] Successfully exchanged code for session")

      // Get user and update metadata with referral code if present
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user && ref) {
        console.log("[v0] Updating user metadata with referral code:", ref)
        
        // Update auth user metadata with referral code
        const { error: updateError } = await supabase.auth.updateUser({
          data: {
            referral_code: ref,
            ...(user.user_metadata || {})
          }
        })
        
        if (updateError) {
          console.log("[v0] Warning: Failed to update user metadata with referral code:", updateError)
        } else {
          console.log("[v0] Successfully updated user metadata with referral code")
        }
      }
      
      if (user) {
      const { data: profile, error: profileError } = await supabase
        .from("profiles")
        .select("questionnaire_completed, questionnaire_skipped, role_id, roles(role_name)")
        .eq("id", user.id)
        .maybeSingle()

      console.log("[v0] User profile retrieved:", { user_id: user.id, profile, error: profileError })

      // If user is admin or moderator, redirect to admin dashboard directly
      const profileWithRole = profile as { questionnaire_completed: boolean; questionnaire_skipped: boolean; roles: { role_name: string } | null } | null
      const roleName = profileWithRole?.roles?.role_name
      
      if (profile && (roleName === "admin" || roleName === "moderator")) {
        console.log("[v0] User is admin/moderator, redirecting to /admin")
        return NextResponse.redirect(new URL("/admin", request.url))
      }

      // If profile is not complete (social login) or was skipped, redirect to login for new email signups
      if (profile && (profile.questionnaire_completed === false || profile.questionnaire_skipped === true)) {
        console.log("[v0] Profile incomplete or skipped, redirecting to /auth/login")
        return NextResponse.redirect(new URL("/auth/login?message=Email confirmed successfully. Please log in.", request.url))
      }

        // Check if user has completed waiver
        const { data: waiver } = await supabase
          .from("waivers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        if (!waiver) {
          console.log("[v0] User has no waiver, redirecting to /onboarding/waiver")
          return NextResponse.redirect(new URL("/onboarding/waiver", request.url))
        }

        // User has completed everything, go to dashboard
        console.log("[v0] User profile complete, redirecting to /dashboard")
        return NextResponse.redirect(new URL("/dashboard", request.url))
      }

      // Fallback: redirect to waiver page
      return NextResponse.redirect(new URL("/onboarding/waiver", request.url))
    } catch (error) {
      console.log("[v0] Exception during code exchange:", error)
      return NextResponse.redirect(new URL("/auth/error", request.url))
    }
  }

  console.log("[v0] No code provided in callback")
  return NextResponse.redirect(new URL("/auth/error", request.url))
}
