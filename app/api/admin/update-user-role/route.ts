import { type NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: NextRequest) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, roleId } = await request.json()

    if (!userId || !roleId) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Update the user's role
    const { error } = await supabase.from("profiles").update({ role_id: roleId }).eq("id", userId)

    if (error) {
      console.error("Error updating user role:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error in update-user-role route:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
