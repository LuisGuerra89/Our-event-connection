import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { testSMTPConnection } from "@/lib/email-service"

export async function POST() {
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
      .select("role_id")
      .eq("id", user.id)
      .single()

    if (!profile) {
      return NextResponse.json({ error: "Profile not found" }, { status: 404 })
    }

    // Get admin/moderator role IDs
    const { data: roles } = await supabase
      .from("roles")
      .select("id")
      .in("role_name", ["admin", "moderator"])

    const adminRoleIds = roles?.map((r) => r.id) || []

    if (!adminRoleIds.includes(profile.role_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Test SMTP connection
    const result = await testSMTPConnection()

    if (result.success) {
      return NextResponse.json({
        success: true,
        message: "SMTP connection successful! Email service is configured correctly.",
      })
    } else {
      return NextResponse.json(
        {
          success: false,
          message: `SMTP connection failed: ${result.message}`,
        },
        { status: 500 }
      )
    }
  } catch (error) {
    console.error("Error testing SMTP:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to test SMTP connection",
      },
      { status: 500 }
    )
  }
}
