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
  const [submitted, setSubmitted] = useState(false)
  const [businessName, setBusinessName] = useState(existingAffiliate?.name || "")
  const [description, setDescription] = useState(existingAffiliate?.description || "")
  const [address, setAddress] = useState(existingAffiliate?.address || "")
  const [city, setCity] = useState(existingAffiliate?.city || "")
  const [state, setState] = useState(existingAffiliate?.state || "")
  const [country, setCountry] = useState(existingAffiliate?.country || "")
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    const supabase = createClient()

    try {
      const affiliateData = {
        user_id: userId,
        name: businessName,
        image_url: profile.profile_photo_url || null,
        description,
        address,
        city,
        state,
        country,
        approval_status: "pending",
        application_date: new Date().toISOString(),
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
      }

      setSubmitted(true)
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

  // Success screen for new applications
  if (submitted && !existingAffiliate) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                  Application Submitted!
                </CardTitle>
                <CardDescription className="text-green-800 dark:text-green-200">
                  Your business partnership application has been received.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <Alert className="border-green-400 bg-white dark:bg-slate-900">
              <Clock className="h-4 w-4 text-green-600" />
              <AlertDescription>
                <strong>Under Review:</strong> Our team is reviewing your application. This typically takes 2-3 business days.
              </AlertDescription>
            </Alert>

            <div className="space-y-4 pt-4">
              <h3 className="font-semibold text-green-900 dark:text-green-100">What happens next?</h3>
              <ol className="space-y-3 text-sm text-green-800 dark:text-green-200 list-decimal list-inside">
                <li>We verify your business information</li>
                <li>Our team reviews your partnership fit</li>
                <li>You'll receive an email with our decision</li>
                <li>Once approved, your business appears in our partner showcase</li>
              </ol>
            </div>

            <div className="bg-green-100 dark:bg-green-900/30 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-green-900 dark:text-green-100 text-sm">Business Details Submitted:</h4>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-1">
                <p><strong>Business Name:</strong> {businessName}</p>
                <p><strong>Location:</strong> {[city, state, country].filter(Boolean).join(", ") || "Not specified"}</p>
              </div>
            </div>

            <Alert className="border-blue-400 bg-blue-50 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>Tip:</strong> In the meantime, you can explore our platform and see how other partners are featured.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3 pt-4">
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                <Link href="/affiliates">
                  View Our Partners
                </Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">
                  Back to Dashboard
                </Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/affiliates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">
                {existingAffiliate ? "Update Application" : "Become a Partner"}
              </CardTitle>
              <CardDescription>
                {existingAffiliate
                  ? "Update your business partnership application"
                  : "Apply to partner with our platform. We feature approved businesses in our partner showcase."}
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
                Congratulations! Your business is an approved partner. You can update your profile details below.
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
            {/* Business Information */}
            <div>
              <Label htmlFor="businessName">Business/Company Name</Label>
              <Input
                id="businessName"
                placeholder="Your business name"
                value={businessName}
                onChange={(e) => setBusinessName(e.target.value)}
                required
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                The official name of your business or restaurant
              </p>
            </div>

            {/* About Your Business */}
            <div>
              <Label htmlFor="description">About Your Business</Label>
              <Textarea
                id="description"
                placeholder="Describe your business: what do you offer, your target audience, why you want to partner with us..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                required
                rows={5}
                className="mt-2"
              />
              <p className="text-xs text-muted-foreground mt-1">
                Help us understand your business model and how we can collaborate
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
                <strong>How it works:</strong> Submit your business information and our team will review your application. 
                Once approved, your business will be featured in our affiliate showcase and users will see your discounts and offers.
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
                    ? "Application Under Review"
                    : existingAffiliate
                      ? "Update Application"
                      : "Submit Business Application"}
              </Button>
              {existingAffiliate?.approval_status !== "pending" && (
                <Button type="button" variant="outline" asChild>
                  <Link href="/dashboard">Back</Link>
                </Button>
              )}
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
