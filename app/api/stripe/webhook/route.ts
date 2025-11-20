import { NextRequest, NextResponse } from "next/server"
import { stripe } from "@/lib/stripe"
import { createClient } from "@/lib/supabase/server"
import Stripe from "stripe"

export async function POST(request: NextRequest) {
  const body = await request.text()
  const signature = request.headers.get("stripe-signature")

  if (!signature) {
    return NextResponse.json({ error: "No signature" }, { status: 400 })
  }

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET || ""
    )
  } catch (err) {
    console.error("Webhook signature verification failed:", err)
    return NextResponse.json({ error: "Invalid signature" }, { status: 400 })
  }

  const supabase = await createClient()

  try {
    switch (event.type) {
      case "checkout.session.completed": {
        const session = event.data.object as Stripe.Checkout.Session
        const userId = session.metadata?.user_id
        const planId = session.metadata?.plan_id

        if (!userId || !planId) {
          console.error("Missing metadata in checkout session")
          break
        }

        // Get plan details
        const { data: plan } = await supabase
          .from("membership_plans")
          .select("*")
          .eq("id", planId)
          .single()

        if (!plan) {
          console.error("Plan not found:", planId)
          break
        }

        // Calculate end date
        const startDate = new Date()
        const endDate = new Date(startDate)
        if (plan.duration_days) {
          endDate.setDate(endDate.getDate() + plan.duration_days)
        }

        // Create subscription
        const { error: subError } = await supabase.from("user_subscriptions").insert({
          user_id: userId,
          plan_id: planId,
          start_date: startDate.toISOString(),
          end_date: plan.duration_days ? endDate.toISOString() : null,
          auto_renew: plan.auto_renewal,
          status: "active",
          stripe_subscription_id: session.subscription as string,
        })

        if (subError) {
          console.error("Failed to create subscription:", subError)
          break
        }

        // Record payment
        const paymentAmount = session.amount_total ? session.amount_total / 100 : 0
        const { error: paymentError } = await supabase.from("payments").insert({
          user_id: userId,
          subscription_id: null,
          payment_amount: paymentAmount,
          tax_amount: 0,
          discount_amount: 0,
          total_amount: paymentAmount,
          payment_method: "card",
          transaction_id: session.payment_intent as string,
          payment_status: "success",
          stripe_payment_intent_id: session.payment_intent as string,
          stripe_customer_id: session.customer as string,
        })

        if (paymentError) {
          console.error("Failed to record payment:", paymentError)
        }

        break
      }

      case "payment_intent.succeeded": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent
        const userId = paymentIntent.metadata?.user_id
        const planId = paymentIntent.metadata?.plan_id

        if (!userId || !planId) {
          console.error("Missing metadata in payment intent")
          break
        }

        // Update payment status if it exists
        await supabase
          .from("payments")
          .update({ payment_status: "success" })
          .eq("transaction_id", paymentIntent.id)

        break
      }

      case "payment_intent.payment_failed": {
        const paymentIntent = event.data.object as Stripe.PaymentIntent

        // Update payment status to failed
        await supabase
          .from("payments")
          .update({ payment_status: "failed" })
          .eq("transaction_id", paymentIntent.id)

        break
      }

      default:
        console.log(`Unhandled event type: ${event.type}`)
    }

    return NextResponse.json({ received: true })
  } catch (error) {
    console.error("Webhook handler error:", error)
    return NextResponse.json(
      { error: "Webhook handler failed" },
      { status: 500 }
    )
  }
}
