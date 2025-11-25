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

/**
 * Check if a user has a specific privilege
 * @param userId - The user ID to check
 * @param privilegeName - The privilege name (e.g., 'users.view', 'events.create')
 * @returns boolean - True if user has the privilege
 */
export async function hasPrivilege(userId: string, privilegeName: string): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    
    // Get user's role_id and role info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", userId)
      .single()

    if (profileError || !profile?.role_id) {
      console.error("Error fetching profile:", profileError)
      return false
    }

    // Admins have all privileges
    const roles = profile.roles as any
    if (roles?.role_name === "admin") {
      return true
    }

    // Check if role has this privilege by joining with privileges table
    const { data: rolePrivileges, error: queryError } = await supabase
      .from("role_privileges")
      .select("privileges(privilege_name)")
      .eq("role_id", profile.role_id)

    if (queryError) {
      console.error("Error checking privileges:", queryError)
      return false
    }

    // Check if any of the role's privileges match the requested one
    return (rolePrivileges || []).some((rp: any) => rp.privileges?.privilege_name === privilegeName)
  } catch (error) {
    console.error("hasPrivilege error:", error)
    return false
  }
}

/**
 * Check if a user has multiple privileges (at least one)
 * @param userId - The user ID to check
 * @param privilegeNames - Array of privilege names
 * @returns boolean - True if user has at least one privilege
 */
export async function hasAnyPrivilege(userId: string, privilegeNames: string[]): Promise<boolean> {
  try {
    const supabase = await createServerClient()
    
    // Get user's role_id and role info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", userId)
      .single()

    if (profileError || !profile?.role_id) {
      console.error("Error fetching profile:", profileError)
      return false
    }

    // Admins have all privileges
    const roles = profile.roles as any
    if (roles?.role_name === "admin") {
      return true
    }

    // Check if role has any of these privileges
    const { data: rolePrivileges, error: queryError } = await supabase
      .from("role_privileges")
      .select("privileges(privilege_name)")
      .eq("role_id", profile.role_id)

    if (queryError) {
      console.error("Error checking privileges:", queryError)
      return false
    }

    // Check if any of the role's privileges match any of the requested ones
    const userPrivileges = (rolePrivileges || []).map((rp: any) => rp.privileges?.privilege_name)
    return privilegeNames.some(priv => userPrivileges.includes(priv))
  } catch (error) {
    console.error("hasAnyPrivilege error:", error)
    return false
  }
}

/**
 * Get all privileges for a user's role
 * @param userId - The user ID
 * @returns string[] - Array of privilege names
 */
export async function getUserPrivileges(userId: string): Promise<string[]> {
  try {
    const supabase = await createServerClient()
    
    // Get user's role_id and role info
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", userId)
      .single()

    if (profileError || !profile?.role_id) {
      console.error("Error fetching profile:", profileError)
      return []
    }

    // Admins get all privileges
    const roles = profile.roles as any
    if (roles?.role_name === "admin") {
      const { data: allPrivileges } = await supabase
        .from("privileges")
        .select("privilege_name")
      return (allPrivileges || []).map(p => p.privilege_name)
    }

    // Get all privileges for the role
    const { data: rolePrivileges, error: queryError } = await supabase
      .from("role_privileges")
      .select("privileges(privilege_name)")
      .eq("role_id", profile.role_id)

    if (queryError) {
      console.error("Error fetching privileges:", queryError)
      return []
    }

    return (rolePrivileges ?? []).map((rp: any) => rp.privileges?.privilege_name).filter(Boolean)
  } catch (error) {
    console.error("getUserPrivileges error:", error)
    return []
  }
}

/**
 * Require a specific privilege or throw error
 * @param userId - The user ID to check
 * @param privilegeName - The privilege name to require
 * @throws Error if user doesn't have privilege
 */
export async function requirePrivilege(userId: string, privilegeName: string): Promise<boolean> {
  const hasPriv = await hasPrivilege(userId, privilegeName)
  if (!hasPriv) {
    throw new Error(`Unauthorized: ${privilegeName} access required`)
  }
  return true
}

/**
 * Require at least one privilege or throw error
 * @param userId - The user ID to check
 * @param privilegeNames - Array of privilege names
 * @throws Error if user doesn't have any privilege
 */
export async function requireAnyPrivilege(userId: string, privilegeNames: string[]): Promise<boolean> {
  const hasAny = await hasAnyPrivilege(userId, privilegeNames)
  if (!hasAny) {
    throw new Error(`Unauthorized: one of [${privilegeNames.join(", ")}] access required`)
  }
  return true
}
