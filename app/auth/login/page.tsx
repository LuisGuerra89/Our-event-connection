"use client"

import type React from "react"
import { useSearchParams } from "next/navigation"

import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { useState, useEffect } from "react"
import { Chrome, Facebook, AlertCircle, Mail } from "lucide-react"

export default function LoginPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [showResendEmail, setShowResendEmail] = useState(false)
  const [resendLoading, setResendLoading] = useState(false)
  const [resendMessage, setResendMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const [tokenExpired, setTokenExpired] = useState(false)
  const router = useRouter()

  // Check if coming from signup with existing email
  useEffect(() => {
    const emailParam = searchParams?.get("email")
    const showResend = searchParams?.get("show_resend")
    const tokenExpiredParam = searchParams?.get("token_expired")
    
    if (emailParam) {
      setEmail(decodeURIComponent(emailParam))
    }
    
    if (showResend === "true") {
      setShowResendEmail(true)
    }
    
    if (tokenExpiredParam === "true") {
      setTokenExpired(true)
      setShowResendEmail(true)
    }
  }, [searchParams])

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      })

      if (error) {
        console.log("[v0] Login error:", error.message, "code:", error.code)
        
        // Check if this is an email confirmation issue - handle multiple possible messages
        const isEmailNotConfirmed = 
          error.message?.toLowerCase().includes("email not confirmed") ||
          error.message?.toLowerCase().includes("email is not confirmed") ||
          error.code === "email_not_confirmed" ||
          error.status === 400 && error.message?.includes("confirm")
        
        if (isEmailNotConfirmed) {
          console.log("[v0] Email not confirmed for:", email)
          setShowResendEmail(true)
          setPassword("")
          setError(null)
          setIsLoading(false)
          return
        }
        
        throw error
      }

      await checkProfileAndRedirect(data.user.id)
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const handleResendConfirmationEmail = async () => {
    const supabase = createClient()
    setResendLoading(true)
    setResendMessage(null)

    try {
      if (!email.trim()) {
        throw new Error("Please enter your email address")
      }

      const isProduction = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      const redirectUrl = isProduction
        ? "https://v0-event-platform-with-ai.vercel.app/auth/callback"
        : `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`

      console.log("[v0] Resending confirmation email to:", email)

      // Use signInWithOtp to send a new confirmation link
      const { error } = await supabase.auth.signInWithOtp({
        email,
        options: {
          emailRedirectTo: redirectUrl,
          shouldCreateUser: false,
        },
      })

      if (error) {
        console.log("[v0] OTP error:", error.message, "code:", error.code)
        
        // Handle specific error cases
        if (error.message?.includes("Signups not allowed for otp") || error.code === "otp_disabled") {
          throw new Error("This email address doesn't have an account yet. Please make sure you're using the correct email address, or sign up if you don't have an account.")
        }
        
        throw error
      }

      setResendMessage({
        type: "success",
        text: "Confirmation email has been sent! Check your inbox and click the link to verify your account.",
      })
      
      // Reset form and hide resend section after 3 seconds
      setTimeout(() => {
        setShowResendEmail(false)
        setEmail("")
        setPassword("")
      }, 3000)
    } catch (error) {
      console.error("[v0] Error resending confirmation email:", error)
      setResendMessage({
        type: "error",
        text: error instanceof Error ? error.message : "Failed to resend confirmation email",
      })
    } finally {
      setResendLoading(false)
    }
  }

  const handleSocialLogin = async (provider: 'google' | 'facebook') => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  const checkProfileAndRedirect = async (userId: string) => {
    const supabase = createClient()

    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, is_profile_complete, status, roles(role_name)")
      .eq("id", userId)
      .maybeSingle()

    console.log("[v0] Login - User profile:", { userId, profile })

    // If user is admin or moderator, check status
    const roleName = (profile?.roles as { role_name: string } | null)?.role_name
    if (profile && (roleName === "admin" || roleName === "moderator")) {
      // Check if admin user is active
      if (profile.status !== "active") {
        console.log("[v0] Login - Admin user is inactive, logging out")
        await supabase.auth.signOut()
        setError(`Your admin account is ${profile.status}. Please contact support.`)
        setIsLoading(false)
        return
      }

      console.log("[v0] Login - User is admin/moderator, redirecting to /admin")
      router.push("/admin")
      return
    }

    // Check if social login user needs to complete profile
    if (profile && profile.is_profile_complete === false) {
      router.push("/onboarding/complete-profile")
      return
    }

    // Check if user has completed waiver
    const { data: waiver } = await supabase.from("waivers").select("id").eq("user_id", userId).maybeSingle()

    if (!waiver) {
      router.push("/onboarding/waiver")
    } else {
      // User is logged in, waiver complete - stay on current page or go to home
      router.push("/")
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">
              {showResendEmail ? "Verify Your Email" : "Welcome Back"}
            </CardTitle>
            <CardDescription>
              {showResendEmail 
                ? "We'll send you a new confirmation link" 
                : "Sign in to your account to continue"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            {showResendEmail ? (
              // Resend email section
              <div className="space-y-4">
                {tokenExpired ? (
                  <div className="flex items-start gap-3 p-3 bg-amber-50 border border-amber-200 rounded-lg">
                    <AlertCircle className="h-5 w-5 text-amber-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-amber-900">Verification link expired</p>
                      <p className="text-xs text-amber-800 mt-1">
                        Your email verification link has expired or is invalid. We'll send you a new one.
                      </p>
                    </div>
                  </div>
                ) : (
                  <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <Mail className="h-5 w-5 text-blue-600 mt-0.5 flex-shrink-0" />
                    <div className="flex-1">
                      <p className="text-sm font-medium text-blue-900">Email not verified</p>
                      <p className="text-xs text-blue-800 mt-1">
                        Your email hasn't been confirmed yet. We can send you a new verification link.
                      </p>
                    </div>
                  </div>
                )}

                <div className="space-y-3">
                  <div>
                    <Label htmlFor="resend-email">Email Address</Label>
                    <Input
                      id="resend-email"
                      type="email"
                      placeholder="you@example.com"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      disabled={resendLoading}
                      className="mt-1"
                    />
                  </div>

                  {resendMessage && (
                    <div className={`p-3 rounded-lg text-sm ${
                      resendMessage.type === "error" 
                        ? "bg-red-50 text-red-800 border border-red-200" 
                        : "bg-green-50 text-green-800 border border-green-200"
                    }`}>
                      {resendMessage.text}
                    </div>
                  )}

                  <div className="space-y-2">
                    <Button 
                      onClick={handleResendConfirmationEmail} 
                      className="w-full"
                      disabled={resendLoading || !email.trim()}
                    >
                      {resendLoading ? "Sending..." : "Send Verification Link"}
                    </Button>
                    <Button 
                      onClick={() => setShowResendEmail(false)} 
                      variant="outline" 
                      className="w-full"
                      disabled={resendLoading}
                    >
                      Back to Sign In
                    </Button>
                  </div>
                </div>
              </div>
            ) : (
              // Normal login section
              <form onSubmit={handleLogin}>
                <div className="flex flex-col gap-6">
                  <div className="grid gap-2">
                    <Label htmlFor="email">Email</Label>
                    <Input
                      id="email"
                      type="email"
                      placeholder="you@example.com"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                    />
                  </div>
                  <div className="grid gap-2">
                    <div className="flex items-center justify-between">
                      <Label htmlFor="password">Password</Label>
                      <Link
                        href="/auth/forgot-password"
                        className="text-sm text-primary underline-offset-4 hover:underline"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <Input
                      id="password"
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                    />
                  </div>
                  {error && (
                    <div className="flex items-start gap-2 p-3 bg-red-50 border border-red-200 rounded-lg">
                      <AlertCircle className="h-4 w-4 text-red-600 mt-0.5 flex-shrink-0" />
                      <p className="text-sm text-red-800">{error}</p>
                    </div>
                  )}
                  <Button type="submit" className="w-full" disabled={isLoading}>
                    {isLoading ? "Signing in..." : "Sign In"}
                  </Button>
                  
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <span className="w-full border-t" />
                    </div>
                    <div className="relative flex justify-center text-xs uppercase">
                      <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 gap-4">
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => handleSocialLogin('google')}
                      disabled={isLoading}
                    >
                      <Chrome className="mr-2 h-4 w-4" />
                      Google
                    </Button>
                  </div>
                </div>
                <div className="mt-4 text-center text-sm">
                  Don&apos;t have an account?{" "}
                  <Link href="/auth/sign-up" className="underline underline-offset-4">
                    Sign up
                  </Link>
                </div>
              </form>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
