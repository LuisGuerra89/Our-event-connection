import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function POST(request: Request) {
  try {
    // Validate Stripe configuration
    if (!process.env.STRIPE_SECRET_KEY) {
      return NextResponse.json(
        { error: "Stripe is not configured" },
        { status: 503 }
      )
    }

    const supabase = await createServerClient()
    
    // Check if user is admin
    const { data: { user } } = await supabase.auth.getUser()
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

    const adminRoleIds = roles?.map(r => r.id) || []
    
    if (!adminRoleIds.includes(profile.role_id)) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, description, plan_type, price, duration_days, auto_renewal, status } = body

    // Validate required fields
    if (!name || !plan_type || price === undefined) {
      return NextResponse.json(
        { error: "Name, plan_type, and price are required" },
        { status: 400 }
      )
    }

    // Map plan_type to Stripe interval
    let stripeInterval: "day" | "week" | "month" = "month"
    let intervalCount = 1

    if (plan_type === "daily") {
      stripeInterval = "day"
      intervalCount = 1
    } else if (plan_type === "weekly") {
      stripeInterval = "week"
      intervalCount = 1
    } else if (plan_type === "monthly") {
      stripeInterval = "month"
      intervalCount = 1
    } else if (plan_type === "custom" && duration_days) {
      // For custom, we'll use days
      stripeInterval = "day"
      intervalCount = duration_days
    }

    // Create product in Stripe
    const stripeProduct = await stripe.products.create({
      name: name,
      description: description || undefined,
      active: status === "active",
    })

    // Create price in Stripe (recurring subscription)
    const stripePrice = await stripe.prices.create({
      product: stripeProduct.id,
      unit_amount: Math.round(price * 100), // Convert to cents
      currency: "usd",
      recurring: {
        interval: stripeInterval,
        interval_count: intervalCount,
      },
    })

    // Insert into database
    const { data: plan, error } = await supabase
      .from("subscription_plans")
      .insert({
        name,
        description,
        plan_type,
        price,
        duration_days: plan_type === "custom" ? duration_days : null,
        auto_renewal: auto_renewal || false,
        status: status || "active",
        stripe_product_id: stripeProduct.id,
        stripe_price_id: stripePrice.id,
      })
      .select()
      .single()

    if (error) {
      // If database insert fails, try to delete the Stripe product
      await stripe.products.del(stripeProduct.id).catch(console.error)
      throw error
    }

    return NextResponse.json({ plan }, { status: 201 })
  } catch (error) {
    console.error("Error creating subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to create subscription plan" },
      { status: 500 }
    )
  }
}
