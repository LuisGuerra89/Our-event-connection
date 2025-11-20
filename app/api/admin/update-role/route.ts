import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { id, role_name, description, status } = await request.json()

    if (!id || !role_name) {
      return NextResponse.json({ error: "Role ID and name are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { error } = await supabase.from("roles").update({ role_name, description, status }).eq("id", id)

    if (error) {
      console.error("Error updating role:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-role route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
