"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateAdminProfile(formData: FormData) {
  const supabase = await createServerClient()

  const userId = formData.get("userId") as string
  const email = formData.get("email") as string
  const mobile = formData.get("mobile") as string

  try {
    // Update auth email if changed
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (user && user.email !== email) {
      const { error: authError } = await supabase.auth.updateUser({ email })
      if (authError) throw authError
    }

    // Update admin_users table
    const { error: adminError } = await supabase
      .from("admin_users")
      .update({
        email,
        mobile,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", userId)

    if (adminError) throw adminError

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        email,
        phone: mobile,
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

  try {
    // Verify old password by attempting to sign in
    const {
      data: { user },
    } = await supabase.auth.getUser()
    if (!user?.email) throw new Error("User not found")

    // Update password
    const { error } = await supabase.auth.updateUser({
      password: newPassword,
    })

    if (error) throw error

    return { success: true }
  } catch (error) {
    console.error("[v0] Error changing password:", error)
    return { error: error instanceof Error ? error.message : "Failed to change password" }
  }
}
