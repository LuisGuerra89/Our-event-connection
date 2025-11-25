import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface RedeemCouponRequest {
  code: string
  eventId: string
}

// POST /api/coupons/redeem - Redeem a coupon code
export async function POST(request: NextRequest) {
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

    const body: RedeemCouponRequest = await request.json()
    const { code, eventId } = body

    if (!code || !eventId) {
      return NextResponse.json(
        { error: "Coupon code and event ID are required" },
        { status: 400 }
      )
    }

    // Call the redeem_coupon function
    const { data, error } = await supabase.rpc("redeem_coupon", {
      p_coupon_code: code,
      p_user_id: user.id,
      p_event_id: eventId
    })

    if (error) {
      console.error("Error redeeming coupon:", error)
      return NextResponse.json(
        { error: "Failed to redeem coupon" },
        { status: 500 }
      )
    }

    // If data is an array, get the first result
    const result = Array.isArray(data) ? data[0] : data

    if (!result.success) {
      return NextResponse.json(
        { error: result.message },
        { status: 400 }
      )
    }

    return NextResponse.json({
      success: result.success,
      message: result.message,
      couponId: result.coupon_id
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
