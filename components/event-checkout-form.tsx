"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard, Gift, Check, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { sendPaymentConfirmationEmail } from "@/app/events/actions"

interface EventCheckoutFormProps {
  eventId: string
  userId: string
  amount: string
  eventTitle: string
}

interface Coupon {
  id: string
  code: string
  type: string
  discount_amount: number
  created_from_referral_count: number
}

export function EventCheckoutForm({ 
  eventId, 
  userId, 
  amount, 
  eventTitle 
}: EventCheckoutFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [cardDetails, setCardDetails] = useState({
    cardNumber: "",
    cardName: "",
    expiry: "",
    cvv: ""
  })
  const [availableCoupons, setAvailableCoupons] = useState<Coupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<string | null>(null)
  const [isLoadingCoupons, setIsLoadingCoupons] = useState(true)
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null)
  const router = useRouter()
  const { toast } = useToast()

  // Load available coupons on mount
  useEffect(() => {
    const loadCoupons = async () => {
      try {
        const response = await fetch("/api/coupons")
        const data = await response.json()
        
        if (response.ok && data.coupons) {
          setAvailableCoupons(data.coupons)
        }
      } catch (error) {
        console.error("Error loading coupons:", error)
      } finally {
        setIsLoadingCoupons(false)
      }
    }

    loadCoupons()
  }, [])

  const handleInputChange = (field: string, value: string) => {
    // Format card number with spaces
    if (field === "cardNumber") {
      value = value.replace(/\s/g, "").replace(/(\d{4})/g, "$1 ").trim()
      if (value.length > 19) return
    }
    // Format expiry as MM/YY
    else if (field === "expiry") {
      value = value.replace(/\D/g, "")
      if (value.length >= 2) {
        value = value.slice(0, 2) + "/" + value.slice(2, 4)
      }
      if (value.length > 5) return
    }
    // Limit CVV to 4 digits
    else if (field === "cvv") {
      value = value.replace(/\D/g, "")
      if (value.length > 4) return
    }

    setCardDetails(prev => ({ ...prev, [field]: value }))
  }

  const validateForm = () => {
    const { cardNumber, cardName, expiry, cvv } = cardDetails

    if (!cardName.trim()) {
      toast({
        title: "Missing Information",
        description: "Please enter the cardholder name",
        variant: "destructive"
      })
      return false
    }

    if (cardNumber.replace(/\s/g, "").length < 13) {
      toast({
        title: "Invalid Card Number",
        description: "Please enter a valid card number",
        variant: "destructive"
      })
      return false
    }

    if (!expiry.match(/^\d{2}\/\d{2}$/)) {
      toast({
        title: "Invalid Expiry Date",
        description: "Please enter expiry in MM/YY format",
        variant: "destructive"
      })
      return false
    }

    if (cvv.length < 3) {
      toast({
        title: "Invalid CVV",
        description: "Please enter a valid CVV code",
        variant: "destructive"
      })
      return false
    }

    return true
  }

  const handleApplyCoupon = async (couponCode: string) => {
    try {
      const response = await fetch("/api/coupons/validate", {
        method: "POST",
        headers: {
          "Content-Type": "application/json"
        },
        body: JSON.stringify({ code: couponCode })
      })

      const data = await response.json()

      if (response.ok && data.valid) {
        const coupon = availableCoupons.find(c => c.code === couponCode)
        setAppliedCoupon(coupon || null)
        setSelectedCoupon(null)
        toast({
          title: "Coupon Applied!",
          description: "Your Free After Work Activity coupon has been applied. Price is now $0.00",
        })
      } else {
        toast({
          title: "Invalid Coupon",
          description: data.message || "This coupon cannot be applied",
          variant: "destructive"
        })
      }
    } catch (error) {
      console.error("Error applying coupon:", error)
      toast({
        title: "Error",
        description: "Failed to apply coupon. Please try again.",
        variant: "destructive"
      })
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    // If coupon is applied, no card validation needed
    if (!appliedCoupon && !validateForm()) return

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      // Get user email
      const { data: userData } = await supabase
        .from("profiles")
        .select("email, first_name, last_name")
        .eq("id", userId)
        .single()

      // Get event details
      const { data: eventData } = await supabase
        .from("events")
        .select("title, event_date, location")
        .eq("id", eventId)
        .single()

      let totalAmount = 0
      let baseAmount = 0
      let taxAmount = 0
      let discountAmount = 0
      let couponId = null
      let transactionId = ""

      if (appliedCoupon) {
        // Free ticket with coupon
        baseAmount = 0
        taxAmount = 0
        totalAmount = 0
        discountAmount = parseFloat(amount)
        couponId = appliedCoupon.id

        // Redeem the coupon
        const redeemResponse = await fetch("/api/coupons/redeem", {
          method: "POST",
          headers: {
            "Content-Type": "application/json"
          },
          body: JSON.stringify({
            code: appliedCoupon.code,
            eventId: eventId
          })
        })

        if (!redeemResponse.ok) {
          throw new Error("Failed to redeem coupon")
        }
      } else {
        // Regular payment
        baseAmount = parseFloat(amount)
        taxAmount = baseAmount * 0.05 // 5% tax
        totalAmount = baseAmount + taxAmount
      }

      // In production, this would call Stripe API
      // For now, we'll simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Generate transaction ID
      transactionId = `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        event_id: eventId,
        payment_amount: baseAmount,
        tax_amount: taxAmount,
        discount_amount: discountAmount,
        total_amount: totalAmount,
        payment_method: appliedCoupon ? "coupon" : "card",
        payment_status: "success",
        transaction_id: transactionId
      })

      if (paymentError) throw paymentError

      // Register for event
      const { error: registrationError } = await supabase.from("event_attendees").insert({
        event_id: eventId,
        user_id: userId,
        status: "registered"
      })

      if (registrationError) throw registrationError

      // Note: current_attendees is automatically updated by a database trigger
      // when a new event_attendees record is inserted

      // Send confirmation email
      if (userData?.email) {
        const userName = userData.first_name 
          ? `${userData.first_name} ${userData.last_name || ""}`.trim()
          : "Guest"

        const eventDate = eventData?.event_date
          ? new Date(eventData.event_date).toLocaleDateString("en-US", {
              weekday: "long",
              year: "numeric",
              month: "long",
              day: "numeric"
            })
          : "TBA"

        await sendPaymentConfirmationEmail({
          userEmail: userData.email,
          userName: userName,
          eventTitle: eventData?.title || eventTitle,
          eventDate: eventDate,
          eventLocation: eventData?.location || "TBA",
          baseAmount: baseAmount,
          taxAmount: taxAmount,
          discountAmount: discountAmount,
          totalAmount: totalAmount,
          transactionId: transactionId,
          isCouponPayment: !!appliedCoupon
        })
      }

      toast({
        title: appliedCoupon ? "Ticket Claimed!" : "Payment Successful!",
        description: appliedCoupon 
          ? "Your free ticket has been claimed. Check your email for confirmation."
          : "Your ticket has been purchased. Check your email for confirmation.",
      })

      // Redirect to success page
      router.push(`/events/${eventId}/success`)
    } catch (error) {
      console.error("Payment error:", error)
      toast({
        title: "Payment Failed",
        description: "There was an error processing your payment. Please try again.",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {/* Coupon Section */}
      {!appliedCoupon && availableCoupons.length > 0 && !isLoadingCoupons && (
        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-4 space-y-3">
          <div className="flex items-center gap-2">
            <Gift className="w-5 h-5 text-purple-600" />
            <h3 className="font-semibold text-purple-900">
              You have {availableCoupons.length} Free Ticket{availableCoupons.length !== 1 ? "s" : ""}!
            </h3>
          </div>
          <p className="text-sm text-purple-700">
            Earned from your referral rewards. Use one to get this event for free!
          </p>
          
          {availableCoupons.length === 1 ? (
            <Button
              type="button"
              onClick={() => handleApplyCoupon(availableCoupons[0].code)}
              className="w-full bg-purple-600 hover:bg-purple-700"
            >
              <Gift className="w-4 h-4 mr-2" />
              Claim Free Ticket
            </Button>
          ) : (
            <div className="space-y-2">
              <select 
                value={selectedCoupon || ""}
                onChange={(e) => setSelectedCoupon(e.target.value)}
                className="w-full px-3 py-2 border border-purple-200 rounded-md text-sm"
              >
                <option value="">Select a coupon to use...</option>
                {availableCoupons.map(coupon => (
                  <option key={coupon.id} value={coupon.code}>
                    Free Ticket (earned at {coupon.created_from_referral_count} referrals)
                  </option>
                ))}
              </select>
              <Button
                type="button"
                onClick={() => selectedCoupon && handleApplyCoupon(selectedCoupon)}
                disabled={!selectedCoupon}
                className="w-full bg-purple-600 hover:bg-purple-700"
              >
                <Gift className="w-4 h-4 mr-2" />
                Claim Selected Ticket
              </Button>
            </div>
          )}
        </div>
      )}

      {/* Applied Coupon Alert */}
      {appliedCoupon && (
        <Alert className="border-green-200 bg-green-50">
          <Check className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800">
            <strong>Coupon Applied!</strong> Your free After Work Activity coupon has been applied. Total: $0.00
            <button
              type="button"
              onClick={() => setAppliedCoupon(null)}
              className="text-green-600 hover:text-green-700 underline ml-2"
            >
              Remove
            </button>
          </AlertDescription>
        </Alert>
      )}

      {/* Card Payment Section - Only show if no coupon applied */}
      {!appliedCoupon && (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="cardName">Cardholder Name</Label>
            <Input
              id="cardName"
              placeholder="John Doe"
              value={cardDetails.cardName}
              onChange={(e) => handleInputChange("cardName", e.target.value)}
              disabled={isLoading}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cardNumber">Card Number</Label>
            <div className="relative">
              <Input
                id="cardNumber"
                placeholder="1234 5678 9012 3456"
                value={cardDetails.cardNumber}
                onChange={(e) => handleInputChange("cardNumber", e.target.value)}
                disabled={isLoading}
                required
              />
              <CreditCard className="absolute right-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="expiry">Expiry Date</Label>
              <Input
                id="expiry"
                placeholder="MM/YY"
                value={cardDetails.expiry}
                onChange={(e) => handleInputChange("expiry", e.target.value)}
                disabled={isLoading}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="cvv">CVV</Label>
              <Input
                id="cvv"
                type="password"
                placeholder="123"
                value={cardDetails.cvv}
                onChange={(e) => handleInputChange("cvv", e.target.value)}
                disabled={isLoading}
                maxLength={4}
                required
              />
            </div>
          </div>
        </div>
      )}

      <Separator />

      {/* Pricing Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <span className="text-muted-foreground">Ticket Price</span>
          <span className={appliedCoupon ? "line-through text-muted-foreground" : "font-medium"}>
            ${amount}
          </span>
        </div>
        {!appliedCoupon && (
          <div className="flex justify-between items-center">
            <span className="text-muted-foreground">Service Fee</span>
            <span className="font-medium">${(parseFloat(amount) * 0.05).toFixed(2)}</span>
          </div>
        )}
        {appliedCoupon && (
          <div className="flex justify-between items-center text-green-600">
            <span className="font-medium">Discount (Coupon)</span>
            <span className="font-bold">-${amount}</span>
          </div>
        )}
        <div className="flex justify-between text-lg font-bold border-t pt-2">
          <span>Total</span>
          <span className={appliedCoupon ? "text-green-600 text-xl" : ""}>
            ${appliedCoupon ? "0.00" : (parseFloat(amount) * 1.05).toFixed(2)}
          </span>
        </div>
      </div>

      {/* Submit Button */}
      <Button
        type="submit"
        className="w-full"
        size="lg"
        disabled={isLoading}
      >
        {isLoading ? (
          <>
            <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            {appliedCoupon ? "Claiming Ticket..." : "Processing Payment..."}
          </>
        ) : (
          <>
            {appliedCoupon ? (
              <>
                <Gift className="w-4 h-4 mr-2" />
                Claim Free Ticket
              </>
            ) : (
              <>
                <CreditCard className="w-4 h-4 mr-2" />
                Complete Purchase
              </>
            )}
          </>
        )}
      </Button>

      <p className="text-xs text-center text-muted-foreground">
        By completing this purchase, you agree to our{" "}
        <a href="/terms" className="underline hover:text-foreground">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="underline hover:text-foreground">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}
