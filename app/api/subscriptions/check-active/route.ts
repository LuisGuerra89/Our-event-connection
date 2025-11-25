import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/subscriptions/check-active
 * 
 * Validates if the current user has an active subscription
 * Returns: { isActive: boolean, subscription: object | null, expiresAt: timestamp | null }
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized", isActive: false },
        { status: 401 }
      )
    }
    
    // Check if user has active subscription
    const { data: subscription, error: subError } = await supabase
      .from("user_subscriptions")
      .select("id, subscription_plan_id, status, created_at, expires_at")
      .eq("user_id", user.id)
      .eq("status", "active")
      .order("created_at", { ascending: false })
      .maybeSingle()
    
    if (subError) {
      console.error("[API] Error checking subscription:", subError)
      return NextResponse.json(
        { error: "Failed to check subscription", isActive: false },
        { status: 500 }
      )
    }
    
    if (!subscription) {
      return NextResponse.json({
        isActive: false,
        subscription: null,
        expiresAt: null,
        message: "No active subscription found"
      })
    }
    
    // Check if subscription has expired
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
    const now = new Date()
    const isExpired = expiresAt && expiresAt < now
    
    if (isExpired) {
      return NextResponse.json({
        isActive: false,
        subscription,
        expiresAt,
        message: "Subscription has expired"
      })
    }
    
    return NextResponse.json({
      isActive: true,
      subscription,
      expiresAt,
      message: "User has active subscription"
    })
    
  } catch (error) {
    console.error("[API] Subscription check error:", error)
    return NextResponse.json(
      { error: "Internal server error", isActive: false },
      { status: 500 }
    )
  }
}

/**
 * GET /api/subscriptions/check-active?userId=<uuid>
 * 
 * ADMIN ONLY: Check if a specific user has active subscription
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    const { userId } = await request.json()
    
    // Get current user and check if admin
    const { data: { user: currentUser }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !currentUser) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }
    
    // Check if current user is admin using profiles table
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", currentUser.id)
      .maybeSingle()
    
    const userRole = (profile?.roles as any)?.role_name
    
    if (profileError || !profile || (userRole !== "admin" && userRole !== "moderator")) {
      return NextResponse.json(
        { error: "Admin access required" },
        { status: 403 }
      )
    }
    
    // Check subscription for target user
    const { data: subscription } = await supabase
      .from("user_subscriptions")
      .select("*")
      .eq("user_id", userId)
      .eq("status", "active")
      .maybeSingle()
    
    if (!subscription) {
      return NextResponse.json({ isActive: false, subscription: null })
    }
    
    const expiresAt = subscription.expires_at ? new Date(subscription.expires_at) : null
    const isExpired = expiresAt && expiresAt < new Date()
    
    return NextResponse.json({
      isActive: !isExpired,
      subscription,
      expiresAt
    })
    
  } catch (error) {
    console.error("[API] Admin subscription check error:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
