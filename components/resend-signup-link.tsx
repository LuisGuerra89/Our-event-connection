'use client'

import type React from "react"
import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, CheckCircle, AlertCircle } from "lucide-react"

interface ResendSignupLinkProps {
  isDialog?: boolean
  onSuccess?: () => void
}

export function ResendSignupLink({ isDialog = false, onSuccess }: ResendSignupLinkProps) {
  const [email, setEmail] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const supabase = createClient()

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }

      const isProduction = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      const redirectUrl = isProduction
        ? "https://v0-event-platform-with-ai.vercel.app/auth/callback"
        : `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`

      console.log("[v0] Resending signup link to:", email)

      // Use resend sign up for new users (this will send a new confirmation email)
      const { error } = await supabase.auth.signUp({
        email,
        password: "temporary", // Temporary password, user will set their own
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            signup_retry: true,
          },
        },
      })

      if (error) {
        // If user already exists but email not confirmed, we can still send them the link
        if (error.message.includes("already registered")) {
          // For existing unconfirmed users, we need to use a different approach
          // We'll send them a magic link instead
          const { error: linkError } = await supabase.auth.signInWithOtp({
            email,
            options: {
              emailRedirectTo: redirectUrl,
            },
          })

          if (linkError) throw linkError

          setMessage({
            type: "success",
            text: "Signup link has been sent to your email. Please check your inbox and click the link to verify your email.",
          })
        } else {
          throw error
        }
      } else {
        setMessage({
          type: "success",
          text: "Signup link has been sent to your email. Please check your inbox and click the link to verify your email.",
        })
      }

      setEmail("")
      
      // Call onSuccess callback if provided
      if (onSuccess) {
        setTimeout(onSuccess, 2000)
      }
    } catch (error) {
      console.error("[v0] Error resending signup link:", error)
      setMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to send signup link",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="space-y-2">
        <Label htmlFor="resend-email">Email Address</Label>
        <Input
          id="resend-email"
          type="email"
          placeholder="you@example.com"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          disabled={isLoading}
        />
      </div>

      {message && (
        <div className={`p-3 rounded-lg flex items-start gap-2 ${message.type === "error" ? "bg-destructive/10" : "bg-green-500/10"}`}>
          {message.type === "error" ? (
            <AlertCircle className="h-4 w-4 text-destructive mt-0.5 flex-shrink-0" />
          ) : (
            <CheckCircle className="h-4 w-4 text-green-600 mt-0.5 flex-shrink-0" />
          )}
          <p className={`text-sm ${message.type === "error" ? "text-destructive" : "text-green-600"}`}>
            {message.text}
          </p>
        </div>
      )}

      <Button type="submit" className="w-full" disabled={isLoading}>
        {isLoading ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Sending...
          </>
        ) : (
          "Send Signup Link"
        )}
      </Button>

      {isDialog && (
        <p className="text-xs text-muted-foreground text-center">
          We'll send a verification link to your email address
        </p>
      )}
    </form>
  )
}
