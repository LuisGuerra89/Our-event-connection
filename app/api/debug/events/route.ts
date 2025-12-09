import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const supabase = await createClient()

    // Get all events with their types
    const { data: allEvents } = await supabase
      .from("events")
      .select("id, title, event_type, status")
      .limit(20)

    // Get extreme_sports events specifically
    const { data: extremeSportsEvents } = await supabase
      .from("events")
      .select("id, title, event_type, status")
      .eq("event_type", "extreme_sports")

    // Get all unique event types
    const { data: eventTypes } = await supabase
      .from("events")
      .select("event_type")
      .neq("event_type", null)

    const uniqueEventTypes = [...new Set(eventTypes?.map(e => e.event_type))]

    return NextResponse.json({
      allEvents,
      extremeSportsEvents,
      uniqueEventTypes,
      totalEvents: allEvents?.length,
    })
  } catch (error) {
    return NextResponse.json({
      error: "Server error",
      details: error instanceof Error ? error.message : String(error),
    }, { status: 500 })
  }
}
