import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  console.log("[v0] Auth callback received, code:", code ? "present" : "missing")

  if (code) {
    const supabase = await createServerClient()

    try {
      const { error } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.log("[v0] Error exchanging code for session:", error.message)
        return NextResponse.redirect(new URL("/auth/error", request.url))
      }

      console.log("[v0] Successfully exchanged code for session")

      // Get user and check profile completion
      const { data: { user } } = await supabase.auth.getUser()
      
      if (user) {
        const { data: profile } = await supabase
          .from("profiles")
          .select("is_profile_complete")
          .eq("id", user.id)
          .single()

        // If social login user hasn't completed profile, redirect to complete profile page
        if (profile && profile.is_profile_complete === false) {
          return NextResponse.redirect(new URL("/onboarding/complete-profile", request.url))
        }

        // Check if user has completed waiver
        const { data: waiver } = await supabase
          .from("waivers")
          .select("id")
          .eq("user_id", user.id)
          .maybeSingle()

        if (!waiver) {
          return NextResponse.redirect(new URL("/onboarding/waiver", request.url))
        }

        // User has completed everything, go to dashboard
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
