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

interface Enum {
  id: string
  enum_title: string
  enum_type: string
}

export default function CreateEventForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [uploadingBanner, setUploadingBanner] = useState(false)
  const [uploadingLogo, setUploadingLogo] = useState(false)

  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  
  // Enums from database
  const [eventTypes, setEventTypes] = useState<Enum[]>([])
  const [venueTypes, setVenueTypes] = useState<Enum[]>([])
  const [genderLimitations, setGenderLimitations] = useState<Enum[]>([])
  const [eventStatuses, setEventStatuses] = useState<Enum[]>([])

  const [selectedCountry, setSelectedCountry] = useState("")
  const [selectedState, setSelectedState] = useState("")
  const [selectedCity, setSelectedCity] = useState("")
  const [selectedCategory, setSelectedCategory] = useState("")
  const [venueType, setVenueType] = useState("")
  const [eventType, setEventType] = useState("")
  const [eventStatus, setEventStatus] = useState("upcoming")
  const [genderLimitation, setGenderLimitation] = useState("all_genders")
  const [subscriptionRequired, setSubscriptionRequired] = useState(false)
  const [notificationEnabled, setNotificationEnabled] = useState(true)
  const [reminderEnabled, setReminderEnabled] = useState(true)

  const [bannerImages, setBannerImages] = useState<string[]>([])
  const [logoUrl, setLogoUrl] = useState("")

  useEffect(() => {
    loadCountries()
    loadCategories()
    loadEnums()
  }, [])

  useEffect(() => {
    if (selectedCountry) {
      loadStates(selectedCountry)
      setSelectedState("")
      setSelectedCity("")
      setCities([])
    }
  }, [selectedCountry])

  useEffect(() => {
    if (selectedState) {
      loadCities(selectedState)
      setSelectedCity("")
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

  const loadEnums = async () => {
    const supabase = createBrowserClient()
    
    // Load event types
    const { data: eventTypesData } = await supabase
      .from("enums")
      .select("id, enum_title, enum_type")
      .eq("enum_type", "event_type")
      .eq("status", "active")
      .order("display_order")
    if (eventTypesData) setEventTypes(eventTypesData)

    // Load venue types
    const { data: venueTypesData } = await supabase
      .from("enums")
      .select("id, enum_title, enum_type")
      .eq("enum_type", "venue_type")
      .eq("status", "active")
      .order("display_order")
    if (venueTypesData) setVenueTypes(venueTypesData)

    // Load gender limitations
    const { data: genderLimitationsData } = await supabase
      .from("enums")
      .select("id, enum_title, enum_type")
      .eq("enum_type", "gender_limitation")
      .eq("status", "active")
      .order("display_order")
    if (genderLimitationsData) setGenderLimitations(genderLimitationsData)

    // Load event statuses
    const { data: eventStatusesData } = await supabase
      .from("enums")
      .select("id, enum_title, enum_type")
      .eq("enum_type", "event_status")
      .eq("status", "active")
      .order("display_order")
    if (eventStatusesData) setEventStatuses(eventStatusesData)
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

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const supabase = createBrowserClient()

      // Get authenticated user for organizer_id
      const {
        data: { user },
      } = await supabase.auth.getUser()

      if (!user) {
        throw new Error("User not authenticated")
      }

      // Validar campos requeridos
      if (!eventType) {
        throw new Error("Event type is required")
      }
      if (!venueType) {
        throw new Error("Venue type is required")
      }
      if (!selectedCountry) {
        throw new Error("Country is required")
      }
      if (!selectedState) {
        throw new Error("State is required")
      }
      if (!selectedCity) {
        throw new Error("City is required")
      }
      if (bannerImages.length === 0) {
        throw new Error("At least one banner image is required")
      }
      if (!logoUrl) {
        throw new Error("Event logo is required")
      }
      const capacity = formData.get("capacity") ? Number.parseInt(formData.get("capacity") as string) : 0
      if (capacity === null || capacity === undefined) {
        throw new Error("Capacity is required (use 0 for unlimited)")
      }
      const minAge = formData.get("min_age") ? Number.parseInt(formData.get("min_age") as string) : null
      const maxAge = formData.get("max_age") ? Number.parseInt(formData.get("max_age") as string) : null
      if (minAge === null || maxAge === null) {
        throw new Error("Age range is required")
      }
      const entryFee = formData.get("entry_fee") ? Number.parseFloat(formData.get("entry_fee") as string) : null
      if (entryFee === null) {
        throw new Error("Entry fee is required (use 0 for free events)")
      }
      if (entryFee < 0) {
        throw new Error("Entry fee cannot be negative")
      }
      const regStartDate = formData.get("registration_start_date") as string
      const regEndDate = formData.get("registration_end_date") as string
      if (!regStartDate || !regEndDate) {
        throw new Error("Registration start and end dates are required")
      }

      const eventData = {
        organizer_id: user.id,
        title: formData.get("name") as string, // BD usa 'title' no 'name'
        description: formData.get("description") as string,
        event_type: eventType,
        venue_type: venueType,
        start_date: formData.get("start_date") as string,
        end_date: formData.get("end_date") as string,
        location_name: formData.get("venue") as string, // BD usa 'location_name' no 'venue'
        location_address: formData.get("address") as string,
        location_city: "", // Obtener de la ciudad seleccionada
        location_state: "", // Obtener del estado seleccionado
        location_country: "", // Obtener del país seleccionado
        country_id: selectedCountry || null,
        state_id: selectedState || null,
        city_id: selectedCity || null,
        capacity: capacity,
        gender_limitation: genderLimitation,
        min_age: minAge,
        max_age: maxAge,
        registration_start_date: regStartDate,
        registration_end_date: regEndDate,
        price: entryFee, // BD usa 'price' no 'entry_fee'
        refund_policy: formData.get("refund_policy") as string,
        subscription_required: subscriptionRequired,
        category_id: selectedCategory || null,
        status: eventStatus,
        banner_images: bannerImages.length > 0 ? bannerImages : null,
        logo_url: logoUrl || null,
        image_url: logoUrl || null, // BD también tiene 'image_url'
        notification_enabled: notificationEnabled,
        reminder_enabled: reminderEnabled,
      }

      // Obtener nombres de ubicación si hay IDs seleccionados
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

      // Debug: Ver qué valores tienen los campos críticos
      console.log("Event Type Value:", eventData.event_type)
      console.log("Event Status Value:", eventData.status)
      console.log("Full Event Data:", eventData)

      const { error } = await supabase.from("events").insert([eventData])

      if (error) throw error

      toast({
        title: "Success",
        description: "Event created successfully!",
      })
      router.push("/admin/events")
    } catch (error) {
      console.error("Error creating event:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create event",
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
              <Input id="name" name="name" placeholder="Event name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type *</Label>
              <Select value={eventType} onValueChange={setEventType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select event type" />
                </SelectTrigger>
                <SelectContent>
                  {eventTypes.map((type) => (
                    <SelectItem key={type.id} value={type.enum_title.toLowerCase().replace(/ /g, "_")}>
                      {type.enum_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description *</Label>
            <Textarea id="description" name="description" placeholder="Event description" rows={4} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="category_id">Category *</Label>
            <Select value={selectedCategory} onValueChange={setSelectedCategory} required>
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
              <Input id="venue" name="venue" placeholder="Venue name" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="venue_type">Venue Type *</Label>
              <Select value={venueType} onValueChange={setVenueType} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select venue type" />
                </SelectTrigger>
                <SelectContent>
                  {venueTypes.map((type) => (
                    <SelectItem key={type.id} value={type.enum_title.toLowerCase()}>
                      {type.enum_title}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="address">Address *</Label>
            <Input id="address" name="address" placeholder="Street address" required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label htmlFor="country">Country *</Label>
              <Select value={selectedCountry} onValueChange={setSelectedCountry} required>
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
              <Label htmlFor="state">State *</Label>
              <Select value={selectedState} onValueChange={setSelectedState} disabled={!selectedCountry} required>
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
              <Label htmlFor="city">City *</Label>
              <Select value={selectedCity} onValueChange={setSelectedCity} disabled={!selectedState} required>
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
              <Input id="start_date" name="start_date" type="datetime-local" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date & Time *</Label>
              <Input id="end_date" name="end_date" type="datetime-local" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="registration_start_date">Registration Start Date *</Label>
              <Input id="registration_start_date" name="registration_start_date" type="datetime-local" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="registration_end_date">Registration End Date *</Label>
              <Input id="registration_end_date" name="registration_end_date" type="datetime-local" required />
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
              <Label htmlFor="capacity">Capacity * (0 = Unlimited)</Label>
              <Input id="capacity" name="capacity" type="number" placeholder="0" defaultValue="0" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="min_age">Minimum Age *</Label>
              <Input id="min_age" name="min_age" type="number" placeholder="Min age" required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="max_age">Maximum Age *</Label>
              <Input id="max_age" name="max_age" type="number" placeholder="Max age" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="gender_limitation">Gender Limitation *</Label>
            <Select value={genderLimitation} onValueChange={setGenderLimitation} required>
              <SelectTrigger>
                <SelectValue placeholder="Select gender limitation" />
              </SelectTrigger>
              <SelectContent>
                {genderLimitations.map((limitation) => (
                  <SelectItem key={limitation.id} value={limitation.enum_title.toLowerCase().replace(/ /g, "_")}>
                    {limitation.enum_title}
                  </SelectItem>
                ))}
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
            <Label htmlFor="banner_images">Banner Images * (Multiple)</Label>
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
            <Label htmlFor="logo">Event Logo *</Label>
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
              <Label htmlFor="entry_fee">Entry Fee / Ticket Price * (0 = Free)</Label>
              <Input id="entry_fee" name="entry_fee" type="number" step="0.01" min="0" placeholder="0.00" defaultValue="0" required />
            </div>

            <div className="flex items-center space-x-2 pt-8">
              <Checkbox id="subscription_required" checked={subscriptionRequired} onCheckedChange={(checked) => setSubscriptionRequired(checked as boolean)} />
              <Label htmlFor="subscription_required" className="cursor-pointer">
                Subscription Required
              </Label>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="refund_policy">Refund Policy</Label>
            <Textarea id="refund_policy" name="refund_policy" placeholder="Refund policy details" rows={3} />
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
              <Checkbox id="notification_enabled" checked={notificationEnabled} onCheckedChange={(checked) => setNotificationEnabled(checked as boolean)} />
              <Label htmlFor="notification_enabled" className="cursor-pointer">
                Enable Notifications
              </Label>
            </div>

            <div className="flex items-center space-x-2">
              <Checkbox id="reminder_enabled" checked={reminderEnabled} onCheckedChange={(checked) => setReminderEnabled(checked as boolean)} />
              <Label htmlFor="reminder_enabled" className="cursor-pointer">
                Enable Reminders
              </Label>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-end gap-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/events")} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          Create Event
        </Button>
      </div>
    </form>
  )
}
