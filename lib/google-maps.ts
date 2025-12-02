/**
 * Geocoding utility for converting addresses to coordinates using Google Maps API
 */

interface GeocodeResult {
  latitude: number
  longitude: number
  formatted_address: string
}

export async function geocodeAddress(
  address: string,
  city?: string,
  state?: string,
  country?: string
): Promise<GeocodeResult | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key is not configured")
    return null
  }

  try {
    // Build full address
    const fullAddress = [address, city, state, country].filter(Boolean).join(", ")

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(
        fullAddress
      )}&key=${apiKey}`
    )

    const data = await response.json()

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0]
      return {
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      }
    }

    console.error("Geocoding failed:", data.status, data.error_message)
    return null
  } catch (error) {
    console.error("Error geocoding address:", error)
    return null
  }
}

/**
 * Reverse geocoding - convert coordinates to address
 */
export async function reverseGeocode(
  latitude: number,
  longitude: number
): Promise<{
  address: string
  city: string
  state: string
  country: string
} | null> {
  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

  if (!apiKey) {
    console.error("Google Maps API key is not configured")
    return null
  }

  try {
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${apiKey}`
    )

    const data = await response.json()

    if (data.status === "OK" && data.results.length > 0) {
      const result = data.results[0]
      const components = result.address_components

      let city = ""
      let state = ""
      let country = ""

      for (const component of components) {
        if (component.types.includes("locality")) {
          city = component.long_name
        }
        if (component.types.includes("administrative_area_level_1")) {
          state = component.short_name
        }
        if (component.types.includes("country")) {
          country = component.long_name
        }
      }

      return {
        address: result.formatted_address,
        city,
        state,
        country,
      }
    }

    return null
  } catch (error) {
    console.error("Error reverse geocoding:", error)
    return null
  }
}

/**
 * Calculate distance between two coordinates using Haversine formula
 */
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
  unit: "miles" | "km" = "miles"
): number {
  const R = unit === "miles" ? 3959 : 6371 // Earth's radius
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return Math.round(distance * 10) / 10 // Round to 1 decimal place
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}

/**
 * Get user's current location using browser geolocation
 */
export function getUserLocation(): Promise<{ latitude: number; longitude: number }> {
  return new Promise((resolve, reject) => {
    if (!("geolocation" in navigator)) {
      reject(new Error("Geolocation is not supported by this browser"))
      return
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        })
      },
      (error) => {
        reject(error)
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    )
  })
}
