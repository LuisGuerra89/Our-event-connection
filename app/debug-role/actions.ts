"use server"

import { createServerClient } from "@/lib/supabase/server"

export async function checkCurrentUserRole() {
    const supabase = await createServerClient()

    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { error: "No user logged in" }
    }

    // Get profile with role info
    const { data: profile, error } = await supabase
        .from("profiles")
        .select("id, email, full_name, role_id, roles(id, role_name)")
        .eq("id", user.id)
        .single()

    if (error) {
        return { error: error.message }
    }

    return {
        user: {
            id: user.id,
            email: user.email,
            profile: profile
        }
    }
}

export async function fixAdminRole(userId: string, email: string) {
    const supabase = await createServerClient()

    // Get admin role_id
    const { data: adminRole } = await supabase
        .from("roles")
        .select("id")
        .eq("role_name", "admin")
        .single()

    if (!adminRole) {
        return { error: "Admin role not found in database" }
    }

    // Update user profile
    const { error } = await supabase
        .from("profiles")
        .update({ role_id: adminRole.id })
        .eq("id", userId)

    if (error) {
        return { error: error.message }
    }

    return { success: true, message: `Updated ${email} to admin role` }
}
