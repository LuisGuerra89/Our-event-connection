"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import AddressAutocompleteWithLocation from "@/components/address-autocomplete-with-location"

export function EnhancedProfileForm({ profile, countries, enums }: any) {
  const router = useRouter()
  const supabase = createBrowserClient()
  const [formData, setFormData] = useState({
    first_name: profile?.first_name || "",
    last_name: profile?.last_name || "",
    contact_number: profile?.contact_number || "",
    gender: profile?.gender || "",
    date_of_birth: profile?.date_of_birth || "",
    height_cm: profile?.height_cm || "",
    weight_kg: profile?.weight_kg || "",
    skin_tone: profile?.skin_tone || "",
    hair_color: profile?.hair_color || "",
    occupation: profile?.occupation || "",
    hobbies: profile?.hobbies?.join(", ") || "",
    address_1: profile?.address_1 || "",
    address_2: profile?.address_2 || "",
    country_id: profile?.country_id || "",
    state_id: profile?.state_id || "",
    city_id: profile?.city_id || "",
    zip_code: profile?.zip_code || "",
  })

  const [states, setStates] = useState<any[]>([])
  const [cities, setCities] = useState<any[]>([])

  // Filter enums by type
  const skinTones = enums.filter((e: any) => e.enum_type === "skin_tone")
  const hairColors = enums.filter((e: any) => e.enum_type === "hair_color")
  const occupations = enums.filter((e: any) => e.enum_type === "occupation")

  const handleCountryChange = async (countryId: string) => {
    setFormData({ ...formData, country_id: countryId, state_id: "", city_id: "" })
    const { data } = await supabase
      .from("states")
      .select("*")
      .eq("country_id", countryId)
      .eq("status", "active")
      .order("name")
    setStates(data || [])
    setCities([])
  }

  const handleStateChange = async (stateId: string) => {
    setFormData({ ...formData, state_id: stateId, city_id: "" })
    const { data } = await supabase
      .from("cities")
      .select("*")
      .eq("state_id", stateId)
      .eq("status", "active")
      .order("name")
    setCities(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    const updateData = {
      ...formData,
      hobbies: formData.hobbies
        .split(",")
        .map((h) => h.trim())
        .filter(Boolean),
    }

    await supabase.from("profiles").update(updateData).eq("id", profile.id)

    router.push("/dashboard/profile")
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>First Name* (Read Only)</Label>
            <Input value={formData.first_name} disabled />
          </div>

          <div className="space-y-2">
            <Label>Last Name* (Read Only)</Label>
            <Input value={formData.last_name} disabled />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contact_number">Contact Number*</Label>
            <Input
              id="contact_number"
              value={formData.contact_number}
              onChange={(e) => setFormData({ ...formData, contact_number: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender">Gender*</Label>
            <Select value={formData.gender} onValueChange={(value) => setFormData({ ...formData, gender: value })}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="male">Male</SelectItem>
                <SelectItem value="female">Female</SelectItem>
                <SelectItem value="other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="date_of_birth">Date of Birth*</Label>
            <Input
              id="date_of_birth"
              type="date"
              value={formData.date_of_birth}
              onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Physical Attributes</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label htmlFor="height_cm">Height (cm)*</Label>
            <Input
              id="height_cm"
              type="number"
              value={formData.height_cm}
              onChange={(e) => setFormData({ ...formData, height_cm: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight_kg">Weight (kg)*</Label>
            <Input
              id="weight_kg"
              type="number"
              step="0.1"
              value={formData.weight_kg}
              onChange={(e) => setFormData({ ...formData, weight_kg: e.target.value })}
              required
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="skin_tone">Skin Tone*</Label>
            <Select
              value={formData.skin_tone}
              onValueChange={(value) => setFormData({ ...formData, skin_tone: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select skin tone" />
              </SelectTrigger>
              <SelectContent>
                {skinTones.map((tone: any) => (
                  <SelectItem key={tone.id} value={tone.enum_value}>
                    {tone.enum_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hair_color">Hair Color*</Label>
            <Select
              value={formData.hair_color}
              onValueChange={(value) => setFormData({ ...formData, hair_color: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select hair color" />
              </SelectTrigger>
              <SelectContent>
                {hairColors.map((color: any) => (
                  <SelectItem key={color.id} value={color.enum_value}>
                    {color.enum_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Professional & Interests</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 gap-4">
          <div className="space-y-2">
            <Label htmlFor="occupation">Occupation*</Label>
            <Select
              value={formData.occupation}
              onValueChange={(value) => setFormData({ ...formData, occupation: value })}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select occupation" />
              </SelectTrigger>
              <SelectContent>
                {occupations.map((occ: any) => (
                  <SelectItem key={occ.id} value={occ.enum_value}>
                    {occ.enum_title}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="hobbies">Hobbies (comma-separated)*</Label>
            <Input
              id="hobbies"
              value={formData.hobbies}
              onChange={(e) => setFormData({ ...formData, hobbies: e.target.value })}
              placeholder="Reading, Hiking, Cooking"
              required
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Address Information</CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="md:col-span-2 space-y-2">
            <AddressAutocompleteWithLocation
              label="Address Line 1*"
              placeholder="Enter your street address"
              onAddressSelect={(data) => {
                setFormData({
                  ...formData,
                  address_1: data.address,
                  country_id: data.countryId || formData.country_id,
                  state_id: data.stateId || "",
                  city_id: data.cityId || "",
                })
              }}
              countries={countries}
              states={[]}
              cities={[]}
              initialAddress={formData.address_1}
            />
          </div>

          <div className="md:col-span-2 space-y-2">
            <Label htmlFor="address_2">Address Line 2</Label>
            <Input
              id="address_2"
              value={formData.address_2}
              onChange={(e) => setFormData({ ...formData, address_2: e.target.value })}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="country_id">Country*</Label>
            <Select value={formData.country_id} onValueChange={handleCountryChange}>
              <SelectTrigger>
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent>
                {countries.map((country: any) => (
                  <SelectItem key={country.id} value={country.id}>
                    {country.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="state_id">State*</Label>
            <Select value={formData.state_id} onValueChange={handleStateChange} disabled={!formData.country_id}>
              <SelectTrigger>
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent>
                {states.map((state: any) => (
                  <SelectItem key={state.id} value={state.id}>
                    {state.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="city_id">City*</Label>
            <Select
              value={formData.city_id}
              onValueChange={(value) => setFormData({ ...formData, city_id: value })}
              disabled={!formData.state_id}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select city" />
              </SelectTrigger>
              <SelectContent>
                {cities.map((city: any) => (
                  <SelectItem key={city.id} value={city.id}>
                    {city.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="space-y-2">
            <Label htmlFor="zip_code">Zip Code*</Label>
            <Input
              id="zip_code"
              value={formData.zip_code}
              onChange={(e) => setFormData({ ...formData, zip_code: e.target.value })}
              required
            />
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
        <Button type="submit">Save Changes</Button>
      </div>
    </form>
  )
}
