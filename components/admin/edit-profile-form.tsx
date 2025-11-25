"use client"

import type React from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useState } from "react"
import { updateAdminProfile } from "@/app/admin/profile/actions"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"

// US States data
const US_STATES = [
  "Alabama", "Alaska", "Arizona", "Arkansas", "California", "Colorado", "Connecticut", "Delaware",
  "Florida", "Georgia", "Hawaii", "Idaho", "Illinois", "Indiana", "Iowa", "Kansas", "Kentucky",
  "Louisiana", "Maine", "Maryland", "Massachusetts", "Michigan", "Minnesota", "Mississippi",
  "Missouri", "Montana", "Nebraska", "Nevada", "New Hampshire", "New Jersey", "New Mexico",
  "New York", "North Carolina", "North Dakota", "Ohio", "Oklahoma", "Oregon", "Pennsylvania",
  "Rhode Island", "South Carolina", "South Dakota", "Tennessee", "Texas", "Utah", "Vermont",
  "Virginia", "Washington", "West Virginia", "Wisconsin", "Wyoming"
]

const POPULAR_CITIES: { [key: string]: string[] } = {
  "California": ["Los Angeles", "San Francisco", "San Diego", "Sacramento", "Oakland", "San Jose"],
  "Texas": ["Houston", "Dallas", "Austin", "San Antonio", "Fort Worth", "Arlington"],
  "Florida": ["Miami", "Orlando", "Tampa", "Jacksonville", "Tallahassee", "Fort Lauderdale"],
  "New York": ["New York City", "Buffalo", "Rochester", "Albany", "Syracuse", "Yonkers"],
  "Illinois": ["Chicago", "Springfield", "Peoria", "Aurora", "Rockford", "Evanston"],
  "Pennsylvania": ["Philadelphia", "Pittsburgh", "Allentown", "Erie", "Reading", "Scranton"],
  "Ohio": ["Columbus", "Cleveland", "Cincinnati", "Dayton", "Akron", "Toledo"],
  "Georgia": ["Atlanta", "Augusta", "Savannah", "Athens", "Macon", "Columbus"],
  "North Carolina": ["Charlotte", "Raleigh", "Greensboro", "Durham", "Winston-Salem", "Fayetteville"],
  "Michigan": ["Detroit", "Grand Rapids", "Ann Arbor", "Lansing", "Flint", "Dearborn"],
}

// Countries list for dropdown
const COUNTRIES = ["United States", "Canada", "Mexico", "United Kingdom", "Australia", "India", "China", "Japan", "Germany", "France"]

// States by country
const STATES_BY_COUNTRY: { [key: string]: string[] } = {
  "United States": US_STATES,
  "Canada": ["Alberta", "British Columbia", "Manitoba", "New Brunswick", "Newfoundland and Labrador", "Northwest Territories", "Nova Scotia", "Nunavut", "Ontario", "Prince Edward Island", "Quebec", "Saskatchewan", "Yukon"],
  "Mexico": ["Aguascalientes", "Baja California", "Baja California Sur", "Campeche", "Chiapas", "Chihuahua", "Mexico City", "Durango", "Guanajuato", "Guerrero", "Hidalgo", "Jalisco", "State of Mexico", "Michoacán", "Morelos", "Nayarit", "Nuevo León", "Oaxaca", "Puebla", "Querétaro", "Quintana Roo", "San Luis Potosí", "Sinaloa", "Sonora", "Tabasco", "Tamaulipas", "Tlaxcala", "Veracruz", "Yucatán", "Zacatecas"],
}

interface EditProfileFormProps {
  userId: string
  profile: any
  adminUser: any
  userEmail: string
}

interface ValidationErrors {
  [key: string]: string
}

