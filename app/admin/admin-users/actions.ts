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
    // The issue: payments.event_id FK lacks ON DELETE CASCADE, blocking profile deletion
    // Solution: Delete ALL user payments first (both by user_id and event_id)

    // 1. Delete ALL payments for this user (critical - must be first)
    // This includes payments by user_id AND payments for events they created
    console.log("[v0] Deleting all payments for user:", userId)

    // First, get all events created by this user to delete their payments
    const { data: createdEvents } = await supabase
      .from("events")
      .select("id")
      .eq("created_by", userId)

    const createdEventIds = createdEvents?.map(e => e.id) || []
    console.log("[v0] Found", createdEventIds.length, "events created by user")

    // Delete payments associated with user's events
    if (createdEventIds.length > 0) {
      console.log("[v0] Deleting payments for user's events")
      await supabase
        .from("payments")
        .delete()
        .in("event_id", createdEventIds)
    }

    // Delete payments by user_id
    await supabase
      .from("payments")
      .delete()
      .eq("user_id", userId)

    // 2. Get all events where user is attendee
    const { data: attendedEvents } = await supabase
      .from("event_attendees")
      .select("event_id")
      .eq("user_id", userId)

    const attendeeEventIds = attendedEvents?.map(ea => ea.event_id) || []

    // 3. Delete event_attendees for all those events
    if (attendeeEventIds.length > 0) {
      await supabase
        .from("event_attendees")
        .delete()
        .in("event_id", attendeeEventIds)
    }

    // 4. Delete event_attendees directly for this user
    await supabase
      .from("event_attendees")
      .delete()
      .eq("user_id", userId)

    // 5. Delete events created by this user (payments already deleted above)
    if (createdEventIds.length > 0) {
      console.log("[v0] Deleting", createdEventIds.length, "events created by user")
      await supabase
        .from("events")
        .delete()
        .in("id", createdEventIds)
    }

    // 6. Delete from subscriptions
    await supabase
      .from("subscriptions")
      .delete()
      .eq("user_id", userId)

    // 7. Delete from matches
    await supabase
      .from("matches")
      .delete()
      .or(`user_id.eq.${userId},matched_user_id.eq.${userId}`)

    // 8. Delete from waivers
    await supabase
      .from("waivers")
      .delete()
      .eq("user_id", userId)

    // 9. Delete from user_attributes
    await supabase
      .from("user_attributes")
      .delete()
      .eq("user_id", userId)

    // 10. Delete from preferences
    await supabase
      .from("preferences")
      .delete()
      .eq("user_id", userId)

    // 11. Delete from chat_messages
    await supabase
      .from("chat_messages")
      .delete()
      .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)

    // 12. Delete from auth.users using admin client (this will cascade delete the profile)
    console.log("[v0] Deleting auth user:", userId)
    const adminClient = createAdminClient()
    const { error: authError } = await adminClient.auth.admin.deleteUser(userId)

    if (authError) {
      console.error("[v0] Error deleting auth user:", authError)
      return {
        success: false,
        error: `Failed to delete admin user from authentication: ${authError.message}`
      }
    }

    console.log("[v0] Auth user deleted successfully (profile cascade deleted)")

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
