"use client"

import React, { useState, useEffect } from "react"
import {
  PaymentElement,
  LinkAuthenticationElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { AlertCircle, Loader2 } from "lucide-react"

interface StripeCheckoutFormProps {
  clientSecret: string
  planName: string
  planPrice: number
  onSuccess?: () => void
  onError?: (error: string) => void
}

export function StripeCheckoutForm({
  clientSecret,
  planName,
  planPrice,
  onSuccess,
  onError,
}: StripeCheckoutFormProps) {
  const stripe = useStripe()
  const elements = useElements()
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [message, setMessage] = useState<string | null>(null)

  useEffect(() => {
    if (!stripe) {
      return
    }

    // Fetch the payment intent status if needed
    stripe
      .retrievePaymentIntent(clientSecret)
      .then(({ paymentIntent }) => {
        console.log("Payment Intent Status:", paymentIntent?.status)
        switch (paymentIntent?.status) {
          case "succeeded":
            console.log("Payment succeeded - calling onSuccess")
            setMessage("Payment succeeded!")
            // Call onSuccess only once
            setTimeout(() => {
              onSuccess?.()
            }, 500)
            break
          case "processing":
            console.log("Payment processing - calling onSuccess")
            setMessage("Your payment is processing.")
            // Call onSuccess only once
            setTimeout(() => {
              onSuccess?.()
            }, 500)
            break
          case "requires_payment_method":
            setMessage("Your payment was not successful, please try again.")
            break
          default:
            setMessage("Something went wrong.")
            break
        }
      })
      .catch((err) => console.error("Error retrieving payment intent:", err))
  }, [stripe, clientSecret])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!stripe || !elements) {
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const { error: submitError } = await elements.submit()

      if (submitError) {
        setError(submitError.message || "Payment failed")
        onError?.(submitError.message || "Payment failed")
        setIsLoading(false)
        return
      }

      // Confirm payment with Stripe
      const { error: confirmError, paymentIntent } = await stripe.confirmPayment({
        elements,
        clientSecret,
        confirmParams: {
          return_url: `${window.location.origin}/membership/success`,
          receipt_email: email,
        },
        redirect: "if_required",
      })

      if (confirmError) {
        setError(confirmError.message || "Payment failed")
        onError?.(confirmError.message || "Payment failed")
        setIsLoading(false)
      } else if (paymentIntent?.status === "succeeded") {
        setMessage("Payment succeeded!")
        console.log("Payment succeeded - calling onSuccess")
        onSuccess?.()
      } else if (paymentIntent?.status === "processing") {
        setMessage("Your payment is processing.")
        console.log("Payment processing - calling onSuccess")
        onSuccess?.()
      } else {
        setMessage(`Payment status: ${paymentIntent?.status}`)
      }
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "An error occurred"
      setError(errorMessage)
      onError?.(errorMessage)
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      {message && (
        <Alert>
          <AlertDescription>{message}</AlertDescription>
        </Alert>
      )}

      <LinkAuthenticationElement
        id="link-authentication"
        onChange={(e) => setEmail(e.value.email)}
      />

      <PaymentElement
        id="payment-element"
        options={{
          layout: "tabs",
        }}
      />

      <div className="bg-slate-100 p-4 rounded-lg">
        <div className="flex justify-between items-center mb-2">
          <span className="text-sm text-slate-600">Plan:</span>
          <span className="font-medium">{planName}</span>
        </div>
        <div className="flex justify-between items-center border-t pt-2">
          <span className="font-semibold">Total:</span>
          <span className="text-lg font-bold">${planPrice.toFixed(2)}</span>
        </div>
      </div>

      <Button
        disabled={isLoading || !stripe || !elements}
        type="submit"
        className="w-full"
        size="lg"
      >
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Processing...
          </>
        ) : (
          `Pay $${planPrice.toFixed(2)}`
        )}
      </Button>
    </form>
  )
}
