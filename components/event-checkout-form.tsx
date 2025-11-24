"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { useToast } from "@/hooks/use-toast"
import { Loader2, CreditCard } from "lucide-react"

interface EventCheckoutFormProps {
  eventId: string
  userId: string
  amount: string
  eventTitle: string
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
  const router = useRouter()
  const { toast } = useToast()

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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    if (!validateForm()) return

    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      // In production, this would call Stripe API
      // For now, we'll simulate payment processing
      await new Promise(resolve => setTimeout(resolve, 2000))

      // Calculate amounts
      const baseAmount = parseFloat(amount)
      const taxAmount = baseAmount * 0.05 // 5% tax
      const totalAmount = baseAmount + taxAmount

      // Create payment record
      const { error: paymentError } = await supabase.from("payments").insert({
        user_id: userId,
        event_id: eventId,
        payment_amount: baseAmount,
        tax_amount: taxAmount,
        total_amount: totalAmount,
        payment_method: "card",
        payment_status: "success",
        transaction_id: `txn_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
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

      toast({
        title: "Payment Successful!",
        description: "Your ticket has been purchased. Check your email for confirmation.",
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

      <Separator />

      <div className="space-y-4">
        <div className="flex justify-between items-center text-lg font-bold">
          <span>Total Amount</span>
          <span>${amount}</span>
        </div>

        <Button
          type="submit"
          className="w-full"
          size="lg"
          disabled={isLoading}
        >
          {isLoading ? (
            <>
              <Loader2 className="w-4 h-4 mr-2 animate-spin" />
              Processing Payment...
            </>
          ) : (
            <>
              <CreditCard className="w-4 h-4 mr-2" />
              Complete Purchase
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
      </div>
    </form>
  )
}
