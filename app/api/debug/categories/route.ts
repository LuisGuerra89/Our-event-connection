import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get extreme-sports category
    const { data: extremeSports, error: esError } = await supabase
      .from("event_categories")
      .select("*")
      .eq("slug", "extreme-sports")
      .single()

    if (esError) {
      return NextResponse.json({
        error: "Error fetching extreme-sports category",
        details: esError,
      }, { status: 500 })
    }

    // Get event mappings for extreme-sports
    const { data: eventMappings, error: mapError } = await supabase
      .from("event_category_mapping")
      .select("*")
      .eq("category_id", extremeSports?.id)

    // If there are mappings, get the events
    let events = null
    let eventError = null
    if (eventMappings && eventMappings.length > 0) {
      const eventIds = eventMappings.map(m => m.event_id)
      const { data: categoryEvents, error: eError } = await supabase
        .from("events")
        .select("id, title, status, event_type")
        .in("id", eventIds)

      events = categoryEvents
      eventError = eError
    }

    // Get all events with extreme_sports event_type (not mapped yet)
    const { data: unmappedEvents } = await supabase
      .from("events")
      .select("id, title, event_type, status")
      .in("event_type", ["extreme_sports", "sports"])
      .limit(10)

    // Get all categories
    const { data: allCategories } = await supabase
      .from("event_categories")
      .select("id, name, slug")

    // Get all event mappings
    const { data: allMappings } = await supabase
      .from("event_category_mapping")
      .select("*")

    // Get total event count
    const { count: totalEvents } = await supabase
      .from("events")
      .select("id", { count: "exact", head: true })

    return NextResponse.json({
      extremeSports,
      eventMappings,
      mapError,
      eventsFromMapping: events,
      eventError,
      unmappedEvents,
      allCategories,
      allMappings,
      totalEvents,
    })
  } catch (error) {
    return NextResponse.json({
      error: "Server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}

