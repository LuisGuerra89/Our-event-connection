"use client"

import type React from "react"
import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Checkbox } from "@/components/ui/checkbox"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2, X } from "lucide-react"
import { useToast } from "@/hooks/use-toast"

interface Country {
  id: string
  name: string
}

interface State {
  id: string
  name: string
  country_id: string
}

interface City {
  id: string
  name: string
  state_id: string
}

interface Category {
  id: string
  name: string
}

interface Event {
  id: string
  title: string
  description: string
  event_type: string
  venue_type?: string
  start_date: string
  end_date: string
  location_name: string
  location_address: string
  location_city: string
  location_state: string
  location_country: string
  country_id?: string
  state_id?: string
  city_id?: string
  capacity: number
  price: number
  status: string
  gender_limitation?: string
  min_age?: number
  max_age?: number
  registration_start_date?: string
  registration_end_date?: string
  banner_images?: string[]
  logo_url?: string
  refund_policy?: string
  subscription_required?: boolean
  category_id?: string
  notification_enabled?: boolean
  reminder_enabled?: boolean
}

export function EditEventFormComplete({ event }: { event: Event }) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<Category[]>([])

  const [selectedCountry, setSelectedCountry] = useState(event.country_id || "")
  const [selectedState, setSelectedState] = useState(event.state_id || "")
  const [selectedCity, setSelectedCity] = useState(event.city_id || "")
  const [selectedCategory, setSelectedCategory] = useState(event.category_id || "")
  const [venueType, setVenueType] = useState(event.venue_type || "")
  const [eventType, setEventType] = useState(event.event_type || "")
  const [eventStatus, setEventStatus] = useState(event.status || "upcoming")
  const [genderLimitation, setGenderLimitation] = useState(event.gender_limitation || "all_genders")
  const [subscriptionRequired, setSubscriptionRequired] = useState(event.subscription_required || false)
  const [notificationEnabled, setNotificationEnabled] = useState(event.notification_enabled ?? true)
  const [reminderEnabled, setReminderEnabled] = useState(event.reminder_enabled ?? true)

  const [bannerImages, setBannerImages] = useState<string[]>(event.banner_images || [])
  const [logoUrl, setLogoUrl] = useState(event.logo_url || "")

  useEffect(() => {
    loadCountries()
    loadCategories()
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry)
    }
  }, [selectedCountry])

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState)
    }
  }, [selectedState])

  const loadCountries = async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase.from("countries").select("id, name").order("name")
    if (data) setCountries(data)
  }

  const loadStates = async (countryId: string) => {
    const supabase = createBrowserClient()
    const { data } = await supabase.from("states").select("id, name, country_id").eq("country_id", countryId).order("name")
    if (data) setStates(data)
  }

  const loadCities = async (stateId: string) => {
    const supabase = createBrowserClient()
    const { data } = await supabase.from("cities").select("id, name, state_id").eq("state_id", stateId).order("name")
    if (data) setCities(data)
  }

  const loadCategories = async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase.from("event_categories").select("id, name").eq("status", "active").order("display_order")
    if (data) setCategories(data)
  }

  const uploadImage = async (file: File, folder: string): Promise<string | null> => {
    try {
      const supabase = createBrowserClient()
      const fileExt = file.name.split(".").pop()
      const fileName = `${Math.random().toString(36).substring(2)}-${Date.now()}.${fileExt}`
      const filePath = `${folder}/${fileName}`

      const { error: uploadError } = await supabase.storage.from("events").upload(filePath, file)

      if (uploadError) throw uploadError

      const {
        data: { publicUrl },
      } = supabase.storage.from("events").getPublicUrl(filePath)

      return publicUrl
    } catch (error) {
      console.error("Error uploading image:", error)
      toast({
        title: "Error",
        description: "Failed to upload image",
        variant: "destructive",
      })
      return null
    }
  }

  const handleBannerUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setUploadingBanner(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const url = await uploadImage(files[i], "banners")
      if (url) uploadedUrls.push(url)
    }

    setBannerImages((prev) => [...prev, ...uploadedUrls])
    setUploadingBanner(false)
  }

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return

    setUploadingLogo(true)
    const url = await uploadImage(file, "logos")
    if (url) setLogoUrl(url)
    setUploadingLogo(false)
  }

  const removeBannerImage = (index: number) => {
    setBannerImages((prev) => prev.filter((_, i) => i !== index))
  }

  const formatDateTimeLocal = (dateString: string) => {
    if (!dateString) return ""
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const supabase = createBrowserClient()

      const eventData = {
        title: formData.get("name") as string,
        description: formData.get("description") as string,
        event_type: eventType,
        venue_type: venueType,
        start_date: formData.get("start_date") as string,
        end_date: formData.get("end_date") as string,
        location_name: formData.get("venue") as string,
        location_address: formData.get("address") as string,
        location_city: "",
        location_state: "",
        location_country: "",
        country_id: selectedCountry || null,
        state_id: selectedState || null,
        city_id: selectedCity || null,
        capacity: Number.parseInt(formData.get("capacity") as string) || 0,
        gender_limitation: genderLimitation,
        min_age: Number.parseInt(formData.get("min_age") as string) || null,
        max_age: Number.parseInt(formData.get("max_age") as string) || null,
        registration_start_date: formData.get("registration_start_date") as string || null,
        registration_end_date: formData.get("registration_end_date") as string || null,
        price: Number.parseFloat(formData.get("entry_fee") as string) || 0,
        refund_policy: formData.get("refund_policy") as string,
        subscription_required: subscriptionRequired,
        category_id: selectedCategory || null,
        status: eventStatus,
        banner_images: bannerImages.length > 0 ? bannerImages : null,
        logo_url: logoUrl || null,
        image_url: logoUrl || null,
        notification_enabled: notificationEnabled,
        reminder_enabled: reminderEnabled,
        updated_at: new Date().toISOString(),
      }

      // Get location names
      if (selectedCity) {
        const city = cities.find((c) => c.id === selectedCity)
        if (city) eventData.location_city = city.name
      }
      if (selectedState) {
        const state = states.find((s) => s.id === selectedState)
        if (state) eventData.location_state = state.name
      }
      if (selectedCountry) {
        const country = countries.find((c) => c.id === selectedCountry)
        if (country) eventData.location_country = country.name
      }

      const { error } = await supabase.from("events").update(eventData).eq("id", event.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Event updated successfully!",
      })
      router.push("/admin/events")
      router.refresh()
    } catch (error) {
      console.error("Error updating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update event",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Event Name *</Label>
              <Input id="name" name="name" defaultValue={event.title} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type *</Label>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="social">Social</SelectItem>
                  <SelectItem value="sports">Sports</SelectItem>
                  <SelectItem value="dining">Dining</SelectItem>
                  <SelectItem value="outdoor">Outdoor</SelectItem>
                  <SelectItem value="cultural">Cultural</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" defaultValue={event.description} rows={4} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat.id} value={cat.id}>
                    {cat.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Location Details</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="venue">Venue Name *</Label>
              <Input id="venue" name="venue" defaultValue={event.location_name} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_type">Venue Type</Label>
              <Select value={venueType} onValueChange={setVenueType}>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="restaurant">Restaurant</SelectItem>
                  <SelectItem value="bar">Bar</SelectItem>
                  <SelectItem value="club">Club</SelectItem>
                  <SelectItem value="park">Park</SelectItem>
                  <SelectItem value="venue">Venue</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" name="address" defaultValue={event.location_address} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select country" />
                </SelectTrigger>
                <SelectContent>
                  {countries.map((country) => (
                    <SelectItem key={country.id} value={country.id}>
                      {country.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="state">State</Label>
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry}>
                <SelectTrigger>
                  <SelectValue placeholder="Select state" />
                </SelectTrigger>
                <SelectContent>
                  {states.map((state) => (
                    <SelectItem key={state.id} value={state.id}>
                      {state.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="city">City</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState}>
                <SelectTrigger>
                  <SelectValue placeholder="Select city" />
                </SelectTrigger>
                <SelectContent>
                  {cities.map((city) => (
                    <SelectItem key={city.id} value={city.id}>
                      {city.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Dates</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date & Time *</Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(event.start_date)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date & Time *</Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(event.end_date)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_start_date">Registration Start Date</Label>
              <Input
                id="registration_start_date"
                name="registration_start_date"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(event.registration_start_date || "")}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_end_date">Registration End Date</Label>
              <Input
                id="registration_end_date"
                name="registration_end_date"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(event.registration_end_date || "")}
              />
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Participant Restrictions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity (0 = Unlimited)</Label>
              <Input
                id="capacity"
                name="capacity"
                type="number"
                min="0"
                defaultValue={event.capacity}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_age">Minimum Age</Label>
              <Input
                id="min_age"
                name="min_age"
                type="number"
                defaultValue={event.min_age || ""}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_age">Maximum Age</Label>
              <Input
                id="max_age"
                name="max_age"
                type="number"
                defaultValue={event.max_age || ""}
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender_limitation">Gender Limitation</Label>
            <Select value={genderLimitation} onValueChange={setGenderLimitation}>
              <SelectTrigger>
                <SelectValue placeholder="Select gender limitation" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all_genders">All Genders</SelectItem>
                <SelectItem value="male_only">Male Only</SelectItem>
                <SelectItem value="female_only">Female Only</SelectItem>
                <SelectItem value="no_limitation">No Limitation</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Images</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="banner_images">Banner Images (Multiple)</Label>
            <div className="flex items-center gap-2">
              <Input
                id="banner_images"
                type="file"
                accept="image/*"
                multiple
                onChange={handleBannerUpload}
                disabled={uploadingBanner}
                className="flex-1"
              />
              {uploadingBanner && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {bannerImages.length > 0 && (
              <div className="flex flex-wrap gap-2 mt-2">
                {bannerImages.map((url, index) => (
                  <div key={index} className="relative">
                    <img src={url} alt={`Banner ${index + 1}`} className="h-20 w-20 object-cover rounded" />
                    <button
                      type="button"
                      onClick={() => removeBannerImage(index)}
                      className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                    >
                      <X className="h-3 w-3" />
                    </button>
                  </div>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="logo">Event Logo</Label>
            <div className="flex items-center gap-2">
              <Input
                id="logo"
                type="file"
                accept="image/*"
                onChange={handleLogoUpload}
                disabled={uploadingLogo}
                className="flex-1"
              />
              {uploadingLogo && <Loader2 className="h-4 w-4 animate-spin" />}
            </div>
            {logoUrl && (
              <div className="relative w-fit">
                <img src={logoUrl} alt="Logo" className="h-20 w-20 object-cover rounded" />
                <button
                  type="button"
                  onClick={() => setLogoUrl("")}
                  className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1"
                >
                  <X className="h-3 w-3" />
                </button>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pricing & Policies</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="entry_fee">Entry Fee (0 = Free)</Label>
              <Input
                id="entry_fee"
                name="entry_fee"
                type="number"
                step="0.01"
                min="0"
                defaultValue={event.price}
                required
              />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox
                id="subscription_required"
                checked={subscriptionRequired}
                onCheckedChange={(checked) => setSubscriptionRequired(checked as boolean)}
              />
              <Label htmlFor="subscription_required" className="cursor-pointer">
                Subscription Required
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund_policy">Refund Policy</Label>
            <Textarea
              id="refund_policy"
              name="refund_policy"
              defaultValue={event.refund_policy || ""}
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Event Settings</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="status">Event Status *</Label>
            <Select value={eventStatus} onValueChange={setEventStatus} required>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="upcoming">Upcoming</SelectItem>
                <SelectItem value="ongoing">Ongoing</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="cancelled">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="flex flex-col gap-2">
            <div className="flex items-center space-x-2">
              <Checkbox
                id="notification_enabled"
                checked={notificationEnabled}
                onCheckedChange={(checked) => setNotificationEnabled(checked as boolean)}
              />
              <Label htmlFor="notification_enabled" className="cursor-pointer">
                Enable Notifications
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox
                id="reminder_enabled"
                checked={reminderEnabled}
                onCheckedChange={(checked) => setReminderEnabled(checked as boolean)}
              />
              <Label htmlFor="reminder_enabled" className="cursor-pointer">
                Enable Reminders
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Update Event
        </Button>
      </div>
    </form>
  )
}
