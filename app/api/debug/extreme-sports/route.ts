import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Step 1: Get the extreme-sports category
    console.log("Step 1: Getting extreme-sports category...")
    const { data: category, error: catError } = await supabase
      .from("event_categories")
      .select("*")
      .eq("slug", "extreme-sports")
      .single()

    console.log("Category:", category)
    console.log("Category Error:", catError)

    if (!category) {
      return NextResponse.json({
        error: "Category not found",
        step: 1,
      }, { status: 404 })
    }

    // Step 2: Get mappings for this category
    console.log("Step 2: Getting mappings for category ID:", category.id)
    const { data: mappings, error: mapError } = await supabase
      .from("event_category_mapping")
      .select("*")
      .eq("category_id", category.id)

    console.log("Mappings:", mappings)
    console.log("Mappings Error:", mapError)

    if (!mappings || mappings.length === 0) {
      return NextResponse.json({
        error: "No mappings found for this category",
        step: 2,
        category,
        mappings,
      }, { status: 404 })
    }

    // Step 3: Get the event IDs from mappings
    const eventIds = mappings.map(m => m.event_id)
    console.log("Step 3: Event IDs to fetch:", eventIds)

    // Step 4: Get the actual events
    console.log("Step 4: Fetching events...")
    const { data: events, error: eventError } = await supabase
      .from("events")
      .select("*")
      .in("id", eventIds)
      .eq("status", "active")
      .order("start_date", { ascending: true })

    console.log("Events:", events)
    console.log("Events Error:", eventError)

    // Step 5: Get ALL events (for comparison)
    console.log("Step 5: Getting ALL events for comparison...")
    const { data: allEvents } = await supabase
      .from("events")
      .select("id, title, status, category_id")
      .limit(10)

    return NextResponse.json({
      success: true,
      category,
      mappings,
      eventIds,
      events: events || [],
      allEvents,
    })
  } catch (error) {
    console.error("Error:", error)
    return NextResponse.json({
      error: "Server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
