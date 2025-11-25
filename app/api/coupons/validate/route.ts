import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

interface ValidateCouponRequest {
  code: string
}

// POST /api/coupons/validate - Validate a coupon code
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

    const body: ValidateCouponRequest = await request.json()
    const { code } = body

    if (!code) {
      return NextResponse.json(
        { error: "Coupon code is required" },
        { status: 400 }
      )
    }

    // Call the validate_coupon function
    const { data, error } = await supabase.rpc("validate_coupon", {
      p_coupon_code: code,
      p_user_id: user.id
    })

    if (error) {
      console.error("Error validating coupon:", error)
      return NextResponse.json(
        { error: "Failed to validate coupon" },
        { status: 500 }
      )
    }

    // If data is an array, get the first result
    const result = Array.isArray(data) ? data[0] : data

    return NextResponse.json({
      valid: result.valid,
      message: result.message,
      couponId: result.coupon_id,
      discountAmount: result.discount_amount
    })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
