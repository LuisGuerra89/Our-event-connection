"use client"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import { Loader2, AlertCircle } from "lucide-react"

interface CompleteProfileFormProps {
  userId: string
  initialEmail: string
  initialFullName: string
}

interface ValidationErrors {
  [key: string]: string
}

// Utility functions for validation and formatting
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length === 0) return ""
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`
}

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

const validateDateOfBirth = (date: string): string | null => {
  if (!date) return "Date of birth is required"
  const birthDate = new Date(date)
  const today = new Date()
  const age = today.getFullYear() - birthDate.getFullYear()
  const monthDiff = today.getMonth() - birthDate.getMonth()
  
  if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
    if (age - 1 < 13) return "You must be at least 13 years old"
  } else {
    if (age < 13) return "You must be at least 13 years old"
  }
  
  if (age > 120) return "Please enter a valid date of birth"
  return null
}

const validateCity = (city: string): string | null => {
  if (!city.trim()) return "City is required"
  if (city.length < 2) return "City must be at least 2 characters"
  if (city.length > 50) return "City must be less than 50 characters"
  return null
}

const validateState = (state: string): string | null => {
  if (!state.trim()) return "State/Province is required"
  if (state.length < 2) return "State/Province must be at least 2 characters"
  if (state.length > 50) return "State/Province must be less than 50 characters"
  return null
}

const validateCountry = (country: string): string | null => {
  if (!country.trim()) return "Country is required"
  if (country.length < 2) return "Country must be at least 2 characters"
  if (country.length > 50) return "Country must be less than 50 characters"
  return null
}

const validateBio = (bio: string): string | null => {
  if (bio.length > 500) return "Bio must be less than 500 characters"
  return null
}

export default function CompleteProfileForm({ userId, initialEmail, initialFullName }: CompleteProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [errors, setErrors] = useState<ValidationErrors>({})

  const [fullName, setFullName] = useState(initialFullName)
  const [displayName, setDisplayName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [locationCity, setLocationCity] = useState("")
  const [locationState, setLocationState] = useState("")
  const [locationCountry, setLocationCountry] = useState("USA")

  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {}

    const fullNameError = validateFullName(fullName)
    if (fullNameError) newErrors.fullName = fullNameError

    const phoneError = validatePhone(phone)
    if (phoneError) newErrors.phone = phoneError

    const dateError = validateDateOfBirth(dateOfBirth)
    if (dateError) newErrors.dateOfBirth = dateError

    if (!gender) newErrors.gender = "Gender is required"

    const cityError = validateCity(locationCity)
    if (cityError) newErrors.locationCity = cityError

    const stateError = validateState(locationState)
    if (stateError) newErrors.locationState = stateError

    const countryError = validateCountry(locationCountry)
    if (countryError) newErrors.locationCountry = countryError

    const bioError = validateBio(bio)
    if (bioError) newErrors.bio = bioError

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (!validateForm()) {
      toast({
        title: "Validation Error",
        description: "Please fix all errors before submitting",
        variant: "destructive",
      })
      return
    }

    setLoading(true)

    try {
      const supabase = createBrowserClient()

      // Update profile with all required information
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName.trim(),
          display_name: displayName.trim() || fullName.trim(),
          date_of_birth: dateOfBirth,
          gender,
          phone: phone.replace(/\D/g, ""), // Store only digits
          bio: bio.trim(),
          location_city: locationCity.trim(),
          location_state: locationState.trim(),
          location_country: locationCountry.trim(),
          is_profile_complete: true, // Mark profile as complete
          updated_at: new Date().toISOString(),
        })
        .eq("id", userId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Profile completed successfully!",
      })

      // Redirect to waiver onboarding
      router.push("/onboarding/waiver")
    } catch (error) {
      console.error("Error completing profile:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete profile",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>Personal Information</CardTitle>
          <CardDescription>
            Please provide the following information to complete your profile
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="fullName">
                Full Name <span className="text-red-500">*</span>
              </Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  if (errors.fullName) setErrors({ ...errors, fullName: "" })
                }}
                placeholder="John Doe"
                required
                className={errors.fullName ? "border-red-500" : ""}
                maxLength={100}
              />
              {errors.fullName && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.fullName}
                </div>
              )}
              <div className="text-xs text-muted-foreground">{fullName.length}/100</div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you want to be called"
                maxLength={50}
              />
              <div className="text-xs text-muted-foreground">{displayName.length}/50</div>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={initialEmail} disabled className="bg-muted" />
            </div>

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
                required
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

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">
                Date of Birth <span className="text-red-500">*</span>
              </Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => {
                  setDateOfBirth(e.target.value)
                  if (errors.dateOfBirth) setErrors({ ...errors, dateOfBirth: "" })
                }}
                required
                className={errors.dateOfBirth ? "border-red-500" : ""}
              />
              {errors.dateOfBirth && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.dateOfBirth}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">
                Gender <span className="text-red-500">*</span>
              </Label>
              <Select
                value={gender}
                onValueChange={(value) => {
                  setGender(value)
                  if (errors.gender) setErrors({ ...errors, gender: "" })
                }}
                required
              >
                <SelectTrigger className={errors.gender ? "border-red-500" : ""}>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-Binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer-not-to-say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
              {errors.gender && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.gender}
                </div>
              )}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio (Optional)</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => {
                setBio(e.target.value)
                if (errors.bio) setErrors({ ...errors, bio: "" })
              }}
              placeholder="Tell us a little about yourself..."
              rows={4}
              maxLength={500}
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

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationCity">
                City <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationCity"
                value={locationCity}
                onChange={(e) => {
                  setLocationCity(e.target.value)
                  if (errors.locationCity) setErrors({ ...errors, locationCity: "" })
                }}
                placeholder="New York"
                required
                className={errors.locationCity ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.locationCity && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.locationCity}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationState">
                State/Province <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationState"
                value={locationState}
                onChange={(e) => {
                  setLocationState(e.target.value)
                  if (errors.locationState) setErrors({ ...errors, locationState: "" })
                }}
                placeholder="NY"
                required
                className={errors.locationState ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.locationState && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.locationState}
                </div>
              )}
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationCountry">
                Country <span className="text-red-500">*</span>
              </Label>
              <Input
                id="locationCountry"
                value={locationCountry}
                onChange={(e) => {
                  setLocationCountry(e.target.value)
                  if (errors.locationCountry) setErrors({ ...errors, locationCountry: "" })
                }}
                placeholder="USA"
                required
                className={errors.locationCountry ? "border-red-500" : ""}
                maxLength={50}
              />
              {errors.locationCountry && (
                <div className="flex items-center gap-2 text-red-500 text-sm">
                  <AlertCircle className="h-4 w-4" />
                  {errors.locationCountry}
                </div>
              )}
            </div>
          </div>

          <div className="flex justify-end space-x-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {loading ? "Saving..." : "Complete Profile"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </form>
  )
}
