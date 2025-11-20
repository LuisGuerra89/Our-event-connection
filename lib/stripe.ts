import Stripe from "stripe"

const stripeKey = process.env.STRIPE_SECRET_KEY || ""

export const stripe = new Stripe(stripeKey || "sk_test_placeholder", {
  apiVersion: "2024-11-20.acacia",
  typescript: true,
})
