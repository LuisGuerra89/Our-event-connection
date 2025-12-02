"use client"

import { useEffect, useRef, useState } from "react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Loader2, AlertCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"

interface LocationData {
  address: string
  country: string
  state: string
  city: string
  countryId?: string
  stateId?: string
  cityId?: string
}

interface AddressAutocompleteProps {
  label?: string
  placeholder?: string
  onAddressSelect: (data: LocationData) => void
  countries: Array<{ id: string; name: string }>
  states: Array<{ id: string; name: string; country_id: string; code?: string }>
  cities: Array<{ id: string; name: string; state_id: string }>
  error?: string
  disabled?: boolean
}

export default function AddressAutocompleteWithLocation({
  label = "Address",
  placeholder = "Enter your address",
  onAddressSelect,
  countries,
  states,
  cities,
  error,
  disabled = false,
}: AddressAutocompleteProps) {
  const [address, setAddress] = useState("")
  const [suggestions, setSuggestions] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [showSuggestions, setShowSuggestions] = useState(false)
  const [selectedSuggestion, setSelectedSuggestion] = useState<any | null>(null)
  const [locationLoading, setLocationLoading] = useState(false)
  const [locationError, setLocationError] = useState<string | null>(null)
  const [apiInitialized, setApiInitialized] = useState(false)

  const autocompleteServiceRef = useRef<google.maps.places.AutocompleteService | null>(null)
  const placesServiceRef = useRef<google.maps.places.PlacesService | null>(null)
  const mapRef = useRef<HTMLDivElement>(null)
  const dropdownRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        if (inputRef.current && !inputRef.current.contains(event.target as Node)) {
          setShowSuggestions(false)
        }
      }
    }

    document.addEventListener("mousedown", handleClickOutside)
    return () => document.removeEventListener("mousedown", handleClickOutside)
  }, [])

  useEffect(() => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY
    if (!apiKey) {
      setLocationError("Google Maps API key is not configured")
      return
    }

    // Check if script already exists
    if (document.querySelector('script[src*="maps.googleapis.com"]')) {
      if (typeof google !== "undefined" && google.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 4,
          })
          placesServiceRef.current = new google.maps.places.PlacesService(map)
        }
        setApiInitialized(true)
      }
      return
    }

    const script = document.createElement("script")
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`
    script.async = true
    script.defer = true

    script.onload = () => {
      if (typeof google !== "undefined" && google.maps?.places) {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService()
        if (mapRef.current) {
          const map = new google.maps.Map(mapRef.current, {
            center: { lat: 39.8283, lng: -98.5795 },
            zoom: 4,
          })
          placesServiceRef.current = new google.maps.places.PlacesService(map)
        }
        setApiInitialized(true)
      }
    }

    script.onerror = () => {
      setLocationError("Failed to load Google Maps")
    }

    document.head.appendChild(script)
  }, [])

  const handleInputChange = async (value: string) => {
    setAddress(value)
    setLocationError(null)

    if (value.length < 3 || !apiInitialized) {
      setSuggestions([])
      setShowSuggestions(false)
      return
    }

    setLoading(true)
    try {
      const predictions = await autocompleteServiceRef.current?.getPlacePredictions({
        input: value,
        componentRestrictions: { country: "us" },
        types: ["address"],
      })

      if (predictions?.predictions) {
        console.log("Predictions received:", predictions.predictions)
        setSuggestions(predictions.predictions)
        setShowSuggestions(true)
      } else {
        setSuggestions([])
      }
    } catch (err) {
      console.error("Error fetching suggestions:", err)
      setLocationError("Failed to fetch address suggestions")
    } finally {
      setLoading(false)
    }
  }

  const getPlaceDetails = async (placeId: string): Promise<LocationData | null> => {
    return new Promise((resolve) => {
      if (!placesServiceRef.current) {
        resolve(null)
        return
      }

      placesServiceRef.current.getDetails(
        {
          placeId,
          fields: ["formatted_address", "address_components"],
        },
        (place: google.maps.places.PlaceResult | null, status: google.maps.places.PlacesServiceStatus) => {
          if (status === google.maps.places.PlacesServiceStatus.OK && place?.address_components) {
            let country = ""
            let state = ""
            let stateCode = ""
            let city = ""
            const formattedAddress = place.formatted_address || ""

            for (const component of place.address_components) {
              if (component.types.includes("country")) {
                country = component.long_name
              }
              if (component.types.includes("administrative_area_level_1")) {
                state = component.long_name // Use long_name for full state name
                stateCode = component.short_name // Keep short_name for code
              }
              if (component.types.includes("locality")) {
                city = component.long_name
              }
            }

            if (country.toLowerCase() !== "united states" && country.toLowerCase() !== "usa") {
              setLocationError("Only United States addresses are allowed")
              resolve(null)
              return
            }

            const countryObj = countries.find((c) => c.name.toLowerCase() === "united states")
            let stateId = ""
            let cityId = ""

            console.log("Location data extracted:", { country, state, stateCode, city })

            if (countryObj && state) {
              // Try to find state by full name first
              let stateObj = states.find(
                (s) => s.country_id === countryObj.id && s.name.toLowerCase() === state.toLowerCase()
              )
              
              console.log("State lookup (by name):", { searchName: state, found: !!stateObj, available: states.filter(s => s.country_id === countryObj.id).map(s => s.name) })
              
              // If not found, try by code
              if (!stateObj && stateCode) {
                stateObj = states.find(
                  (s) => s.country_id === countryObj.id && s.code?.toUpperCase() === stateCode?.toUpperCase()
                )
                console.log("State lookup (by code):", { searchCode: stateCode, found: !!stateObj })
              }

              if (stateObj) {
                stateId = stateObj.id
                console.log("State found:", { stateId, stateName: stateObj.name })
                
                if (city) {
                  const cityObj = cities.find((c) => c.state_id === stateId && c.name.toLowerCase() === city.toLowerCase())
                  console.log("City lookup:", { searchCity: city, stateId, found: !!cityObj, availableCities: cities.filter(c => c.state_id === stateId).map(c => c.name) })
                  
                  if (cityObj) {
                    cityId = cityObj.id
                    console.log("City found:", { cityId, cityName: cityObj.name })
                  }
                }
              }
            }

            resolve({
              address: formattedAddress,
              country,
              state,
              city,
              countryId: countryObj?.id,
              stateId,
              cityId,
            })
          } else {
            setLocationError("Could not get location details")
            resolve(null)
          }
        }
      )
    })
  }

  const handleSuggestionSelect = async (suggestion: any) => {
    setLocationLoading(true)
    setShowSuggestions(false)

    const locationData = await getPlaceDetails(suggestion.place_id)
    if (locationData) {
      setAddress(locationData.address)
      setSelectedSuggestion(locationData)
      onAddressSelect(locationData)
    }

    setLocationLoading(false)
  }

  return (
    <div className="space-y-2">
      {label && <Label htmlFor="address-autocomplete">{label}</Label>}

      <div className="relative">
        <div className="flex items-center gap-2">
          <Input
            ref={inputRef}
            id="address-autocomplete"
            value={address}
            onChange={(e) => handleInputChange(e.target.value)}
            onFocus={() => address.length >= 3 && setShowSuggestions(true)}
            placeholder={placeholder}
            disabled={disabled || locationLoading || !apiInitialized}
            autoComplete="off"
          />
          {(loading || locationLoading) && <Loader2 className="h-4 w-4 animate-spin" />}
        </div>

        {showSuggestions && suggestions.length > 0 && (
          <div ref={dropdownRef} className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md shadow-lg z-50 mt-1 max-h-64 overflow-y-auto">
            {suggestions.map((suggestion: any, index: number) => {
              const mainText = suggestion.main_text || suggestion.description || ""
              const secondaryText = suggestion.secondary_text || ""
              return (
                <button
                  key={`${suggestion.place_id}-${index}`}
                  type="button"
                  onClick={() => handleSuggestionSelect(suggestion)}
                  className="w-full px-4 py-3 text-left hover:bg-blue-50 border-b border-gray-200 last:border-b-0 text-sm transition-colors bg-white"
                >
                  <div className="font-medium text-gray-800">{mainText}</div>
                  {secondaryText && <div className="text-xs text-gray-600">{secondaryText}</div>}
                </button>
              )
            })}
          </div>
        )}
      </div>

      {(error || locationError) && (
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{error || locationError}</AlertDescription>
        </Alert>
      )}

      {selectedSuggestion && (
        <div className="text-sm text-green-600">
          ✓ Address selected: {selectedSuggestion.city}, {selectedSuggestion.state}
        </div>
      )}

      <div ref={mapRef} style={{ display: "none" }} />
    </div>
  )
}
