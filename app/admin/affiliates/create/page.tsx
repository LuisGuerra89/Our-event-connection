"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"
import { ImageUpload } from "@/components/admin/image-upload"
import AddressAutocompleteWithLocation from "@/components/address-autocomplete-with-location"

interface LocationData {
  address: string
  country: string
  state: string
  city: string
  countryId?: string
  stateId?: string
  cityId?: string
}

interface Country {
  id: string
  name: string
}

interface State {
  id: string
  name: string
  country_id: string
  code?: string
}

interface City {
  id: string
  name: string
  state_id: string
}

export default function CreateAffiliatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const [imageUrl, setImageUrl] = useState("")
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loadingData, setLoadingData] = useState(true)
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(null)
  
  const router = useRouter()
  const supabase = createClient()

  // Load countries, states, and cities
  useEffect(() => {
    const loadLocationData = async () => {
      try {
        const [countriesRes, statesRes, citiesRes] = await Promise.all([
          supabase.from("countries").select("id, name").order("name"),
          supabase.from("states").select("id, name, country_id, code").order("name"),
          supabase.from("cities").select("id, name, state_id").order("name"),
        ])

        if (countriesRes.data) setCountries(countriesRes.data)
        if (statesRes.data) setStates(statesRes.data)
        if (citiesRes.data) setCities(citiesRes.data)
      } catch (error) {
        console.error("Error loading location data:", error)
      } finally {
        setLoadingData(false)
      }
    }

    loadLocationData()
  }, [supabase])

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string
      const description = formData.get("description") as string

      if (!selectedLocation) {
        alert("Please select an address from the autocomplete")
        setIsLoading(false)
        return
      }

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        alert("You must be logged in")
        return
      }

      const { error } = await supabase.from("affiliates").insert({
        user_id: userData.user.id,
        name,
        image_url: imageUrl || null,
        description,
        address: selectedLocation.address,
        city: selectedLocation.city,
        state: selectedLocation.state,
        country: selectedLocation.country,
        city_id: selectedLocation.cityId || null,
        state_id: selectedLocation.stateId || null,
        country_id: selectedLocation.countryId || null,
        approval_status: "pending",
        application_date: new Date().toISOString(),
      })

      if (error) {
        alert("Error creating partner: " + error.message)
        return
      }

      router.push("/admin/affiliates?success=created")
    } catch (err) {
      console.error(err)
      alert("Error creating partner")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/affiliates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Partner</CardTitle>
          <CardDescription>Create a new affiliate partner manually</CardDescription>
        </CardHeader>

        <CardContent>
          {loadingData ? (
            <div className="flex justify-center py-8">
              <p className="text-muted-foreground">Loading location data...</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Business Image */}
              <div>
                <Label>Business Logo or Image</Label>
                <p className="text-xs text-muted-foreground mt-1 mb-3">
                  Upload a logo or representative image of the business
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
                <Label htmlFor="name">Business Name *</Label>
                <Input
                  id="name"
                  name="name"
                  placeholder="Business or Company Name"
                  required
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  name="description"
                  placeholder="Describe the business..."
                  required
                  disabled={isLoading}
                  rows={4}
                  className="mt-2"
                />
              </div>

            {/* Address Autocomplete */}
            <AddressAutocompleteWithLocation
              label="Business Address"
              placeholder="Enter business address"
              onAddressSelect={setSelectedLocation}
              countries={countries}
              states={states}
              cities={cities}
              disabled={isLoading}
            />

            {/* Location Fields - Auto-filled but editable */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  disabled={isLoading}
                  className="mt-2"
                  value={selectedLocation?.city || ""}
                  onChange={(e) => {
                    if (selectedLocation) {
                      setSelectedLocation({ ...selectedLocation, city: e.target.value })
                    }
                  }}
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  disabled={isLoading}
                  className="mt-2"
                  value={selectedLocation?.state || ""}
                  onChange={(e) => {
                    if (selectedLocation) {
                      setSelectedLocation({ ...selectedLocation, state: e.target.value })
                    }
                  }}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                disabled={isLoading}
                className="mt-2"
                value={selectedLocation?.country || ""}
                onChange={(e) => {
                  if (selectedLocation) {
                    setSelectedLocation({ ...selectedLocation, country: e.target.value })
                  }
                }}
              />
            </div>

              <Alert>
                <AlertCircle className="h-4 w-4" />
                <AlertDescription>
                  This affiliate will be created with "Pending Review" status. You can approve or reject it from the details page.
                </AlertDescription>
              </Alert>

              <div className="flex gap-3">
                <Button type="submit" className="flex-1" size="lg" disabled={isLoading || !selectedLocation}>
                  {isLoading ? "Creating..." : "Create Partner"}
                </Button>
                <Button type="button" variant="outline" asChild disabled={isLoading}>
                  <Link href="/admin/affiliates">Cancel</Link>
                </Button>
              </div>
            </form>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
