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

const completeProfileSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  dateOfBirth: z.string().refine((date) => {
    const d = new Date(date)
    const today = new Date()
    const age = today.getFullYear() - d.getFullYear()
    return age >= 18
  }, "You must be at least 18 years old"),
  height: z.coerce.number().min(100).max(250, "Height must be between 100-250 cm"),
  weight: z.coerce.number().min(30).max(300, "Weight must be between 30-300 kg"),
  skinTone: z.string().min(1, "Skin tone is required"),
  hairColor: z.string().min(1, "Hair color is required"),
  occupation: z.string().min(1, "Occupation is required"),
  hobbies: z.string().min(1, "Please select at least one hobby"),
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  country: z.string().min(1, "Country is required"),
  state: z.string().min(1, "State is required"),
  city: z.string().min(1, "City is required"),
  zipCode: z.string().min(1, "Zip code is required"),
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
                          <Input placeholder="John" {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="Doe" {...field} />
                        </FormControl>
                        <FormMessage />
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
                          <Input placeholder="+1 (555) 000-0000" {...field} />
                        </FormControl>
                        <FormMessage />
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
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Street address" {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Input placeholder="Apartment, suite, etc." {...field} />
                          </FormControl>
                          <FormMessage />
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
                            <Select
                              onValueChange={(value) => {
                                field.onChange(value)
                                setSelectedCountry(value)
                                form.setValue("state", "")
                              }}
                              defaultValue={field.value}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select country" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {countries.map((country) => (
                                  <SelectItem key={country} value={country}>
                                    {country}
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
                        name="state"
                        render={({ field }) => (
                          <FormItem>
                            <FormLabel>State/Province *</FormLabel>
                            <Select
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              disabled={!selectedCountry}
                            >
                              <FormControl>
                                <SelectTrigger>
                                  <SelectValue placeholder="Select state" />
                                </SelectTrigger>
                              </FormControl>
                              <SelectContent>
                                {selectedCountry &&
                                  states[selectedCountry]?.map((state) => (
                                    <SelectItem key={state} value={state}>
                                      {state}
                                    </SelectItem>
                                  ))}
                              </SelectContent>
                            </Select>
                            <FormMessage />
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
                              <Input placeholder="City name" {...field} />
                            </FormControl>
                            <FormMessage />
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
                              <Input placeholder="Zip/Postal code" {...field} />
                            </FormControl>
                            <FormMessage />
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
