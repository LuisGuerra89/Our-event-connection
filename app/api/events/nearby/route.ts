import { NextRequest, NextResponse } from "next/server"
import { createServerClient } from "@/lib/supabase/server"

export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const lat = parseFloat(searchParams.get("lat") || "0")
    const lon = parseFloat(searchParams.get("lon") || "0")
    const limit = parseInt(searchParams.get("limit") || "10")
    const radiusMiles = parseInt(searchParams.get("radius") || "50")

    if (!lat || !lon) {
      return NextResponse.json({ error: "Latitude and longitude are required" }, { status: 400 })
    }

    const supabase = await createServerClient()

    // Get all upcoming events
    const { data: events, error } = await supabase
      .from("events")
      .select("*")
      .in("status", ["upcoming", "ongoing"])
      .gte("start_date", new Date().toISOString())
      .order("start_date")

    if (error) {
      console.error("Error fetching events:", error)
      return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 })
    }

    // Calculate distance for each event using Haversine formula
    const eventsWithDistance = events
      ?.map((event) => {
        // If event has coordinates, calculate distance
        if (event.latitude && event.longitude) {
          const distance = calculateDistance(lat, lon, event.latitude, event.longitude)
          return { ...event, distance }
        }
        // If no coordinates, we can't calculate distance precisely
        // Return a large distance so it appears at the end
        return { ...event, distance: 999999 }
      })
      .filter((event) => event.distance <= radiusMiles)
      .sort((a, b) => a.distance - b.distance)
      .slice(0, limit)

    return NextResponse.json({
      events: eventsWithDistance,
      count: eventsWithDistance?.length || 0,
    })
  } catch (error) {
    console.error("Error in nearby events API:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// Haversine formula to calculate distance between two coordinates
function calculateDistance(lat1: number, lon1: number, lat2: number, lon2: number): number {
  const R = 3959 // Earth's radius in miles
  const dLat = toRadians(lat2 - lat1)
  const dLon = toRadians(lon2 - lon1)

  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2)

  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
  const distance = R * c

  return distance
}

function toRadians(degrees: number): number {
  return degrees * (Math.PI / 180)
}
