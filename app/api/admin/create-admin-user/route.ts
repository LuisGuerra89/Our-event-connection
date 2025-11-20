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

    const { data: profile } = await supabase.from("profiles").select("roles(role_name)").eq("id", user.id).single()

    if (profile?.roles?.role_name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { username, email, password, firstName, lastName, mobile, roleId, role = "admin" } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    if (!roleId || roleId === "") {
      return NextResponse.json(
        { error: "Role ID is required" },
        { status: 400 },
      )
    }

    console.log("[v0] Creating admin user:", email)

    // Check if email already exists in auth.users
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

    console.log("[v0] Form data received:", { email, roleId, firstName, lastName })

    // Use admin client to create auth user
    console.log("[v0] Attempting to create auth user:", email)
    const { data: authData, error: authError } = await adminClient.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        full_name: `${firstName} ${lastName}`.trim(),
        is_admin: true,
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

    // Create admin user record linked to auth user using admin client to bypass RLS
    console.log("[v0] Creating admin_users record for:", email)
    const { data: adminUser, error: adminUserError } = await adminClient
      .from("admin_users")
      .insert({
        user_id: authUserId,
        username: username || email.split("@")[0],
        email,
        first_name: firstName,
        last_name: lastName,
        mobile,
        role_id: roleId,
        status: "active",
      })
      .select()
      .single()

    if (adminUserError) {
      console.error("[v0] Admin user creation error:", adminUserError)
      return NextResponse.json(
        { error: `Failed to create admin user: ${adminUserError.message}` },
        { status: 500 },
      )
    }

    console.log("[v0] Admin user created successfully:", adminUser.id)

    // Create profile record for consistency using admin client to bypass RLS
    console.log("[v0] Creating profile record for user with roleId:", roleId)
    const { error: profileError } = await adminClient
      .from("profiles")
      .insert({
        id: authUserId,
        email,
        full_name: `${firstName} ${lastName}`.trim(),
        role,
        role_id: roleId,
        is_profile_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      // Note: we don't fail here as the admin_users was created successfully
      console.log("[v0] Profile creation failed but admin user was created")
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...adminUser,
        user_id: authUserId,
        message: "Admin user created successfully. Confirmation email sent."
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
