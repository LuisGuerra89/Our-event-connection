import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { address, city, state, country } = body

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

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
      return NextResponse.json({
        latitude: result.geometry.location.lat,
        longitude: result.geometry.location.lng,
        formatted_address: result.formatted_address,
      })
    }

    return NextResponse.json(
      { error: "Geocoding failed", details: data.error_message },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error in geocode API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = searchParams.get("lat")
    const lng = searchParams.get("lng")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
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

      return NextResponse.json({
        address: result.formatted_address,
        city,
        state,
        country,
      })
    }

    return NextResponse.json(
      { error: "Reverse geocoding failed", details: data.error_message },
      { status: 400 }
    )
  } catch (error) {
    console.error("Error in reverse geocode API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
