
"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string,
  referralCode?: string
) {
  try {
    const supabase = await createServerClient()

    console.log("[v0] Creating profile for user:", userId, email)

    // Check if profile already exists
    const { data: existingProfile } = await supabase
      .from("profiles")
      .select("id")
      .eq("id", userId)
      .maybeSingle()

    if (existingProfile) {
      console.log("[v0] Profile already exists for user:", userId)
      return { success: true, message: "Profile already exists" }
    }

    // Check if email already exists (duplicate check)
    const { data: existingEmail } = await supabase
      .from("profiles")
      .select("id, email")
      .eq("email", email)
      .maybeSingle()

    if (existingEmail) {
      console.log("[v0] Email already registered:", email)
      // Delete the auth user since email is duplicate
      await supabase.auth.admin.deleteUser(userId)
      throw new Error("Email already registered")
    }

    // Create user profile
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .insert({
        id: userId,
        email,
        full_name: fullName,
        is_profile_complete: false,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })
      .select()
      .single()

    if (profileError) {
      console.error("[v0] Error creating profile:", profileError)
      throw profileError
    }

    console.log("[v0] Profile created successfully:", profile.id)

    // Handle referral if provided
    if (referralCode) {
      try {
        // Find the referrer by barcode
        const { data: referrer } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", referralCode.toUpperCase())
          .maybeSingle()

        if (referrer) {
          console.log("[v0] Creating referral record from barcode:", referralCode)
          
          await supabase.from("referrals").insert({
            referrer_id: referrer.id,
            referred_id: userId,
            barcode: referralCode.toUpperCase(),
            status: "completed",
            reward_given: false,
          })
        }
      } catch (referralError) {
        console.log("[v0] Referral processing error (non-fatal):", referralError)
      }
    }

    return { success: true, profile }
  } catch (error) {
    console.error("[v0] Error in createUserProfile:", error)
    throw error
  }
}
