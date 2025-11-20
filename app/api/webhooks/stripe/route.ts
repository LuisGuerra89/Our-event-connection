import { NextResponse } from "next/server"
import { headers } from "next/headers"
import { stripe } from "@/lib/stripe"
import { createClient } from "@supabase/supabase-js"
import Stripe from "stripe"

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
  const body = await request.text()
  const headersList = await headers()
  const signature = headersList.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json(
      { error: `Webhook Error: ${err instanceof Error ? err.message : "Unknown error"}` },
      { status: 400 }
    )
  }

  try {
    switch (event.type) {
      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentSuccess(paymentIntent)
        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        await handlePaymentFailure(paymentIntent)
        break
      }

      case "charge.succeeded": {
        const charge = event.data.object as Stripe.Charge
        await handleChargeSuccess(charge)
        break
      }

      case "charge.refunded": {
        const charge = event.data.object as Stripe.Charge
        await handleRefund(charge)
        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Error processing webhook:", error)
    return NextResponse.json(
      { error: "Webhook processing failed" },
      { status: 500 }
    )
  }
}

async function handlePaymentSuccess(paymentIntent: Stripe.PaymentIntent) {
  const { data: existingPayment } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single()

  const paymentData = {
    stripe_payment_intent_id: paymentIntent.id,
    stripe_customer_id: paymentIntent.customer as string,
    payment_amount: paymentIntent.amount / 100, // Convert from cents
    total_amount: paymentIntent.amount / 100,
    payment_method: paymentIntent.payment_method_types[0] || "card",
    transaction_id: paymentIntent.id,
    payment_status: "success",
    payment_date: new Date(paymentIntent.created * 1000).toISOString(),
    updated_at: new Date().toISOString(),
  }

  if (existingPayment) {
    // Update existing payment
    await supabaseAdmin
      .from("payments")
      .update(paymentData)
      .eq("stripe_payment_intent_id", paymentIntent.id)
  } else {
    // Create new payment record
    // Extract metadata if available
    const metadata = paymentIntent.metadata || {}
    
    await supabaseAdmin.from("payments").insert({
      ...paymentData,
      user_id: metadata.user_id || null,
      event_id: metadata.event_id || null,
      registration_id: metadata.registration_id || null,
      tax_amount: metadata.tax_amount ? parseFloat(metadata.tax_amount) : 0,
      discount_amount: metadata.discount_amount ? parseFloat(metadata.discount_amount) : 0,
    })
  }

  console.log(`Payment succeeded: ${paymentIntent.id}`)
}

async function handlePaymentFailure(paymentIntent: Stripe.PaymentIntent) {
  const { data: existingPayment } = await supabaseAdmin
    .from("payments")
    .select("id")
    .eq("stripe_payment_intent_id", paymentIntent.id)
    .single()

  const paymentData = {
    stripe_payment_intent_id: paymentIntent.id,
    payment_status: "failed",
    updated_at: new Date().toISOString(),
  }

  if (existingPayment) {
    await supabaseAdmin
      .from("payments")
      .update(paymentData)
      .eq("stripe_payment_intent_id", paymentIntent.id)
  } else {
    // Create failed payment record
    const metadata = paymentIntent.metadata || {}
    
    await supabaseAdmin.from("payments").insert({
      ...paymentData,
      user_id: metadata.user_id || null,
      event_id: metadata.event_id || null,
      registration_id: metadata.registration_id || null,
      payment_amount: paymentIntent.amount / 100,
      total_amount: paymentIntent.amount / 100,
      tax_amount: metadata.tax_amount ? parseFloat(metadata.tax_amount) : 0,
      discount_amount: metadata.discount_amount ? parseFloat(metadata.discount_amount) : 0,
      payment_method: paymentIntent.payment_method_types[0] || "card",
      transaction_id: paymentIntent.id,
      payment_date: new Date(paymentIntent.created * 1000).toISOString(),
    })
  }

  console.log(`Payment failed: ${paymentIntent.id}`)
}

async function handleChargeSuccess(charge: Stripe.Charge) {
  // Update payment with charge ID if payment exists
  if (charge.payment_intent) {
    await supabaseAdmin
      .from("payments")
      .update({
        stripe_charge_id: charge.id,
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", charge.payment_intent as string)
  }

  console.log(`Charge succeeded: ${charge.id}`)
}

async function handleRefund(charge: Stripe.Charge) {
  if (charge.payment_intent) {
    await supabaseAdmin
      .from("payments")
      .update({
        payment_status: "refunded",
        updated_at: new Date().toISOString(),
      })
      .eq("stripe_payment_intent_id", charge.payment_intent as string)
  }

  console.log(`Charge refunded: ${charge.id}`)
}
