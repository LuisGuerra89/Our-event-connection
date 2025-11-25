import { createClient } from "@supabase/supabase-js"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth-utils"

export async function POST(request: Request) {
  try {
    // Check if user is admin
    const admin = await isAdmin()
    if (!admin) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 403 })
    }

    const { userId, newPassword } = await request.json()

    if (!userId || !newPassword) {
      return NextResponse.json({ error: "User ID and new password are required" }, { status: 400 })
    }

    // Validate password length
    if (newPassword.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters long" }, { status: 400 })
    }

    // Create Supabase admin client using service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.SUPABASE_SERVICE_ROLE_KEY!,
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false,
        },
      }
    )

    // Update the user's password using service role key
    const { data, error } = await supabaseAdmin.auth.admin.updateUserById(userId, {
      password: newPassword,
    })

    if (error) {
      console.error("Error resetting password:", error)
      return NextResponse.json({ error: error.message || "Failed to reset password" }, { status: 500 })
    }

    return NextResponse.json({ success: true, message: "Password reset successfully" })
  } catch (error) {
    console.error("Error in reset-user-password:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
