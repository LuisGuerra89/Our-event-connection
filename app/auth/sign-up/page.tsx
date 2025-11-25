"use client"

import type React from "react"

import { createClient } from "@/lib/supabase/client"
import { createUserProfile } from "./actions"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Chrome, Facebook, Upload, Loader2 } from "lucide-react"

export default function SignUpPage() {
  const searchParams = useSearchParams()
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [fullName, setFullName] = useState("")
  const [repeatPassword, setRepeatPassword] = useState("")
  const [referralCode, setReferralCode] = useState("")
  const [profileImage, setProfileImage] = useState<File | null>(null)
  const [profileImagePreview, setProfileImagePreview] = useState<string | null>(null)
  const [imageUploadLoading, setImageUploadLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()

  useEffect(() => {
    const refCode = searchParams.get("ref")
    if (refCode) {
      setReferralCode(refCode)
    }
  }, [searchParams])

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    // Validate file type
    if (!file.type.startsWith("image/")) {
      setError("Please select a valid image file")
      return
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      setError("Image size must be less than 5MB")
      return
    }

    setProfileImage(file)
    // Create preview URL
    const reader = new FileReader()
    reader.onloadend = () => {
      setProfileImagePreview(reader.result as string)
    }
    reader.readAsDataURL(file)
    setError(null)
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault()
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    if (password !== repeatPassword) {
      setError("Passwords do not match")
      setIsLoading(false)
      return
    }

    console.log("[v0] Sign up attempt started")

    try {
      // Check if email already exists in profiles table
      const { data: existingProfile } = await supabase
        .from("profiles")
        .select("id, email")
        .eq("email", email)
        .maybeSingle()

      if (existingProfile) {
        console.log("[v0] Email already exists in profiles:", email)
        setError("Email already exists. Please use a different email or sign in instead.")
        setIsLoading(false)
        return
      }

      const isProduction = typeof window !== "undefined" && window.location.hostname.includes("vercel.app")
      const redirectUrl = isProduction
        ? "https://v0-event-platform-with-ai.vercel.app/auth/callback"
        : `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`

      console.log("[v0] Email redirect URL:", redirectUrl)

      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            full_name: fullName,
            referral_code: referralCode || null,
            profile_image_base64: profileImagePreview || null, // Store base64 for later upload
          },
        },
      })

      if (error) {
        console.log("[v0] Sign up error:", error.message)
        throw error
      }

      console.log("[v0] Sign up successful:", data.user?.id, "email confirmed:", data.user?.email_confirmed_at)

      console.log("[v0] Redirecting to verify-email page")
      router.push("/auth/verify-email")
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
    } finally {
      setIsLoading(false)
    }
  }

  const handleSocialSignUp = async (provider: 'google' | 'facebook') => {
    const supabase = createClient()
    setIsLoading(true)
    setError(null)

    try {
      const { error } = await supabase.auth.signInWithOAuth({
        provider,
        options: {
          redirectTo: `${window.location.origin}/auth/callback`,
          queryParams: {
            access_type: 'offline',
            prompt: 'consent',
          },
        },
      })

      if (error) throw error
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : "An error occurred")
      setIsLoading(false)
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <CardTitle className="text-2xl">Create Account</CardTitle>
            <CardDescription>Join us to discover amazing events and connections</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSignUp}>
              <div className="flex flex-col gap-6">
                {/* Profile Picture Upload */}
                <div className="flex justify-center">
                  <div className="relative">
                    <Avatar className="h-20 w-20">
                      {profileImagePreview ? (
                        <AvatarImage src={profileImagePreview} alt={fullName} />
                      ) : (
                        <AvatarFallback className="bg-primary/10 text-lg font-semibold">
                          {fullName ? getInitials(fullName) : "?"}
                        </AvatarFallback>
                      )}
                    </Avatar>
                    <label
                      htmlFor="profile-image-input"
                      className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
                    >
                      {imageUploadLoading ? (
                        <Loader2 className="h-4 w-4 animate-spin" />
                      ) : (
                        <Upload className="h-4 w-4" />
                      )}
                    </label>
                    <input
                      id="profile-image-input"
                      type="file"
                      accept="image/*"
                      onChange={handleImageSelect}
                      disabled={imageUploadLoading}
                      className="hidden"
                    />
                  </div>
                </div>
                <p className="text-xs text-muted-foreground text-center">
                  {profileImage ? "Image selected ✓" : "Click camera to add profile picture (optional)"}
                </p>

                <div className="grid gap-2">
                  <Label htmlFor="fullName">Full Name</Label>
                  <Input
                    id="fullName"
                    type="text"
                    placeholder="John Doe"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                  />
                </div>
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
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    required
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="repeat-password">Confirm Password</Label>
                  <Input
                    id="repeat-password"
                    type="password"
                    required
                    value={repeatPassword}
                    onChange={(e) => setRepeatPassword(e.target.value)}
                  />
                </div>
                <div className="grid gap-2">
                  <Label htmlFor="referral-code">Referral Code (Optional)</Label>
                  <Input
                    id="referral-code"
                    type="text"
                    placeholder="Enter referral code"
                    value={referralCode}
                    onChange={(e) => setReferralCode(e.target.value.toUpperCase())}
                  />
                  {referralCode && <p className="text-xs text-muted-foreground">You were referred by a friend!</p>}
                </div>
                {error && <p className="text-sm text-red-500">{error}</p>}
                <Button type="submit" className="w-full" disabled={isLoading || imageUploadLoading}>
                  {isLoading ? "Creating account..." : "Sign Up"}
                </Button>

                <div className="relative">
                  <div className="absolute inset-0 flex items-center">
                    <span className="w-full border-t" />
                  </div>
                  <div className="relative flex justify-center text-xs uppercase">
                    <span className="bg-background px-2 text-muted-foreground">Or continue with</span>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignUp('google')}
                    disabled={isLoading}
                  >
                    <Chrome className="mr-2 h-4 w-4" />
                    Google
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => handleSocialSignUp('facebook')}
                    disabled={isLoading}
                  >
                    <Facebook className="mr-2 h-4 w-4" />
                    Facebook
                  </Button>
                </div>
              </div>
              <div className="mt-4 text-center text-sm">
                Already have an account?{" "}
                <Link href="/auth/login" className="underline underline-offset-4">
                  Sign in
                </Link>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
