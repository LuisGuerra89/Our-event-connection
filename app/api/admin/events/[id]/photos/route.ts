import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - List all photos/videos for an event
export async function GET(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase
      .from("event_photos")
      .select("*")
      .eq("event_id", params.id)
      .order("display_order")

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Add a new photo/video to an event
export async function POST(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", user.id)
      .single()

    const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null

    if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { photo_url, photo_type, caption, display_order } = body

    // Validate required fields
    if (!photo_url || !photo_type) {
      return NextResponse.json({ error: "Missing required fields" }, { status: 400 })
    }

    if (!["photo", "video"].includes(photo_type)) {
      return NextResponse.json({ error: "Invalid photo_type. Must be 'photo' or 'video'" }, { status: 400 })
    }

    const { data, error } = await supabase
      .from("event_photos")
      .insert({
        event_id: params.id,
        photo_url,
        photo_type,
        caption,
        display_order: display_order ?? 0,
        uploaded_by: user.id,
      })
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete all photos for an event (rarely used)
export async function DELETE(request: Request, { params }: { params: { id: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role_id, roles(role_name)")
      .eq("id", user.id)
      .single()

    const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null

    if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("event_photos").delete().eq("event_id", params.id)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "All photos deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
