import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = parseFloat(searchParams.get("lat") || "0")
    const lng = parseFloat(searchParams.get("lng") || "0")

    if (!lat || !lng) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Use Google Geocoding API for reverse geocoding
    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?latlng=${lat},${lng}&key=${apiKey}`
    )

    if (!response.ok) {
      return NextResponse.json({ error: "Failed to reverse geocode" }, { status: 500 })
    }

    const data = await response.json()

    if (data.status !== "OK" || !data.results || data.results.length === 0) {
      return NextResponse.json({ error: "No results found" }, { status: 404 })
    }

    // Extract location components
    const result = data.results[0]
    const components = result.address_components || []

    let city = ""
    let state = ""
    let stateCode = ""
    let country = ""
    let countryCode = ""

    for (const component of components) {
      const types = component.types || []
      
      if (types.includes("locality")) {
        city = component.long_name
      } else if (types.includes("administrative_area_level_1")) {
        state = component.long_name
        stateCode = component.short_name
      } else if (types.includes("country")) {
        country = component.long_name
        countryCode = component.short_name
      }
    }

    // Try to match with our database
    const supabase = await createServerClient()

    // Find country in our database
    let countryId = null
    let stateId = null
    let cityId = null

    if (countryCode) {
      const { data: countryData } = await supabase
        .from("countries")
        .select("id, name")
        .or(`code.eq.${countryCode},name.ilike.%${country}%`)
        .limit(1)
        .single()
      
      if (countryData) {
        countryId = countryData.id
      }
    }

    // Find state in our database
    if (countryId && (stateCode || state)) {
      const { data: stateData } = await supabase
        .from("states")
        .select("id, name")
        .eq("country_id", countryId)
        .or(`code.eq.${stateCode},name.ilike.%${state}%`)
        .limit(1)
        .single()
      
      if (stateData) {
        stateId = stateData.id
      }
    }

    // Find city in our database
    if (stateId && city) {
      const { data: cityData } = await supabase
        .from("cities")
        .select("id, name")
        .eq("state_id", stateId)
        .ilike("name", `%${city}%`)
        .limit(1)
        .single()
      
      if (cityData) {
        cityId = cityData.id
      }
    }

    return NextResponse.json({
      city,
      state,
      stateCode,
      country,
      countryCode,
      countryId,
      stateId,
      cityId,
      formattedAddress: result.formatted_address
    })
  } catch (error) {
    console.error("Error in reverse geocode API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
