"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { loadStripe } from "@stripe/stripe-js"
import { Elements } from "@stripe/react-stripe-js"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, ArrowLeft, AlertCircle, Gift, Loader2 } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { StripeCheckoutForm } from "@/components/stripe-checkout-form"

// Initialize Stripe
const stripePromise = loadStripe(process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY || "")

interface MembershipDetailCardProps {
  plan: any
  userId: string
  existingSubscription: any
  referralCount: number
  freeEventsEarned: number
}

export function MembershipDetailCard({
  plan,
  userId,
  existingSubscription,
  referralCount,
  freeEventsEarned,
}: MembershipDetailCardProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [clientSecret, setClientSecret] = useState<string | null>(null)
  const [paymentIntentId, setPaymentIntentId] = useState<string | null>(null)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  // Initialize Stripe checkout when component mounts
  useEffect(() => {
    if (!existingSubscription && !clientSecret) {
      initializeCheckout()
    }
  }, [existingSubscription])

  const initializeCheckout = async () => {
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/stripe/create-payment-intent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          planId: plan.id,
          amount: plan.price,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to initialize checkout")
      }

      setClientSecret(data.clientSecret)
      setPaymentIntentId(data.paymentIntentId)
    } catch (err) {
      console.error("Checkout initialization error:", err)
      setError(err instanceof Error ? err.message : "Failed to initialize checkout")
    } finally {
      setIsLoading(false)
    }
  }

  const handlePaymentSuccess = useCallback(async () => {
    setIsLoading(true)
    const supabase = createClient()

    try {
      // Calculate end date based on plan duration
      const startDate = new Date()
      const endDate = new Date(startDate)
      if (plan.duration_days) {
        endDate.setDate(endDate.getDate() + plan.duration_days)
      }

      // Create subscription
      const { error: subError } = await supabase.from("user_subscriptions").insert({
        user_id: userId,
        plan_id: plan.id,
        start_date: startDate.toISOString(),
        end_date: plan.duration_days ? endDate.toISOString() : null,
        auto_renew: plan.auto_renewal,
        status: "active",
        stripe_payment_intent_id: paymentIntentId,
      })

      if (subError) throw subError

      // Update payment record to success
      if (paymentIntentId) {
        await supabase
          .from("payments")
          .update({ payment_status: "success" })
          .eq("transaction_id", paymentIntentId)
      }

      console.log("Payment successful, redirecting to success page")
      router.push("/membership/success")
    } catch (err) {
      console.error("Subscription error:", err)
      setError("Failed to activate subscription. Please contact support.")
      setIsLoading(false)
    }
  }, [userId, plan, paymentIntentId, router])

  const handlePaymentError = useCallback((errorMsg: string) => {
    setError(errorMsg)
  }, [])

  const handleCancelSubscription = async () => {
    if (!confirm("Are you sure you want to cancel your subscription? It will remain active until the end of the current period.")) {
      return
    }

    setIsLoading(true)
    const supabase = createClient()

    try {
      const { error } = await supabase
        .from("user_subscriptions")
        .update({ auto_renew: false, status: "cancelled" })
        .eq("id", existingSubscription.id)

      if (error) throw error

      alert("Subscription cancelled successfully")
      router.refresh()
    } catch (err) {
      console.error("Cancellation error:", err)
      alert("Failed to cancel subscription")
    } finally {
      setIsLoading(false)
    }
  }

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      custom: "Custom",
    }
    return labels[type] || type
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/membership">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Membership Plans
        </Link>
      </Button>

      {/* Referral Progress */}
      {referralCount > 0 && (
        <Alert className="mb-6 border-primary/50 bg-primary/5">
          <Gift className="h-4 w-4" />
          <AlertDescription>
            <strong>Referral Progress:</strong> You have referred {referralCount} member{referralCount !== 1 ? "s" : ""}!
            {referralCount >= 25 && (
              <span className="ml-2 text-primary font-semibold">
                You've earned {freeEventsEarned} free After Work Activit{freeEventsEarned !== 1 ? "ies" : "y"}!
              </span>
            )}
            {referralCount < 25 && (
              <span className="ml-2">
                {25 - referralCount} more referral{25 - referralCount !== 1 ? "s" : ""} to earn a free After Work Activity!
              </span>
            )}
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-2 gap-6">
        {/* Plan Details */}
        <Card>
          <CardHeader>
            <div className="flex items-start justify-between mb-2">
              <Badge variant="secondary">{getPlanTypeLabel(plan.plan_type)}</Badge>
              {plan.auto_renewal && <Badge variant="outline" className="text-xs">Auto-Renew</Badge>}
            </div>
            <CardTitle className="text-2xl">{plan.name}</CardTitle>
            <CardDescription>{plan.description}</CardDescription>
          </CardHeader>

          <CardContent className="space-y-4">
            <div>
              <span className="text-4xl font-bold">${Number(plan.price).toFixed(2)}</span>
              {plan.duration_days && (
                <span className="text-muted-foreground ml-2">
                  / {plan.duration_days} {plan.duration_days === 1 ? "day" : "days"}
                </span>
              )}
            </div>

            {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
              <div>
                <h3 className="font-semibold mb-3">What's Included</h3>
                <ul className="space-y-2">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Subscription Form or Status */}
        <Card>
          <CardHeader>
            <CardTitle>
              {existingSubscription ? "Subscription Active" : "Subscribe Now"}
            </CardTitle>
            <CardDescription>
              {existingSubscription
                ? "Manage your active subscription"
                : "Enter your payment details to subscribe"}
            </CardDescription>
          </CardHeader>

          <CardContent>
            {existingSubscription ? (
              <div className="space-y-4">
                <div>
                  <p className="text-sm font-medium">Status</p>
                  <Badge variant="secondary" className="mt-1 capitalize">
                    {existingSubscription.status}
                  </Badge>
                </div>

                {existingSubscription.start_date && (
                  <div>
                    <p className="text-sm font-medium">Start Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(existingSubscription.start_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                {existingSubscription.end_date && (
                  <div>
                    <p className="text-sm font-medium">End Date</p>
                    <p className="text-sm text-muted-foreground">
                      {new Date(existingSubscription.end_date).toLocaleDateString()}
                    </p>
                  </div>
                )}

                <div>
                  <p className="text-sm font-medium">Auto-Renewal</p>
                  <p className="text-sm text-muted-foreground">
                    {existingSubscription.auto_renew ? "Enabled" : "Disabled"}
                  </p>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription>
                    Your subscription will {existingSubscription.auto_renew ? "automatically renew" : "expire"}{" "}
                    {existingSubscription.end_date &&
                      `on ${new Date(existingSubscription.end_date).toLocaleDateString()}`}
                  </AlertDescription>
                </Alert>
              </div>
            ) : (
              <div className="space-y-4">
                {error && (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>{error}</AlertDescription>
                  </Alert>
                )}

                {isLoading && !clientSecret ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin text-primary" />
                    <span className="ml-2">Initializing checkout...</span>
                  </div>
                ) : clientSecret ? (
                  <Elements
                    stripe={stripePromise}
                    options={{
                      clientSecret,
                      appearance: {
                        theme: "stripe",
                      },
                    }}
                  >
                    <StripeCheckoutForm
                      clientSecret={clientSecret}
                      planName={plan.name}
                      planPrice={parseFloat(plan.price)}
                      onSuccess={handlePaymentSuccess}
                      onError={handlePaymentError}
                    />
                  </Elements>
                ) : (
                  <Alert variant="destructive">
                    <AlertCircle className="h-4 w-4" />
                    <AlertDescription>
                      Failed to initialize payment. Please refresh the page.
                    </AlertDescription>
                  </Alert>
                )}
              </div>
            )}
          </CardContent>

          <CardFooter>
            {existingSubscription && (
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Cancel Subscription"}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
