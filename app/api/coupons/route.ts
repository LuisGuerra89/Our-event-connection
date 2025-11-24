import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

// GET /api/coupons - Get available coupons for the current user
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    // Get available coupons
    const { data: coupons, error } = await supabase
      .from("coupons")
      .select("id, code, type, discount_amount, discount_percentage, expiration_date, created_from_referral_count")
      .eq("user_id", user.id)
      .eq("status", "active")
      .gt("expiration_date", new Date().toISOString())
      .order("created_at", { ascending: false })

    if (error) {
      console.error("Error fetching coupons:", error)
      return NextResponse.json(
        { error: "Failed to fetch coupons" },
        { status: 500 }
      )
    }

    return NextResponse.json({
      coupons: coupons || [],
      count: coupons?.length || 0
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
