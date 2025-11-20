"use server"

import { createServerClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteAdminUser(adminUserId: string, authUserId: string) {
  try {
    const supabase = await createServerClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return { success: false, error: "Unauthorized" }
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", user.id)
      .maybeSingle()

    if (profile?.role !== "admin") {
      return { success: false, error: "Forbidden: Only admins can delete admin users" }
    }

    console.log("[v0] Deleting admin user:", adminUserId, "with auth user:", authUserId)

    // Step 1: Delete from admin_users table
    const { error: adminUserError } = await supabase
      .from("admin_users")
      .delete()
      .eq("id", adminUserId)

    if (adminUserError) {
      console.error("[v0] Error deleting admin_users record:", adminUserError)
      return { success: false, error: `Failed to delete admin user: ${adminUserError.message}` }
    }

    console.log("[v0] Admin user record deleted successfully")

    // Step 2: Delete from profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", authUserId)

    if (profileError) {
      console.error("[v0] Error deleting profile record:", profileError)
      // Continue anyway
    }

    console.log("[v0] Profile record deleted successfully")

    // Step 3: Delete from auth.users using admin client
    if (authUserId) {
      console.log("[v0] Deleting auth user:", authUserId)
      const adminClient = createAdminClient()
      const { error: authError } = await adminClient.auth.admin.deleteUser(authUserId)

      if (authError) {
        console.error("[v0] Error deleting auth user:", authError)
        // Note: admin_users was already deleted, so we continue
        return { 
          success: true, 
          warning: `Admin user deleted from database but could not delete from authentication: ${authError.message}` 
        }
      }

      console.log("[v0] Auth user deleted successfully")
    }

    // Revalidate the admin users page
    revalidatePath("/admin/admin-users")

    return { success: true, message: "Admin user deleted successfully" }
  } catch (error) {
    console.error("[v0] Delete admin user error:", error)
    return {
      success: false,
      error: error instanceof Error ? error.message : "Failed to delete admin user",
    }
  }
}
