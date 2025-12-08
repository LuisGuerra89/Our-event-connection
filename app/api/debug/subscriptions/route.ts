import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Not authenticated" }, { status: 401 })
    }

    // Get all subscriptions for this user
    const { data: subscriptions, error } = await supabase
      .from("user_subscriptions")
      .select(`
        id,
        user_id,
        plan_id,
        start_date,
        end_date,
        auto_renew,
        status,
        stripe_subscription_id,
        created_at,
        plan:subscription_plans(id, name, price, plan_type)
      `)
      .eq("user_id", user.id)

    return NextResponse.json({
      userId: user.id,
      userEmail: user.email,
      subscriptions,
      error,
      subscriptionCount: subscriptions?.length || 0,
    })
  } catch (error) {
    return NextResponse.json({ error: String(error) }, { status: 500 })
  }
}
