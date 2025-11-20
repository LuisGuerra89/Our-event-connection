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
import { Loader2 } from "lucide-react"

interface CompleteProfileFormProps {
  userId: string
  initialEmail: string
  initialFullName: string
}

export default function CompleteProfileForm({ userId, initialEmail, initialFullName }: CompleteProfileFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)

  const [fullName, setFullName] = useState(initialFullName)
  const [displayName, setDisplayName] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
  const [gender, setGender] = useState("")
  const [phone, setPhone] = useState("")
  const [bio, setBio] = useState("")
  const [locationCity, setLocationCity] = useState("")
  const [locationState, setLocationState] = useState("")
  const [locationCountry, setLocationCountry] = useState("USA")

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()

      // Update profile with all required information
      const { error } = await supabase
        .from("profiles")
        .update({
          full_name: fullName,
          display_name: displayName || fullName,
          date_of_birth: dateOfBirth,
          gender,
          phone,
          bio,
          location_city: locationCity,
          location_state: locationState,
          location_country: locationCountry,
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
              <Label htmlFor="fullName">Full Name *</Label>
              <Input
                id="fullName"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                placeholder="John Doe"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="displayName">Display Name</Label>
              <Input
                id="displayName"
                value={displayName}
                onChange={(e) => setDisplayName(e.target.value)}
                placeholder="How you want to be called"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" value={initialEmail} disabled className="bg-muted" />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Phone Number *</Label>
              <Input
                id="phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                placeholder="+1 (555) 123-4567"
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="dateOfBirth">Date of Birth *</Label>
              <Input
                id="dateOfBirth"
                type="date"
                value={dateOfBirth}
                onChange={(e) => setDateOfBirth(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="gender">Gender *</Label>
              <Select value={gender} onValueChange={setGender} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select gender" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="male">Male</SelectItem>
                  <SelectItem value="female">Female</SelectItem>
                  <SelectItem value="non-binary">Non-Binary</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="bio">Bio</Label>
            <Textarea
              id="bio"
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Tell us a little about yourself..."
              rows={4}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="locationCity">City *</Label>
              <Input
                id="locationCity"
                value={locationCity}
                onChange={(e) => setLocationCity(e.target.value)}
                placeholder="New York"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationState">State *</Label>
              <Input
                id="locationState"
                value={locationState}
                onChange={(e) => setLocationState(e.target.value)}
                placeholder="NY"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="locationCountry">Country *</Label>
              <Input
                id="locationCountry"
                value={locationCountry}
                onChange={(e) => setLocationCountry(e.target.value)}
                placeholder="USA"
                required
              />
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
