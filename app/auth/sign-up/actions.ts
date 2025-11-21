
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
        // Find the referrer by referral_code
        const { data: referrer, error: referrerError } = await supabase
          .from("profiles")
          .select("id")
          .eq("referral_code", referralCode.toUpperCase())
          .maybeSingle()

        if (referrerError) {
          console.log("[v0] Error looking up referrer:", referrerError)
          return { success: true, profile, warning: "Referral code validation failed" }
        }

        if (referrer) {
          console.log("[v0] Found referrer for code:", referralCode, "referrer ID:", referrer.id)
          
          // Update the new user's referred_by field
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ referred_by: referrer.id })
            .eq("id", userId)
          
          if (updateError) {
            console.log("[v0] Error updating referred_by:", updateError)
          }
          
          // Create referral record
          const { error: refError } = await supabase
            .from("referrals")
            .insert({
              referrer_id: referrer.id,
              referred_id: userId,
              barcode: referralCode.toUpperCase(),
              status: "completed",
              reward_given: false,
            })
          
          if (refError) {
            console.log("[v0] Error creating referral record:", refError)
          } else {
            console.log("[v0] Referral record created successfully")
          }
        } else {
          console.log("[v0] No referrer found for code:", referralCode)
          return { success: true, profile, warning: "Referral code not found" }
        }
      } catch (referralError) {
        console.log("[v0] Referral processing error (non-fatal):", referralError)
        // Non-fatal error - profile was created successfully
        return { success: true, profile, warning: "Referral processing failed" }
      }
    }

    return { success: true, profile }
  } catch (error) {
    console.error("[v0] Error in createUserProfile:", error)
    throw error
  }
}
