"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Check, CreditCard, ArrowLeft, AlertCircle, Gift } from "lucide-react"
import Link from "next/link"
import { Alert, AlertDescription } from "@/components/ui/alert"

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
  const [autoRenew, setAutoRenew] = useState(plan.auto_renewal)
  const [cardNumber, setCardNumber] = useState("")
  const [cardExpiry, setCardExpiry] = useState("")
  const [cardCvv, setCardCvv] = useState("")
  const [cardName, setCardName] = useState("")
  const router = useRouter()

  const handleCardNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\s/g, "")
    const formattedValue = value.replace(/(\d{4})/g, "$1 ").trim()
    setCardNumber(formattedValue)
  }

  const handleExpiryChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    let value = e.target.value.replace(/\D/g, "")
    if (value.length >= 2) {
      value = value.slice(0, 2) + "/" + value.slice(2, 4)
    }
    setCardExpiry(value)
  }

  const handleCvvChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value.replace(/\D/g, "").slice(0, 4)
    setCardCvv(value)
  }

  const handleSubscribe = async () => {
    if (!cardNumber || !cardExpiry || !cardCvv || !cardName) {
      alert("Please fill in all payment details")
      return
    }

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
        auto_renew: autoRenew,
        status: "active",
      })

      if (subError) throw subError

      // Record payment
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        amount: plan.price,
        payment_type: "subscription",
        payment_status: "completed",
        payment_method: "card",
        reference_id: plan.id,
      })

      if (paymentError) console.error("Payment record error:", paymentError)

      router.push("/membership/success")
    } catch (err) {
      console.error("Subscription error:", err)
      alert("Failed to process subscription. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

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
                <div>
                  <Label htmlFor="cardName">Cardholder Name</Label>
                  <Input
                    id="cardName"
                    placeholder="John Doe"
                    value={cardName}
                    onChange={(e) => setCardName(e.target.value)}
                  />
                </div>

                <div>
                  <Label htmlFor="cardNumber">Card Number</Label>
                  <Input
                    id="cardNumber"
                    placeholder="1234 5678 9012 3456"
                    value={cardNumber}
                    onChange={handleCardNumberChange}
                    maxLength={19}
                  />
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Expiry Date</Label>
                    <Input
                      id="cardExpiry"
                      placeholder="MM/YY"
                      value={cardExpiry}
                      onChange={handleExpiryChange}
                      maxLength={5}
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      placeholder="123"
                      value={cardCvv}
                      onChange={handleCvvChange}
                      maxLength={4}
                      type="password"
                    />
                  </div>
                </div>

                <div className="flex items-center space-x-2">
                  <Checkbox
                    id="autoRenew"
                    checked={autoRenew}
                    onCheckedChange={(checked) => setAutoRenew(checked as boolean)}
                  />
                  <Label htmlFor="autoRenew" className="text-sm cursor-pointer">
                    Enable auto-renewal (cancel anytime)
                  </Label>
                </div>

                <Alert>
                  <AlertCircle className="h-4 w-4" />
                  <AlertDescription className="text-xs">
                    By subscribing, you agree to our terms. Your subscription will{" "}
                    {autoRenew ? "automatically renew" : "not renew"} unless cancelled.
                  </AlertDescription>
                </Alert>
              </div>
            )}
          </CardContent>

          <CardFooter>
            {existingSubscription ? (
              <Button
                variant="destructive"
                onClick={handleCancelSubscription}
                disabled={isLoading}
                className="w-full"
              >
                {isLoading ? "Processing..." : "Cancel Subscription"}
              </Button>
            ) : (
              <Button onClick={handleSubscribe} disabled={isLoading} className="w-full" size="lg">
                {isLoading ? (
                  "Processing..."
                ) : (
                  <>
                    <CreditCard className="h-4 w-4 mr-2" />
                    Subscribe for ${Number(plan.price).toFixed(2)}
                  </>
                )}
              </Button>
            )}
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
