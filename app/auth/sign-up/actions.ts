
"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function createUserProfile(
  userId: string,
  email: string,
  fullName: string,
  referralCode?: string,
  profileImageUrl?: string
) {
  try {
    const supabase = await createServerClient()

    console.log("[v0] Processing profile for user:", userId, email)

    // Wait for the trigger to create the profile
    // The handle_new_user trigger creates the profile automatically
    // We need to wait a bit longer and retry if needed
    let profile = null
    let attempts = 0
    const maxAttempts = 5

    while (!profile && attempts < maxAttempts) {
      attempts++
      console.log(`[v0] Attempt ${attempts}/${maxAttempts} to find profile`)

      await new Promise((resolve) => setTimeout(resolve, 1000))

      const { data, error } = await supabase
        .from("profiles")
        .select("id, email, referral_code")
        .eq("id", userId)
        .maybeSingle()

      if (error) {
        console.error("[v0] Error checking for profile:", error)
      }

      profile = data
    }

    if (!profile) {
      console.error("[v0] Profile was not created by trigger after", maxAttempts, "attempts")
      console.error("[v0] This likely means the handle_new_user trigger is not working")
      throw new Error("Profile creation failed - trigger may not be installed")
    }

    console.log("[v0] Profile created by trigger:", profile.id)

    // Update profile with image URL if provided
    if (profileImageUrl) {
      const { error: imageError } = await supabase
        .from("profiles")
        .update({ profile_image_url: profileImageUrl })
        .eq("id", userId)

      if (imageError) {
        console.log("[v0] Warning: Failed to update profile image URL:", imageError)
      } else {
        console.log("[v0] Profile image URL updated successfully")
      }
    }

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
          // The database trigger (process_referral) will automatically:
          // 1. Create the referral record
          // 2. Increment the referrer's referral_count
          // 3. Award free events if milestone reached
          // 4. Create notification for referrer
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ referred_by: referrer.id })
            .eq("id", userId)

          if (updateError) {
            console.log("[v0] Error updating referred_by:", updateError)
            return { success: true, profile, warning: "Referral processing failed" }
          }

          console.log("[v0] Referral processed successfully - trigger will handle the rest")
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
