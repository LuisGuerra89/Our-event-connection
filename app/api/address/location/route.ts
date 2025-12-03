import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

interface LocationResponse {
  country: string
  state: string
  city: string
  countryId?: string
  stateId?: string
  cityId?: string
  error?: string
}

export async function POST(request: NextRequest): Promise<NextResponse<LocationResponse>> {
  try {
    const { address, city, state, country } = await request.json()

    if (!address) {
      return NextResponse.json({ error: "Address is required" }, { status: 400 })
    }

    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY

    if (!apiKey) {
      return NextResponse.json({ error: "Google Maps API key not configured" }, { status: 500 })
    }

    // Use Google Geocoding API to get location details
    const fullAddress = [address, city, state, country].filter(Boolean).join(", ")

    const response = await fetch(
      `https://maps.googleapis.com/maps/api/geocode/json?address=${encodeURIComponent(fullAddress)}&key=${apiKey}`
    )

    const data = await response.json()

    if (data.status !== "OK" || data.results.length === 0) {
      return NextResponse.json(
        { error: "Could not geocode address" },
        { status: 400 }
      )
    }

    const result = data.results[0]
    const components = result.address_components

    let extractedCountry = ""
    let extractedState = ""
    let extractedCity = ""

    // Extract address components
    for (const component of components) {
      if (component.types.includes("country")) {
        extractedCountry = component.long_name
      }
      if (component.types.includes("administrative_area_level_1")) {
        extractedState = component.short_name || component.long_name
      }
      if (component.types.includes("locality")) {
        extractedCity = component.long_name
      }
    }

    // Only allow USA addresses
    if (
      extractedCountry.toLowerCase() !== "united states" &&
      extractedCountry.toLowerCase() !== "usa"
    ) {
      return NextResponse.json(
        { error: "Only United States addresses are allowed" },
        { status: 400 }
      )
    }

    // Get database connection and look up IDs
    const supabase = await createServerClient()

    // Find country ID
    const { data: countryData } = await supabase
      .from("countries")
      .select("id")
      .ilike("name", "United States")
      .single()

    // Find state ID
    let stateId = undefined
    if (countryData && extractedState) {
      const { data: stateData } = await supabase
        .from("states")
        .select("id")
        .eq("country_id", countryData.id)
        .ilike("name", extractedState)
        .single()

      stateId = stateData?.id

      // Find city ID
      let cityId = undefined
      if (stateId && extractedCity) {
        const { data: cityData } = await supabase
          .from("cities")
          .select("id")
          .eq("state_id", stateId)
          .ilike("name", extractedCity)
          .single()

        cityId = cityData?.id

        return NextResponse.json({
          country: extractedCountry,
          state: extractedState,
          city: extractedCity,
          countryId: countryData.id,
          stateId,
          cityId,
        })
      }

      return NextResponse.json({
        country: extractedCountry,
        state: extractedState,
        city: extractedCity,
        countryId: countryData.id,
        stateId,
      })
    }

    return NextResponse.json({
      country: extractedCountry,
      state: extractedState,
      city: extractedCity,
      countryId: countryData?.id,
    })
  } catch (error) {
    console.error("Error in location API:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
