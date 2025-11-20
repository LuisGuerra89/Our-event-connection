import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

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
    const { username, email, password, firstName, lastName, mobile, roleId } = body

    // Validate required fields
    if (!email || !password) {
      return NextResponse.json(
        { error: "Email and password are required" },
        { status: 400 },
      )
    }

    // Step 1: Create user in auth.users using admin API
    console.log("[v0] Creating auth user for admin:", email)
    const { data: authUser, error: authError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true, // Auto-confirm email
      user_metadata: {
        first_name: firstName,
        last_name: lastName,
        full_name: `${firstName} ${lastName}`.trim(),
      },
    })

    if (authError) {
      console.error("[v0] Auth user creation error:", authError)
      throw new Error(`Failed to create auth user: ${authError.message}`)
    }

    if (!authUser.user) {
      throw new Error("Auth user creation failed: no user returned")
    }

    console.log("[v0] Auth user created successfully:", authUser.user.id)

    // Step 2: Create admin user record linked to auth user
    console.log("[v0] Creating admin_users record for:", email)
    const { data: adminUser, error: adminUserError } = await supabase
      .from("admin_users")
      .insert({
        user_id: authUser.user.id,
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
      // Rollback: delete the auth user if admin_users creation fails
      console.log("[v0] Rolling back auth user due to admin_users error")
      await supabase.auth.admin.deleteUser(authUser.user.id)
      throw new Error(`Failed to create admin user: ${adminUserError.message}`)
    }

    console.log("[v0] Admin user created successfully:", adminUser.id)

    // Step 3: Create profile record for consistency
    console.log("[v0] Creating profile record for admin user")
    const { error: profileError } = await supabase
      .from("profiles")
      .upsert({
        id: authUser.user.id,
        email,
        full_name: `${firstName} ${lastName}`.trim(),
        role: "admin",
        role_id: roleId,
        is_profile_complete: true,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      }, {
        onConflict: "id"
      })

    if (profileError) {
      console.error("[v0] Profile creation error:", profileError)
      // Note: we don't rollback here as the admin_users was created successfully
      console.log("[v0] Profile creation failed but admin user was created")
    }

    return NextResponse.json({ 
      success: true, 
      data: {
        ...adminUser,
        user_id: authUser.user.id,
        auth_email_confirmed: true
      },
      message: "Admin user created successfully with authentication credentials"
    })
  } catch (error) {
    console.error("[v0] Create admin user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create admin user" },
      { status: 500 },
    )
  }
}
