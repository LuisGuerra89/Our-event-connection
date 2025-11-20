import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { role_name, description, status } = await request.json()

    if (!role_name) {
      return NextResponse.json({ error: "Role name is required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    const { error } = await supabase.from("roles").insert({ role_name, description, status: status || "active" })

    if (error) {
      console.error("Error creating role:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in create-role route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
