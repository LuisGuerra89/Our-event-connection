import { createServerClient, createAdminClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()
    const adminClient = createAdminClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check admin using role_id join with roles table
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", user.id)
      .single()

    // Type assertion for the joined data
    const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null

    if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { username, email, password, firstName, lastName, mobile, role = "admin" } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    if (!role || !["admin", "moderator", "user"].includes(role)) {
      return NextResponse.json(
        { error: "Valid role is required (admin, moderator, or user)" },
        { status: 400 },
      )
    }

    console.log("[v0] Creating admin user:", email, "with role:", role)

    // Get the role_id from roles table
    const { data: roleData, error: roleError } = await supabase
      .from("roles")
      .select("id")
      .eq("role_name", role)
      .single()

    if (roleError || !roleData) {
      console.error("[v0] Role lookup error:", roleError)
      return NextResponse.json(
        { error: `Role '${role}' not found in database` },
        { status: 400 },
      )
    }

    const roleId = roleData.id
    console.log("[v0] Found role_id:", roleId, "for role:", role)

    // Check if email already exists
    const { data: existingUser } = await supabase
      .from("profiles")
      .select("id")
      .eq("email", email)
      .maybeSingle()

    if (existingUser) {
      return NextResponse.json(
        { error: "Email already exists in the system" },
        { status: 400 },
      )
    }

    console.log("[v0] Form data received:", { email, role, firstName, lastName })

    // Use admin client to create auth user
    console.log("[v0] Attempting to create auth user:", email)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`.trim(),
        role: role,
      },
    })

    if (authError) {
      console.error("[v0] Auth user creation error:", authError.message || JSON.stringify(authError))
      return NextResponse.json(
        { error: `Failed to create auth user: ${authError.message}` },
        { status: 400 },
      )
    }

    if (!authData.user) {
      console.error("[v0] No user returned from createUser")
      return NextResponse.json(
        { error: "Auth user creation failed: no user returned" },
        { status: 500 },
      )
    }

    const authUserId = authData.user.id
    console.log("[v0] Auth user created successfully:", authUserId)

    // Generate a unique referral code
    const generateReferralCode = () => {
      const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'
      let code = ''
      for (let i = 0; i < 8; i++) {
        code += chars.charAt(Math.floor(Math.random() * chars.length))
      }
      return code
    }

    const referralCode = generateReferralCode()

    // Create profile explicitly with all required fields including role_id
    console.log("[v0] Creating profile with role_id:", roleId)
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authUserId,
        email: email,
        full_name: `${firstName} ${lastName}`.trim(),
        phone: mobile,
        role_id: roleId,
        referral_code: referralCode,
        referral_count: 0,
        free_events_earned: 0,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      // Try to clean up the auth user if profile creation fails
      await adminClient.auth.admin.deleteUser(authUserId)
      return NextResponse.json(
        { error: `Failed to create profile: ${profileError.message}` },
        { status: 500 },
      )
    }

    console.log("[v0] Profile created successfully with role_id:", roleId)

    return NextResponse.json({
      success: true,
      data: {
        user_id: authUserId,
        email: email,
        role: role,
        role_id: roleId,
        message: "Admin user created successfully."
      }
    })
  } catch (error) {
    console.error("[v0] Create admin user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create admin user" },
      { status: 500 },
    )
  }
}
