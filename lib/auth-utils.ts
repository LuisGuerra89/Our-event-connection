import { createServerClient } from "@/lib/supabase/server"

export async function getCurrentUser() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}

export async function getUserProfile(userId: string) {
  const supabase = await createServerClient()
  const { data: profile } = await supabase
    .from("profiles")
    .select("*, roles(role_name)")
    .eq("id", userId)
    .single()
  return profile
}

export async function isAdmin() {
  const user = await getCurrentUser()
  if (!user) return false

  const profile = await getUserProfile(user.id)
  // Check if user has admin role via the roles table
  const roles = profile?.roles as { role_name: string } | null
  return roles?.role_name === "admin"
}

export async function requireAdmin() {
  const admin = await isAdmin()
  if (!admin) {
    throw new Error("Unauthorized: Admin access required")
  }
  return true
}
