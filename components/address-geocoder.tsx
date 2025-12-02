"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { MapPin, Loader2, CheckCircle2 } from "lucide-react"

interface AddressGeocoderProps {
  onGeocodeSuccess?: (result: {
    latitude: number
    longitude: number
    formatted_address: string
  }) => void
  address?: string
  city?: string
  state?: string
  country?: string
}

export function AddressGeocoder({
  onGeocodeSuccess,
  address = "",
  city = "",
  state = "",
  country = "",
}: AddressGeocoderProps) {
  const [isGeocoding, setIsGeocoding] = useState(false)
  const [geocoded, setGeocoded] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [result, setResult] = useState<{
    latitude: number
    longitude: number
    formatted_address: string
  } | null>(null)

  const handleGeocode = async () => {
    if (!address && !city) {
      setError("Please provide at least an address or city")
      return
    }

    setIsGeocoding(true)
    setError(null)
    setGeocoded(false)

    try {
      const response = await fetch("/api/geocode", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          address,
          city,
          state,
          country,
        }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to geocode address")
      }

      setResult(data)
      setGeocoded(true)
      
      if (onGeocodeSuccess) {
        onGeocodeSuccess(data)
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to geocode address")
    } finally {
      setIsGeocoding(false)
    }
  }

  return (
    <div className="space-y-4 p-4 border rounded-lg bg-muted/30">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <MapPin className="h-5 w-5 text-primary" />
          <Label className="text-base font-semibold">Get Coordinates</Label>
        </div>
        {geocoded && (
          <div className="flex items-center gap-2 text-green-600">
            <CheckCircle2 className="h-4 w-4" />
            <span className="text-sm">Geocoded</span>
          </div>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Convert the event address to latitude/longitude coordinates for map display
      </p>

      <Button
        type="button"
        onClick={handleGeocode}
        disabled={isGeocoding}
        variant="outline"
        className="w-full"
      >
        {isGeocoding && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
        {isGeocoding ? "Finding coordinates..." : "Find Coordinates"}
      </Button>

      {error && (
        <div className="p-3 bg-destructive/10 text-destructive rounded-md text-sm">
          {error}
        </div>
      )}

      {result && (
        <div className="space-y-2 p-3 bg-green-50 dark:bg-green-950/20 rounded-md">
          <p className="text-sm font-medium text-green-800 dark:text-green-200">
            Coordinates Found!
          </p>
          <div className="grid grid-cols-2 gap-2 text-xs text-green-700 dark:text-green-300">
            <div>
              <span className="font-medium">Latitude:</span> {result.latitude.toFixed(6)}
            </div>
            <div>
              <span className="font-medium">Longitude:</span> {result.longitude.toFixed(6)}
            </div>
          </div>
          <p className="text-xs text-green-600 dark:text-green-400 mt-2">
            {result.formatted_address}
          </p>
        </div>
      )}
    </div>
  )
}
