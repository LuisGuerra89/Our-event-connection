"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { CheckCircle2, AlertCircle, Clock, ArrowLeft } from "lucide-react"
import Link from "next/link"

interface BecomeAffiliateFormProps {
  userId: string
  profile: any
  existingAffiliate: any
}

export function BecomeAffiliateForm({ userId, profile, existingAffiliate }: BecomeAffiliateFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [description, setDescription] = useState(existingAffiliate?.description || "")
  const [address, setAddress] = useState(existingAffiliate?.address || "")
  const [city, setCity] = useState(existingAffiliate?.city || "")
  const [state, setState] = useState(existingAffiliate?.state || "")
  const [country, setCountry] = useState(existingAffiliate?.country || "")
  const router = useRouter()

  // Generate barcode from referral code
  const barcode = profile?.referral_code ? `AFF-${profile.referral_code}` : ""

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const affiliateData = {
        user_id: userId,
        name: profile.full_name || profile.email,
        image_url: profile.profile_photo_url || null,
        description,
        address,
        city,
        state,
        country,
        barcode,
        approval_status: "pending",
        application_date: new Date().toISOString(),
        total_referrals: profile.referral_count || 0,
      }

      if (existingAffiliate) {
        // Update existing application
        const { error } = await supabase
          .from("affiliates")
          .update(affiliateData)
          .eq("id", existingAffiliate.id)

        if (error) throw error
        alert("Application updated successfully!")
      } else {
        // Create new application
        const { error } = await supabase
          .from("affiliates")
          .insert(affiliateData)

        if (error) throw error
        alert("Application submitted successfully! We'll review it shortly.")
      }

      router.push("/dashboard/referrals")
    } catch (err) {
      console.error("Affiliate application error:", err)
      alert("Failed to submit application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const getStatusBadge = () => {
    if (!existingAffiliate) return null

    const statusConfig = {
      pending: {
        icon: Clock,
        label: "Pending Review",
        className: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
      },
      approved: {
        icon: CheckCircle2,
        label: "Approved",
        className: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
      },
      rejected: {
        icon: AlertCircle,
        label: "Rejected",
        className: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
      },
    }

    const config = statusConfig[existingAffiliate.approval_status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/affiliates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Affiliates
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {existingAffiliate ? "Update Affiliate Application" : "Become an Affiliate"}
              </CardTitle>
              <CardDescription>
                {existingAffiliate
                  ? "Update your affiliate application details"
                  : "Apply to become an official affiliate and get recognized for your referrals"}
              </CardDescription>
            </div>
            {getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent>
          {existingAffiliate?.approval_status === "approved" && (
            <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                Congratulations! You are an approved affiliate. You can update your profile details below.
              </AlertDescription>
            </Alert>
          )}

          {existingAffiliate?.approval_status === "rejected" && (
            <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Your previous application was not approved. You can reapply by updating your information below.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Referral Code & Barcode Display */}
            <div className="bg-muted p-4 rounded-lg space-y-3">
              <div>
                <Label className="text-sm font-medium">Your Referral Code</Label>
                <p className="text-2xl font-bold font-mono">{profile?.referral_code || "N/A"}</p>
              </div>
              <div>
                <Label className="text-sm font-medium">Affiliate Barcode</Label>
                <p className="text-lg font-mono text-muted-foreground">{barcode}</p>
                <p className="text-xs text-muted-foreground mt-1">
                  This unique barcode will be assigned to you as an affiliate
                </p>
              </div>
              <div>
                <Label className="text-sm font-medium">Total Referrals</Label>
                <p className="text-xl font-semibold">{profile?.referral_count || 0} members</p>
              </div>
            </div>

            {/* About You */}
            <div>
              <Label htmlFor="description">About You / Why You Want to be an Affiliate</Label>
              <Textarea
                id="description"
                placeholder="Tell us about yourself and why you'd make a great affiliate..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Share your motivation, experience, and how you plan to grow your network
              </p>
            </div>

            {/* Location Information */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="address">Address</Label>
                <Input
                  id="address"
                  placeholder="123 Main Street"
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  required
                  className="mt-2"
                />
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={state}
                    onChange={(e) => setState(e.target.value)}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={country}
                  onChange={(e) => setCountry(e.target.value)}
                  className="mt-2"
                />
              </div>
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription className="text-sm">
                <strong>Note:</strong> Your application will be reviewed by our team. 
                You'll be notified once your affiliate status is approved. In the meantime, 
                you can continue earning rewards through referrals.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button
                type="submit"
                disabled={isLoading || existingAffiliate?.approval_status === "pending"}
                className="flex-1"
                size="lg"
              >
                {isLoading
                  ? "Submitting..."
                  : existingAffiliate?.approval_status === "pending"
                    ? "Application Pending Review"
                    : existingAffiliate
                      ? "Update Application"
                      : "Submit Application"}
              </Button>
              {existingAffiliate?.approval_status !== "pending" && (
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard/referrals">Cancel</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