// Format utilities
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length === 0) return ""
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`
}

// Validation functions
const validateFullName = (name: string): string | null => {
  if (!name.trim()) return "Full name is required"
  if (name.length < 2) return "Full name must be at least 2 characters"
  if (name.length > 100) return "Full name must be less than 100 characters"
  if (!/^[a-zA-Z\s'-]+$/.test(name)) return "Full name can only contain letters, spaces, hyphens, and apostrophes"
  return null
}

const validatePhone = (phone: string): string | null => {
  if (!phone.trim()) return "Phone number is required"
  const cleaned = phone.replace(/\D/g, "")
  if (cleaned.length < 10) return "Phone number must be at least 10 digits"
  if (cleaned.length > 15) return "Phone number is too long"
  return null
}

const validateBio = (bio: string): string | null => {
  if (bio.length > 500) return "Bio must be less than 500 characters"
  return null
}

export function EditProfileForm({ userId, profile, adminUser, userEmail }: EditProfileFormProps) {
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})
  const [selectedCountry, setSelectedCountry] = useState(profile?.location_country || "United States")

  // Initialize form state with actual data from profile
  const [fullName, setFullName] = useState(profile?.full_name || "")
  const [phone, setPhone] = useState(profile?.phone || "")
  const [bio, setBio] = useState(profile?.bio || "")
  const [locationCity, setLocationCity] = useState(profile?.location_city || "")
  const [locationState, setLocationState] = useState(profile?.location_state || "")
  const [locationCountry, setLocationCountry] = useState(profile?.location_country || "United States")

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const fullNameError = validateFullName(fullName)
    if (fullNameError) newErrors.fullName = fullNameError

    const phoneError = validatePhone(phone)
    if (phoneError) newErrors.phone = phoneError

    const bioError = validateBio(bio)
    if (bioError) newErrors.bio = bioError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()

    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    const formData = new FormData(e.currentTarget)
    formData.set("fullName", fullName.trim())
    formData.set("phone", phone.replace(/\D/g, ""))
    formData.set("locationCity", locationCity)
    formData.set("locationState", locationState)
    formData.set("locationCountry", locationCountry)

    const result = await updateAdminProfile(formData)

    if (result.error) {
      toast({
        title: "Error",
        description: result.error,
        variant: "destructive",
      })
    } else {
      toast({
        title: "Success",
        description: "Profile updated successfully",
      })
    }

    setIsLoading(false)
  }

  const getCitiesForState = (state: string): string[] => {
    return POPULAR_CITIES[state] || []
  }

  const getStatesForCountry = (country: string): string[] => {
    return STATES_BY_COUNTRY[country] || []
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      <div className="grid gap-6 md:grid-cols-2">
        {/* Email - Read Only */}
        <div className="space-y-2">
          <Label htmlFor="email">
            Email <span className="text-red-500">*</span>
          </Label>
          <Input
            id="email"
            name="email"
            type="email"
            value={userEmail}
            disabled
            className="bg-muted cursor-not-allowed"
          />
          <p className="text-xs text-muted-foreground">Email cannot be changed</p>
        </div>

        {/* Full Name - Editable */}
        <div className="space-y-2">
          <Label htmlFor="fullName">
            Full Name <span className="text-red-500">*</span>
          </Label>
          <Input
            id="fullName"
            value={fullName}
            onChange={(e) => {
              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, "")
              setFullName(value)
              if (errors.fullName) setErrors({ ...errors, fullName: "" })
            }}
            placeholder="John Doe"
            maxLength={100}
            className={errors.fullName ? "border-red-500" : ""}
          />
          {errors.fullName && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.fullName}
            </div>
          )}
          <div className="text-xs text-muted-foreground">{fullName.length}/100</div>
        </div>

        {/* Phone - Editable with Mask */}
        <div className="space-y-2">
          <Label htmlFor="phone">
            Phone Number <span className="text-red-500">*</span>
          </Label>
          <Input
            id="phone"
            type="tel"
            value={phone}
            onChange={(e) => {
              const formatted = formatPhoneNumber(e.target.value)
              setPhone(formatted)
              if (errors.phone) setErrors({ ...errors, phone: "" })
            }}
            placeholder="555 123 4567"
            className={errors.phone ? "border-red-500" : ""}
          />
          {errors.phone && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.phone}
            </div>
          )}
          <div className="text-xs text-muted-foreground">
            {phone.replace(/\D/g, "").length}/15 digits
          </div>
        </div>
      </div>

      {/* Location Section */}
      <div>
        <h3 className="text-lg font-semibold mb-4">Location</h3>
        <div className="grid gap-4 md:grid-cols-2">
          {/* Country Select */}
          <div className="space-y-2">
            <Label htmlFor="country">Country</Label>
            <Select value={locationCountry} onValueChange={(value) => {
              setLocationCountry(value)
              setSelectedCountry(value)
              setLocationState("")
              setLocationCity("")
            }}>
              <SelectTrigger id="country">
                <SelectValue placeholder="Select country" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {COUNTRIES.map((country) => (
                  <SelectItem key={country} value={country}>
                    {country}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* State Select */}
          <div className="space-y-2">
            <Label htmlFor="state">State/Province</Label>
            <Select value={locationState} onValueChange={setLocationState}>
              <SelectTrigger id="state">
                <SelectValue placeholder="Select state" />
              </SelectTrigger>
              <SelectContent className="max-h-64">
                {getStatesForCountry(locationCountry).map((state) => (
                  <SelectItem key={state} value={state}>
                    {state}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* City Select/Input */}
          <div className="space-y-2">
            <Label htmlFor="city">City</Label>
            {locationCountry === "United States" && locationState && getCitiesForState(locationState).length > 0 ? (
              <Select value={locationCity} onValueChange={setLocationCity}>
                <SelectTrigger id="city">
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent className="max-h-64">
                  {getCitiesForState(locationState).map((city) => (
                    <SelectItem key={city} value={city}>
                      {city}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            ) : (
              <Input
                id="city"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="Enter your city"
                maxLength={50}
              />
            )}
          </div>
        </div>
      </div>

      {/* Bio - Editable
      <div>
        <h3 className="text-lg font-semibold mb-4">Bio</h3>
        <div className="space-y-2">
          <Label htmlFor="bio">Bio</Label>
          <Textarea
            id="bio"
            value={bio}
            onChange={(e) => {
              setBio(e.target.value)
              if (errors.bio) setErrors({ ...errors, bio: "" })
            }}
            placeholder="Tell us a bit about yourself..."
            maxLength={500}
            rows={4}
            className={errors.bio ? "border-red-500" : ""}
          />
          {errors.bio && (
            <div className="flex items-center gap-2 text-red-500 text-sm">
              <AlertCircle className="h-4 w-4" />
              {errors.bio}
            </div>
          )}
          <div className="text-xs text-muted-foreground">{bio.length}/500</div>
        </div>
      </div> */}

      {/* Info Text */}
      <div className="bg-blue-50 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
        <p className="text-sm text-blue-900 dark:text-blue-100">
          <strong>Note:</strong> Email cannot be changed. If you need to update your email, please contact an administrator.
        </p>
      </div>

      {/* Submit Button */}
      <Button type="submit" disabled={isLoading}>
        {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
