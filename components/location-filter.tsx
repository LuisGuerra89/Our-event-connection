"use client"

import { useState, useEffect } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2 } from "lucide-react"

interface Country {
  id: string
  name: string
  code: string
}

interface State {
  id: string
  name: string
  code: string
  country_id: string
}

interface City {
  id: string
  name: string
  state_id: string
}

interface Props {
  onCountryChange?: (countryId: string) => void
  onStateChange?: (stateId: string) => void
  onCityChange?: (cityId: string) => void
  selectedCountry?: string
  selectedState?: string
  selectedCity?: string
  showCountry?: boolean
  showState?: boolean
  showCity?: boolean
  defaultCountryCode?: string // e.g., "US" for domestic events
}

export function LocationFilter({
  onCountryChange,
  onStateChange,
  onCityChange,
  selectedCountry = "",
  selectedState = "",
  selectedCity = "",
  showCountry = true,
  showState = true,
  showCity = true,
  defaultCountryCode
}: Props) {
  const [countries, setCountries] = useState<Country[]>([])
  const [states, setStates] = useState<State[]>([])
  const [cities, setCities] = useState<City[]>([])
  const [loading, setLoading] = useState(false)

  const supabase = createBrowserClient()

  // Load countries on mount
  useEffect(() => {
    const loadCountries = async () => {
      setLoading(true)
      const { data } = await supabase
        .from("countries")
        .select("*")
        .eq("status", "active")
        .order("name")
      
      if (data) {
        setCountries(data)
        
        // Auto-select default country if provided
        if (defaultCountryCode && !selectedCountry) {
          const defaultCountry = data.find(c => c.code === defaultCountryCode)
          if (defaultCountry && onCountryChange) {
            onCountryChange(defaultCountry.id)
          }
        }
      }
      setLoading(false)
    }
    loadCountries()
  }, [supabase])

  // Load states when country changes
  useEffect(() => {
    if (!selectedCountry) {
      setStates([])
      setCities([])
      return
    }
    
    const loadStates = async () => {
      const { data } = await supabase
        .from("states")
        .select("*")
        .eq("country_id", selectedCountry)
        .eq("status", "active")
        .order("name")
      
      if (data) {
        setStates(data)
      }
    }
    loadStates()
  }, [selectedCountry, supabase])

  // Load cities when state changes
  useEffect(() => {
    if (!selectedState) {
      setCities([])
      return
    }
    
    const loadCities = async () => {
      const { data } = await supabase
        .from("cities")
        .select("*")
        .eq("state_id", selectedState)
        .eq("status", "active")
        .order("name")
      
      if (data) {
        setCities(data)
      }
    }
    loadCities()
  }, [selectedState, supabase])

  if (loading && showCountry) {
    return (
      <div className="flex items-center gap-2 text-muted-foreground">
        <Loader2 className="w-4 h-4 animate-spin" />
        <span className="text-sm">Loading locations...</span>
      </div>
    )
  }

  return (
    <div className="flex flex-col sm:flex-row gap-3">
      {showCountry && (
        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select
            value={selectedCountry || "all-countries"}
            onValueChange={(value) => {
              const newValue = value === "all-countries" ? "" : value
              onCountryChange?.(newValue)
              onStateChange?.("")
              onCityChange?.("")
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select Country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-countries">All Countries</SelectItem>
              {countries.map((country) => (
                <SelectItem key={country.id} value={country.id}>
                  {country.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showState && selectedCountry && (
        <div className="space-y-2">
          <label className="text-sm font-medium">State</label>
          <Select
            value={selectedState || "all-states"}
            onValueChange={(value) => {
              const newValue = value === "all-states" ? "" : value
              onStateChange?.(newValue)
              onCityChange?.("")
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select State" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-states">All States</SelectItem>
              {states.map((state) => (
                <SelectItem key={state.id} value={state.id}>
                  {state.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}

      {showCity && selectedState && (
        <div className="space-y-2">
          <label className="text-sm font-medium">City</label>
          <Select
            value={selectedCity || "all-cities"}
            onValueChange={(value) => {
              const newValue = value === "all-cities" ? "" : value
              onCityChange?.(newValue)
            }}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Select City" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all-cities">All Cities</SelectItem>
              {cities.map((city) => (
                <SelectItem key={city.id} value={city.id}>
                  {city.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      )}
    </div>
  )
}
