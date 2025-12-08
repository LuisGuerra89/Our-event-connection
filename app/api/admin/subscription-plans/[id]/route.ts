import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"

export async function PUT(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
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

    // Get existing plan
    const { data: existingPlan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", params.id)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    const body = await request.json()
    const { name, description, status, auto_renewal, features } = body

    // Update Stripe product if needed
    if (existingPlan.stripe_product_id) {
      await stripe.products.update(existingPlan.stripe_product_id, {
        name: name || existingPlan.name,
        description: description !== undefined ? description : existingPlan.description,
        active: status === "active",
      })
    }

    // Update database
    const { data: plan, error } = await supabase
      .from("subscription_plans")
      .update({
        name: name || existingPlan.name,
        description: description !== undefined ? description : existingPlan.description,
        status: status || existingPlan.status,
        auto_renewal: auto_renewal !== undefined ? auto_renewal : existingPlan.auto_renewal,
        features: Array.isArray(features) ? features : existingPlan.features,
        updated_at: new Date().toISOString(),
      })
      .eq("id", params.id)
      .select()
      .single()

    if (error) throw error

    return NextResponse.json({ plan })
  } catch (error) {
    console.error("Error updating subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to update subscription plan" },
      { status: 500 }
    )
  }
}

export async function DELETE(request: Request, props: { params: Promise<{ id: string }> }) {
  try {
    const params = await props.params
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

    // Get existing plan
    const { data: existingPlan } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("id", params.id)
      .single()

    if (!existingPlan) {
      return NextResponse.json({ error: "Plan not found" }, { status: 404 })
    }

    // Archive Stripe product instead of deleting
    if (existingPlan.stripe_product_id) {
      await stripe.products.update(existingPlan.stripe_product_id, {
        active: false,
      })
    }

    // Delete from database
    const { error } = await supabase
      .from("subscription_plans")
      .delete()
      .eq("id", params.id)

    if (error) throw error

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting subscription plan:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to delete subscription plan" },
      { status: 500 }
    )
  }
}
