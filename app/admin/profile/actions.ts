"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateAdminProfile(formData: FormData) {
  const supabase = await createServerClient()

  const userId = formData.get("userId") as string
  const fullName = formData.get("fullName") as string
  const phone = formData.get("phone") as string
  const bio = formData.get("bio") as string
  const locationCity = formData.get("locationCity") as string
  const locationState = formData.get("locationState") as string
  const locationCountry = formData.get("locationCountry") as string

  try {
    // Get current user to check permissions
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user || user.id !== userId) {
      throw new Error("Unauthorized")
    }

    // Update profiles table with all fields
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        full_name: fullName || null,
        phone: phone || null,
        bio: bio || null,
        location_city: locationCity || null,
        location_state: locationState || null,
        location_country: locationCountry || null,
        updated_at: new Date().toISOString(),
      })
      .eq("id", userId)

    if (profileError) throw profileError

    revalidatePath("/admin/profile")
    return { success: true }
  } catch (error) {
    console.error("[v0] Error updating profile:", error)
    return { error: error instanceof Error ? error.message : "Failed to update profile" }
  }
}

export async function changePassword(formData: FormData) {
  const supabase = await createServerClient()

  const oldPassword = formData.get("oldPassword") as string
  const newPassword = formData.get("newPassword") as string
  const confirmPassword = formData.get("confirmPassword") as string

  if (newPassword !== confirmPassword) {
    return { error: "New passwords do not match" }
  }

  if (newPassword.length < 6) {
    return { error: "Password must be at least 6 characters long" }
  }

  if (oldPassword === newPassword) {
    return { error: "New password must be different from the old password" }
  }

  try {
    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) throw new Error("User not found")

    // Verify old password by attempting to sign in
    const { error: signInError } = await supabase.auth.signInWithPassword({
      email: user.email,
      password: oldPassword,
    })

    if (signInError) {
      return { error: "Current password is incorrect" }
    }

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    // Sign out user
    const { error: signOutError } = await supabase.auth.signOut()
    if (signOutError) {
      console.error("Sign out error:", signOutError)
      // Continue anyway, client will handle logout
    }

    return { success: true }
  } catch (error) {
    console.error("[v0] Error changing password:", error)
    return { error: error instanceof Error ? error.message : "Failed to change password" }
  }
}
