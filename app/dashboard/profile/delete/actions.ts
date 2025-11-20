"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteAccount(formData: FormData) {
  const supabase = await createServerClient()

  const password = formData.get("password") as string

  if (!password) {
    return { error: "Password is required" }
  }

  // Get current user
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    return { error: "Not authenticated" }
  }

  // Verify password by attempting to sign in
  const { error: signInError } = await supabase.auth.signInWithPassword({
    email: user.email!,
    password,
  })

  if (signInError) {
    return { error: "Incorrect password" }
  }

  // Update profile status to inactive instead of hard delete (per requirements)
  const { error: updateError } = await supabase
    .from("profiles")
    .update({ status: "inactive", updated_at: new Date().toISOString() })
    .eq("id", user.id)

  if (updateError) {
    console.error("[v0] Delete account error:", updateError)
    return { error: "Failed to deactivate account" }
  }

  // Sign out the user
  await supabase.auth.signOut()

  revalidatePath("/")

  return { success: true }
}
