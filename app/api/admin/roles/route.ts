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

    const { data: profile } = await supabase
      .from("profiles")
      .select("roles!inner(role_name)")
      .eq("id", user.id)
      .single()

    // @ts-ignore - Supabase types are not always accurate
    if (profile?.roles?.role_name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { roleName, description, status } = body

    // Create role
    const { data: role, error: roleError } = await supabase
      .from("roles")
      .insert({
        role_name: roleName,
        description,
        status,
      })
      .select()
      .single()

    if (roleError) {
      throw roleError
    }

    return NextResponse.json({ success: true, data: role })
  } catch (error) {
    console.error("[v0] Create role error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create role" },
      { status: 500 },
    )
  }
}

export async function DELETE(request: Request) {
  try {
    const supabase = await createServerClient()

    // Check if user is admin
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from("profiles")
      .select("roles!inner(role_name)")
      .eq("id", user.id)
      .single()

    // @ts-ignore - Supabase types are not always accurate
    if (profile?.roles?.role_name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { id } = body

    if (!id) {
      return NextResponse.json({ error: "Role ID is required" }, { status: 400 })
    }

    // Delete role (cascade will handle role_privileges)
    const { error: deleteError } = await supabase.from("roles").delete().eq("id", id)

    if (deleteError) {
      throw deleteError
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Delete role error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete role" },
      { status: 500 },
    )
  }
}
