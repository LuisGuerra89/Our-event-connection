"use server"

import { createServerClient, createAdminClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function deleteAdminUser(userId: string) {
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

    console.log("[v0] Deleting admin user:", userId)

    // Delete all related data in order (cascade dependencies)
    // 1. First get all events where user is attendee
    const { data: attendedEvents } = await supabase
      .from("event_attendees")
      .select("event_id")
      .eq("user_id", userId)

    const eventIds = attendedEvents?.map(ea => ea.event_id) || []

    // 2. Delete event_attendees for all those events
    if (eventIds.length > 0) {
      await supabase
        .from("event_attendees")
        .delete()
        .in("event_id", eventIds)
    }

    // 3. Delete event_attendees directly for this user
    await supabase
      .from("event_attendees")
      .delete()
      .eq("user_id", userId)

    // 4. Delete events created by this user
    await supabase
      .from("events")
      .delete()
      .eq("created_by", userId)

    // 5. Delete from matches
    await supabase
      .from("matches")
      .delete()
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)

    // 6. Delete from waivers
    await supabase
      .from("waivers")
      .delete()
      .eq("user_id", userId)

    // 7. Delete from user_attributes
    await supabase
      .from("user_attributes")
      .delete()
      .eq("user_id", userId)

    // 8. Delete from preferences
    await supabase
      .from("preferences")
      .delete()
      .eq("user_id", userId)

    // 9. Delete from chat_messages
    await supabase
      .from("chat_messages")
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    // 7. Delete from profiles (this will cascade delete to auth.users due to foreign key)
    const { error: profileError } = await supabase
      .from("profiles")
      .delete()
      .eq("id", userId)

    if (profileError) {
      console.error("[v0] Error deleting profile record:", profileError)
      return { success: false, error: `Failed to delete admin user: ${profileError.message}` }
    }

    console.log("[v0] Admin user deleted successfully with all related data")

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
