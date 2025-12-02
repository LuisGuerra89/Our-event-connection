"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { CheckCircle2, AlertCircle, Clock, ArrowLeft, Loader2 } from "lucide-react"
import Link from "next/link"
import { ImageUpload } from "@/components/admin/image-upload"
import AddressAutocompleteWithLocation from "@/components/address-autocomplete-with-location"

interface LocationData {
  address: string
  city: string
  state: string
  country: string
  countryId?: string
  stateId?: string
  cityId?: string
}

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
  const [imageUrl, setImageUrl] = useState(existingAffiliate?.image_url || "")
  const [successDialog, setSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successTitle, setSuccessTitle] = useState("")
  const [errorMessage, setErrorMessage] = useState("")
  const [hasChanges, setHasChanges] = useState(false)
  const [showNewForm, setShowNewForm] = useState(false)
  const [selectedLocation, setSelectedLocation] = useState<LocationData>({
    address: existingAffiliate?.address || "",
    city: existingAffiliate?.city || "",
    state: existingAffiliate?.state || "",
    country: existingAffiliate?.country || "",
  })
  const [countries, setCountries] = useState<any[]>([])
  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])
  const [loadingData, setLoadingData] = useState(false)
  const router = useRouter()

  // Check if existing affiliate is approved (show option to create new)
  const isApproved = existingAffiliate?.approval_status === "approved" && !showNewForm
  const isPending = existingAffiliate?.approval_status === "pending"
  const isRejected = existingAffiliate?.approval_status === "rejected"

  // Track original values to detect changes
  const [originalValues, setOriginalValues] = useState({
    businessName: existingAffiliate?.name || "",
    description: existingAffiliate?.description || "",
    address: existingAffiliate?.address || "",
    city: existingAffiliate?.city || "",
    state: existingAffiliate?.state || "",
    country: existingAffiliate?.country || "",
    imageUrl: existingAffiliate?.image_url || "",
  })

  // Load countries, states, cities from Supabase
  useEffect(() => {
    const loadLocationData = async () => {
      const supabase = createClient()
      setLoadingData(true)
      try {
        const { data: countriesData } = await supabase.from("countries").select("*").order("name")
        const { data: statesData } = await supabase.from("states").select("*").order("name")
        const { data: citiesData } = await supabase.from("cities").select("*").order("name")
        
        setCountries(countriesData || [])
        setStates(statesData || [])
        setCities(citiesData || [])
      } catch (err) {
        console.error("Error loading location data:", err)
      } finally {
        setLoadingData(false)
      }
    }
    loadLocationData()
  }, [])

  // Update form fields when existingAffiliate changes
  useEffect(() => {
    if (existingAffiliate) {
      console.log("BecomeAffiliateForm - Loading existing affiliate:", existingAffiliate)
      const initialValues = {
        businessName: existingAffiliate.name || "",
        description: existingAffiliate.description || "",
        address: existingAffiliate.address || "",
        city: existingAffiliate.city || "",
        state: existingAffiliate.state || "",
        country: existingAffiliate.country || "",
        imageUrl: existingAffiliate.image_url || "",
      }
      setBusinessName(initialValues.businessName)
      setDescription(initialValues.description)
      setAddress(initialValues.address)
      setCity(initialValues.city)
      setState(initialValues.state)
      setCountry(initialValues.country)
      setImageUrl(initialValues.imageUrl)
      setSelectedLocation({
        address: initialValues.address,
        city: initialValues.city,
        state: initialValues.state,
        country: initialValues.country,
      })
      setOriginalValues(initialValues)
      setHasChanges(false)
    }
  }, [existingAffiliate])

  // Check for changes whenever any field updates
  useEffect(() => {
    const currentValues = {
      businessName,
      description,
      address,
      city,
      state,
      country,
      imageUrl,
    }
    
    const changed = JSON.stringify(currentValues) !== JSON.stringify(originalValues)
    setHasChanges(changed)
  }, [businessName, description, address, city, state, country, imageUrl, originalValues])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setErrorMessage("")

    const supabase = createClient()

    try {
      const affiliateData = {
        user_id: userId,
        name: businessName,
        image_url: imageUrl || null,
        description,
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        country: selectedLocation.country,
        approval_status: "pending",
        application_date: new Date().toISOString(),
      }

      // If showNewForm is true, always create a new application (even if there's an approved one)
      if (existingAffiliate && !showNewForm && (isPending || isRejected)) {
        // Update existing pending or rejected application
        const { error } = await supabase
          .from("affiliates")
          .update(affiliateData)
          .eq("id", existingAffiliate.id)

        if (error) throw error
        setSuccessTitle("Application Updated")
        setSuccessMessage("Your application has been updated successfully!")
        setSuccessDialog(true)
      } else {
        // Create new application (either first time or when showing new form after approved)
        const { error } = await supabase
          .from("affiliates")
          .insert(affiliateData)

        if (error) throw error
        setSubmitted(true)
      }
    } catch (err) {
      console.error("Affiliate application error:", err)
      setErrorMessage("Failed to submit application. Please try again.")
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

  // Screen for approved affiliate (show current status, option to create new)
  if (isApproved && !showNewForm) {
    return (
      <div className="container mx-auto px-4 py-8 max-w-2xl">
        <Button variant="ghost" asChild className="mb-6 w-full sm:w-auto">
          <Link href="/affiliates">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Partners
          </Link>
        </Button>

        <Card className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800">
          <CardHeader>
            <div className="flex items-start gap-4">
              <div className="h-12 w-12 rounded-full bg-green-100 dark:bg-green-900 flex items-center justify-center flex-shrink-0">
                <CheckCircle2 className="h-6 w-6 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <CardTitle className="text-2xl text-green-900 dark:text-green-100">
                  Your Business is an Approved Partner!
                </CardTitle>
                <CardDescription className="text-green-800 dark:text-green-200">
                  Congratulations! Your business is now featured in our partner showcase.
                </CardDescription>
              </div>
            </div>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="bg-white dark:bg-slate-900 p-4 rounded-lg space-y-2">
              <h4 className="font-semibold text-green-900 dark:text-green-100">Current Business Information:</h4>
              <div className="text-sm text-green-800 dark:text-green-200 space-y-2">
                <p><strong>Business Name:</strong> {existingAffiliate?.name}</p>
                <p><strong>Location:</strong> {[existingAffiliate?.city, existingAffiliate?.state, existingAffiliate?.country].filter(Boolean).join(", ") || "Not specified"}</p>
                <p><strong>Description:</strong> {existingAffiliate?.description?.substring(0, 100)}...</p>
              </div>
            </div>

            <Alert className="border-blue-400 bg-blue-50 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                <strong>What's next?</strong> Your business is now visible to all our members. You can update your information anytime or apply with a different business.
              </AlertDescription>
            </Alert>

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button className="flex-1 bg-green-600 hover:bg-green-700" asChild>
                <Link href="/affiliates">
                  View Partner Showcase
                </Link>
              </Button>
              <Button 
                variant="outline" 
                className="flex-1 sm:flex-none"
                onClick={() => {
                  // Clear form to create new application
                  setBusinessName("")
                  setDescription("")
                  setAddress("")
                  setCity("")
                  setState("")
                  setCountry("")
                  setImageUrl("")
                  setShowNewForm(true)
                }}
              >
                Apply with Another Business
              </Button>
              <Button variant="ghost" asChild className="flex-1 sm:flex-none">
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

            <div className="flex flex-col sm:flex-row gap-3 pt-4">
              <Button asChild className="flex-1 bg-green-600 hover:bg-green-700">
                <Link href="/affiliates">
                  View Our Partners
                </Link>
              </Button>
              <Button asChild variant="outline" className="flex-1 sm:flex-none">
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
      <Button variant="ghost" asChild className="mb-6 w-full sm:w-auto">
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
                {showNewForm && isApproved 
                  ? "Apply with Another Business"
                  : existingAffiliate ? "Update Application" : "Become a Partner"}
              </CardTitle>
              <CardDescription>
                {showNewForm && isApproved
                  ? "Submit a partnership application for a different business"
                  : existingAffiliate
                  ? "Update your business partnership application"
                  : "Apply to partner with our platform. We feature approved businesses in our partner showcase."}
              </CardDescription>
            </div>
            {!showNewForm && getStatusBadge()}
          </div>
        </CardHeader>

        <CardContent>
          {!showNewForm && existingAffiliate?.approval_status === "pending" && (
            <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <Clock className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                <strong>Application Under Review:</strong> Your application is currently being reviewed by our team. This usually takes 2-3 business days. 
                You cannot submit a new application while one is pending. Once we make a decision, you'll receive an email notification.
              </AlertDescription>
            </Alert>
          )}

          {!showNewForm && existingAffiliate?.approval_status === "rejected" && (
            <Alert className="mb-6 border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                Your previous application was not approved. You can reapply by updating your information below.
              </AlertDescription>
            </Alert>
          )}

          {showNewForm && isApproved && (
            <Alert className="mb-6 border-blue-400 bg-blue-50 dark:bg-blue-950">
              <AlertCircle className="h-4 w-4 text-blue-600" />
              <AlertDescription className="text-blue-800 dark:text-blue-200">
                You're creating a new partnership application for a different business. Your previous approved business will remain active.
              </AlertDescription>
            </Alert>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Image */}
            <div>
              <Label>Business Logo or Image</Label>
              <p className="text-xs text-muted-foreground mt-1 mb-3">
                Upload a logo or representative image of your business (displayed on partner cards)
              </p>
              <ImageUpload
                value={imageUrl}
                onChange={setImageUrl}
                bucket="affiliates"
                folder="logos"
                maxSize={5}
              />
            </div>

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
                <p className="text-xs text-muted-foreground mb-3">
                  Type an address to search with Google Maps autocomplete
                </p>
                {!loadingData && (
                  <AddressAutocompleteWithLocation
                    onAddressSelect={(location) => {
                      setSelectedLocation(location)
                      setAddress(location.address)
                      setCity(location.city)
                      setState(location.state)
                      setCountry(location.country)
                    }}
                    countries={countries}
                    states={states}
                    cities={cities}
                  />
                )}
              </div>

              <div className="grid md:grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="city">City</Label>
                  <Input
                    id="city"
                    placeholder="City"
                    value={selectedLocation.city}
                    onChange={(e) => setSelectedLocation({...selectedLocation, city: e.target.value})}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label htmlFor="state">State/Province</Label>
                  <Input
                    id="state"
                    placeholder="State"
                    value={selectedLocation.state}
                    onChange={(e) => setSelectedLocation({...selectedLocation, state: e.target.value})}
                    className="mt-2"
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="country">Country</Label>
                <Input
                  id="country"
                  placeholder="Country"
                  value={selectedLocation.country}
                  onChange={(e) => setSelectedLocation({...selectedLocation, country: e.target.value})}
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

            <div className="flex flex-col sm:flex-row gap-3">
              <Button
                type="submit"
                disabled={isLoading || (isPending && !hasChanges && !showNewForm)}
                className="flex-1"
                size="lg"
              >
                {isLoading
                  ? "Submitting..."
                  : showNewForm && isApproved
                    ? "Submit New Application"
                    : isPending && !hasChanges
                      ? "Application Under Review"
                      : isPending && hasChanges
                        ? "Update Application"
                        : existingAffiliate && !showNewForm
                          ? "Update Application"
                          : "Submit Business Application"}
              </Button>
              {!showNewForm && (isPending || isRejected || !existingAffiliate) && (
                <Button type="button" variant="outline" asChild className="flex-1 sm:flex-none">
                  <Link href="/affiliates">Back</Link>
                </Button>
              )}
              {showNewForm && (
                <Button 
                  type="button" 
                  variant="outline"
                  className="flex-1 sm:flex-none"
                  onClick={() => setShowNewForm(false)}
                >
                  Cancel
                </Button>
              )}
            </div>

            {errorMessage && (
              <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
                <AlertCircle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800 dark:text-red-200">
                  {errorMessage}
                </AlertDescription>
              </Alert>
            )}
          </form>
        </CardContent>
      </Card>

      {/* Success Modal */}
      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{successTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{successMessage}</p>
          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessDialog(false)
                router.push("/dashboard")
              }}
            >
              Back to Dashboard
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
