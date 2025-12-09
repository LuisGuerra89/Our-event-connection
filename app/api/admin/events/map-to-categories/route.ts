import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// Mapping of event_type to category slug
const eventTypeToCategory: Record<string, string> = {
  after_work: "after-work-activities",
  extreme_sports: "extreme-sports",
  water_sports: "water-sports",
  weekend_activity: "weekend-activities",
  winter_sports: "winter-sports",
  travel: "travel",
  sports: "extreme-sports", // Default sports to extreme sports
}

export async function POST(request: Request) {
  try {
    const supabase = await createClient()

    // Verify the user is an admin
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Get all categories
    const { data: categories } = await supabase
      .from("event_categories")
      .select("id, slug")

    if (!categories) {
      return NextResponse.json(
        { error: "Failed to fetch categories" },
        { status: 500 }
      )
    }

    // Get all events that don't have mappings yet
    const { data: events } = await supabase
      .from("events")
      .select("id, event_type")
      .eq("status", "active")

    if (!events) {
      return NextResponse.json(
        { error: "Failed to fetch events" },
        { status: 500 }
      )
    }

    let mappedCount = 0
    const errors: string[] = []

    for (const event of events) {
      if (!event.event_type) continue

      // Get the category slug for this event type
      const categorySlug = eventTypeToCategory[event.event_type]
      if (!categorySlug) continue

      // Find the category ID
      const category = categories.find((c) => c.slug === categorySlug)
      if (!category) continue

      // Check if mapping already exists
      const { data: existingMapping } = await supabase
        .from("event_category_mapping")
        .select("id")
        .eq("event_id", event.id)
        .eq("category_id", category.id)
        .single()

      if (existingMapping) {
        continue // Mapping already exists
      }

      // Create the mapping
      const { error } = await supabase
        .from("event_category_mapping")
        .insert([
          {
            event_id: event.id,
            category_id: category.id,
          },
        ])

      if (error) {
        errors.push(`Failed to map event ${event.id}: ${error.message}`)
      } else {
        mappedCount++
      }
    }

    return NextResponse.json({
      success: true,
      mappedCount,
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    console.error("Error mapping events to categories:", error)
    return NextResponse.json(
      {
        error: "Server error",
        details: error instanceof Error ? error.message : String(error),
      },
      { status: 500 }
    )
  }
}
