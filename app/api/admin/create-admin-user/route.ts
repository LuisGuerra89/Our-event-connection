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

    // Create admin user record
    const { data: adminUser, error: adminUserError } = await supabase
      .from("admin_users")
      .insert({
        username,
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
      throw adminUserError
    }

    return NextResponse.json({ success: true, data: adminUser })
  } catch (error) {
    console.error("[v0] Create admin user error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create admin user" },
      { status: 500 },
    )
  }
}
