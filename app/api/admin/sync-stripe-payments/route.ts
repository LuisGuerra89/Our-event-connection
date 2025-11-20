import { NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"

// Supabase client with service role for bypassing RLS
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

export async function POST(request: Request) {
  try {
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
    const { limit = 100, starting_after } = body

    // Fetch payments from Stripe
    const paymentIntents = await stripe.paymentIntents.list({
      limit,
      starting_after,
      expand: ["data.latest_charge", "data.customer"],
    })

    let synced = 0
    let errors = 0

    for (const paymentIntent of paymentIntents.data) {
      try {
        // Check if payment already exists
        const { data: existingPayment } = await supabaseAdmin
          .from("payments")
          .select("id")
          .eq("stripe_payment_intent_id", paymentIntent.id)
          .single()

        const charge = typeof paymentIntent.latest_charge === "string" 
          ? null 
          : paymentIntent.latest_charge
        const metadata = paymentIntent.metadata || {}

        const paymentData = {
          stripe_payment_intent_id: paymentIntent.id,
          stripe_charge_id: charge?.id || null,
          stripe_customer_id: typeof paymentIntent.customer === "string" 
            ? paymentIntent.customer 
            : paymentIntent.customer?.id || null,
          payment_amount: paymentIntent.amount / 100,
          total_amount: paymentIntent.amount / 100,
          tax_amount: metadata.tax_amount ? parseFloat(metadata.tax_amount) : 0,
          discount_amount: metadata.discount_amount ? parseFloat(metadata.discount_amount) : 0,
          payment_method: paymentIntent.payment_method_types[0] || "card",
          transaction_id: paymentIntent.id,
          payment_status: paymentIntent.status === "succeeded" 
            ? "success" 
            : paymentIntent.status === "canceled" 
            ? "failed" 
            : "pending",
          payment_date: new Date(paymentIntent.created * 1000).toISOString(),
          registration_id: metadata.registration_id || null,
          user_id: metadata.user_id || null,
          event_id: metadata.event_id || null,
          updated_at: new Date().toISOString(),
        }

        if (existingPayment) {
          // Update existing payment
          await supabaseAdmin
            .from("payments")
            .update(paymentData)
            .eq("stripe_payment_intent_id", paymentIntent.id)
        } else {
          // Insert new payment
          await supabaseAdmin.from("payments").insert(paymentData)
        }

        synced++
      } catch (error) {
        console.error(`Error syncing payment ${paymentIntent.id}:`, error)
        errors++
      }
    }

    return NextResponse.json({
      success: true,
      synced,
      errors,
      total: paymentIntents.data.length,
      hasMore: paymentIntents.has_more,
      lastPaymentId: paymentIntents.data[paymentIntents.data.length - 1]?.id,
    })
  } catch (error) {
    console.error("Error syncing payments from Stripe:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Failed to sync payments" },
      { status: 500 }
    )
  }
}
