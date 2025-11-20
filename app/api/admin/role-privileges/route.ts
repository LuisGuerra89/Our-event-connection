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
    const { roleId, privilegeIds } = body

    // Delete existing role privileges
    await supabase.from("role_privileges").delete().eq("role_id", roleId)

    // Insert new role privileges
    if (privilegeIds.length > 0) {
      const rolePrivileges = privilegeIds.map((privilegeId: string) => ({
        role_id: roleId,
        privilege_id: privilegeId,
      }))

      const { error: insertError } = await supabase.from("role_privileges").insert(rolePrivileges)

      if (insertError) {
        throw insertError
      }
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("[v0] Update role privileges error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update role privileges" },
      { status: 500 },
    )
  }
}
