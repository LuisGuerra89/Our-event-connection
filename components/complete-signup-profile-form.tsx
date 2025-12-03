"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import AddressAutocompleteWithLocation from "@/components/address-autocomplete-with-location"

// Format utilities
const formatPhoneNumber = (value: string): string => {
  const cleaned = value.replace(/\D/g, "")
  if (cleaned.length === 0) return ""
  if (cleaned.length <= 3) return cleaned
  if (cleaned.length <= 6) return `${cleaned.slice(0, 3)} ${cleaned.slice(3)}`
  return `${cleaned.slice(0, 3)} ${cleaned.slice(3, 6)} ${cleaned.slice(6, 10)}`
}

const formatZipCode = (value: string): string => {
  // Allows alphanumeric for international zip codes
  return value.replace(/[^a-zA-Z0-9\s-]/g, "").slice(0, 20)
}

const completeProfileSchema = z.object({
  firstName: z.string()
    .min(1, "First name is required")
    .min(2, "First name must be at least 2 characters")
    .max(50, "First name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "First name can only contain letters, spaces, hyphens, and apostrophes"),
  lastName: z.string()
    .min(1, "Last name is required")
    .min(2, "Last name must be at least 2 characters")
    .max(50, "Last name must be less than 50 characters")
    .regex(/^[a-zA-Z\s'-]+$/, "Last name can only contain letters, spaces, hyphens, and apostrophes"),
  contactNumber: z.string()
    .min(1, "Contact number is required")
    .refine((val) => val.replace(/\D/g, "").length >= 10, "Contact number must be at least 10 digits")
    .refine((val) => val.replace(/\D/g, "").length <= 15, "Contact number must not exceed 15 digits"),
  dateOfBirth: z.string()
    .min(1, "Date of birth is required")
    .refine((date) => {
      const d = new Date(date)
      const today = new Date()
      const age = today.getFullYear() - d.getFullYear()
      const monthDiff = today.getMonth() - d.getMonth()
      if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < d.getDate())) {
        return age - 1 >= 13
      }
      return age >= 13
    }, "You must be at least 13 years old"),
  height: z.coerce.number()
    .min(100, "Height must be at least 100 cm")
    .max(250, "Height must not exceed 250 cm"),
  weight: z.coerce.number()
    .min(30, "Weight must be at least 30 kg")
    .max(300, "Weight must not exceed 300 kg"),
  skinTone: z.string().min(1, "Skin tone is required"),
  hairColor: z.string().min(1, "Hair color is required"),
  occupation: z.string().min(1, "Occupation is required"),
  hobbies: z.string()
    .min(1, "Please select at least one hobby")
    .max(200, "Hobbies field must be less than 200 characters"),
  address1: z.string()
    .min(1, "Address is required")
    .min(5, "Address must be at least 5 characters")
    .max(100, "Address must be less than 100 characters"),
  address2: z.string()
    .max(100, "Address line 2 must be less than 100 characters")
    .optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string()
    .min(1, "City is required")
    .min(2, "City must be at least 2 characters")
    .max(50, "City must be less than 50 characters"),
  zipCode: z.string()
    .min(1, "Zip code is required")
    .min(3, "Zip code must be at least 3 characters")
    .max(20, "Zip code must be less than 20 characters"),
})

type CompleteProfileFormData = z.infer<typeof completeProfileSchema>

const skinTones = [
  { value: "fair", label: "Very Fair / Fair" },
  { value: "medium", label: "Light / Medium" },
  { value: "olive", label: "Olive" },
  { value: "dark", label: "Tan / Dark" },
  { value: "very_dark", label: "Deep Tan / Very Dark" },
  { value: "other", label: "Other" },
]

const hairColors = [
  { value: "black", label: "Black" },
  { value: "dark_brown", label: "Dark Brown" },
  { value: "light_brown", label: "Light Brown" },
  { value: "blonde", label: "Blonde" },
  { value: "red", label: "Red" },
  { value: "gray", label: "Gray" },
  { value: "white", label: "White" },
  { value: "other", label: "Other" },
]

const occupations = [
  "Student",
  "Software Developer",
  "Designer",
  "Marketing",
  "Sales",
  "Business Owner",
  "Entrepreneur",
  "Finance",
  "Healthcare",
  "Education",
  "Construction",
  "Hospitality",
  "Entertainment",
  "Sports",
  "Retired",
  "Other",
]

const hobbiesList = [
  "Reading",
  "Sports",
  "Fitness",
  "Cooking",
  "Gaming",
  "Music",
  "Art",
  "Travel",
  "Photography",
  "Socializing",
  "Dancing",
  "Yoga",
  "Meditation",
  "Movies",
  "Writing",
]

const countries = [
  "United States",
  "Canada",
  "Mexico",
  "United Kingdom",
  "Australia",
  "Others",
]

const states: Record<string, string[]> = {
  "United States": [
    "Alabama",
    "Alaska",
    "Arizona",
    "Arkansas",
    "California",
    "Colorado",
    "Connecticut",
    "Delaware",
    "Florida",
    "Georgia",
    "Hawaii",
    "Idaho",
    "Illinois",
    "Indiana",
    "Iowa",
    "Kansas",
    "Kentucky",
    "Louisiana",
    "Maine",
    "Maryland",
    "Massachusetts",
    "Michigan",
    "Minnesota",
    "Mississippi",
    "Missouri",
    "Montana",
    "Nebraska",
    "Nevada",
    "New Hampshire",
    "New Jersey",
    "New Mexico",
    "New York",
    "North Carolina",
    "North Dakota",
    "Ohio",
    "Oklahoma",
    "Oregon",
    "Pennsylvania",
    "Rhode Island",
    "South Carolina",
    "South Dakota",
    "Tennessee",
    "Texas",
    "Utah",
    "Vermont",
    "Virginia",
    "Washington",
    "West Virginia",
    "Wisconsin",
    "Wyoming",
  ],
  Canada: [
    "Alberta",
    "British Columbia",
    "Manitoba",
    "New Brunswick",
    "Newfoundland and Labrador",
    "Nova Scotia",
    "Ontario",
    "Prince Edward Island",
    "Quebec",
    "Saskatchewan",
  ],
  Mexico: ["Aguascalientes", "Baja California", "Chiapas", "Chihuahua", "Others"],
  "United Kingdom": ["England", "Scotland", "Wales", "Northern Ireland"],
  Australia: [
    "New South Wales",
    "Queensland",
    "South Australia",
    "Tasmania",
    "Victoria",
    "Western Australia",
  ],
}

interface CompleteSignupProfileFormProps {
  userId: string
  onComplete?: () => void
}

export function CompleteSignupProfileForm({ userId, onComplete }: CompleteSignupProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")
  const [countriesData, setCountriesData] = useState<any[]>([])

  const form = useForm<CompleteProfileFormData>({
    resolver: zodResolver(completeProfileSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      contactNumber: "",
      dateOfBirth: "",
      height: 170,
      weight: 70,
      skinTone: "",
      hairColor: "",
      occupation: "",
      hobbies: "",
      address1: "",
      address2: "",
      country: "",
      state: "",
      city: "",
      zipCode: "",
    },
  })

  const onSubmit = async (data: CompleteProfileFormData) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/user/complete-signup-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          contactNumber: data.contactNumber,
          dateOfBirth: data.dateOfBirth,
          height: data.height,
          weight: data.weight,
          skinTone: data.skinTone,
          hairColor: data.hairColor,
          occupation: data.occupation,
          hobbies: data.hobbies.split(",").map((h) => h.trim()),
          address1: data.address1,
          address2: data.address2,
          country: data.country,
          state: data.state,
          city: data.city,
          zipCode: data.zipCode,
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to save profile")
      }

      toast({
        title: "Success!",
        description: "Profile information saved. Let's continue with the questionnaire...",
      })

      // Continue to onboarding wizard
      router.push("/onboarding/complete-profile")
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save profile",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-full bg-gradient-to-b from-background to-secondary/5">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">Complete Your Profile</h1>
          <p className="text-sm text-muted-foreground">
            Let's get to know you better before we find your perfect match
          </p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Personal Information</CardTitle>
            <CardDescription>All fields are required to continue</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {/* Basic Information */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <FormField
                    control={form.control}
                    name="firstName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>First Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="John"
                            maxLength={50}
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, "")
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-muted-foreground">
                          {field.value.length}/50
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="lastName"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Last Name *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="Doe"
                            maxLength={50}
                            value={field.value}
                            onChange={(e) => {
                              const value = e.target.value.replace(/[^a-zA-Z\s'-]/g, "")
                              field.onChange(value)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-muted-foreground">
                          {field.value.length}/50
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="contactNumber"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Contact Number *</FormLabel>
                        <FormControl>
                          <Input
                            placeholder="555 123 4567"
                            value={field.value}
                            onChange={(e) => {
                              const formatted = formatPhoneNumber(e.target.value)
                              field.onChange(formatted)
                            }}
                          />
                        </FormControl>
                        <FormMessage />
                        <div className="text-xs text-muted-foreground">
                          {field.value.replace(/\D/g, "").length}/15 digits
                        </div>
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="dateOfBirth"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Date of Birth * (Age will be calculated)</FormLabel>
                        <FormControl>
                          <Input type="date" {...field} />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Physical Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Physical Information</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="height"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Height (cm) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="170" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="weight"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Weight (kg) *</FormLabel>
                          <FormControl>
                            <Input type="number" placeholder="70" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="skinTone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Skin Tone *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select skin tone" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {skinTones.map((tone) => (
                                <SelectItem key={tone.value} value={tone.value}>
                                  {tone.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hairColor"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hair Color *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select hair color" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {hairColors.map((color) => (
                                <SelectItem key={color.value} value={color.value}>
                                  {color.label}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Professional & Interests */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Professional & Interests</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <FormField
                      control={form.control}
                      name="occupation"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Occupation *</FormLabel>
                          <Select onValueChange={field.onChange} defaultValue={field.value}>
                            <FormControl>
                              <SelectTrigger>
                                <SelectValue placeholder="Select occupation" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent>
                              {occupations.map((occ) => (
                                <SelectItem key={occ} value={occ}>
                                  {occ}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="hobbies"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hobbies (comma separated) *</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="e.g., Reading, Sports, Gaming"
                              maxLength={200}
                              value={field.value}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-muted-foreground">
                            {field.value.length}/200
                          </div>
                        </FormItem>
                      )}
                    />
                  </div>
                </div>

                {/* Address Information */}
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold mb-4">Address</h3>
                  <div className="grid grid-cols-1 gap-4">
                    <FormField
                      control={form.control}
                      name="address1"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address 1 *</FormLabel>
                          <FormControl>
                            <AddressAutocompleteWithLocation
                              label=""
                              placeholder="Street address"
                              onAddressSelect={(data) => {
                                field.onChange(data.address)
                                form.setValue("country", data.country || form.getValues("country"))
                                form.setValue("state", data.state || form.getValues("state"))
                                form.setValue("city", data.city || form.getValues("city"))
                                setSelectedCountry(data.country || selectedCountry)
                              }}
                              countries={countriesData}
                              states={[]}
                              cities={[]}
                              initialAddress={field.value}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-muted-foreground">
                            {field.value.length}/100
                          </div>
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="address2"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address 2 (Optional)</FormLabel>
                          <FormControl>
                            <Input
                              placeholder="Apartment, suite, etc."
                              maxLength={100}
                              value={field.value || ""}
                              onChange={field.onChange}
                            />
                          </FormControl>
                          <FormMessage />
                          <div className="text-xs text-muted-foreground">
                            {(field.value || "").length}/100
                          </div>
                        </FormItem>
                      )}
                    />

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="country"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Country *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Country name"
                                maxLength={50}
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(value)
                                  setSelectedCountry(value)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-muted-foreground">
                              {field.value.length}/50
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="State or province name"
                                maxLength={50}
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(value)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-muted-foreground">
                              {field.value.length}/50
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <FormField
                        control={form.control}
                        name="city"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>City *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="City name"
                                maxLength={50}
                                value={field.value}
                                onChange={(e) => {
                                  const value = e.target.value
                                  field.onChange(value)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-muted-foreground">
                              {field.value.length}/50
                            </div>
                          </FormItem>
                        )}
                      />

                      <FormField
                        control={form.control}
                        name="zipCode"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>Zip Code *</FormLabel>
                            <FormControl>
                              <Input
                                placeholder="Zip/Postal code"
                                maxLength={20}
                                value={field.value}
                                onChange={(e) => {
                                  const formatted = formatZipCode(e.target.value)
                                  field.onChange(formatted)
                                }}
                              />
                            </FormControl>
                            <FormMessage />
                            <div className="text-xs text-muted-foreground">
                              {field.value.length}/20
                            </div>
                          </FormItem>
                        )}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex gap-4 pt-6 border-t">
                  <Button type="submit" disabled={isLoading} className="flex-1">
                    {isLoading ? "Saving..." : "Continue to Questionnaire"}
                  </Button>
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
