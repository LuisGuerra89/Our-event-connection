import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

// GET - Get a single photo/video
export async function GET(request: Request, { params }: { params: { id: string; photoId: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("event_photos").select("*").eq("id", params.photoId).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Photo not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update a photo/video
export async function PATCH(request: Request, { params }: { params: { id: string; photoId: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { photo_url, photo_type, caption, display_order } = body

    const updateData: any = {}
    if (photo_url !== undefined) updateData.photo_url = photo_url
    if (photo_type !== undefined) {
      if (!["photo", "video"].includes(photo_type)) {
        return NextResponse.json({ error: "Invalid photo_type. Must be 'photo' or 'video'" }, { status: 400 })
      }
      updateData.photo_type = photo_type
    }
    if (caption !== undefined) updateData.caption = caption
    if (display_order !== undefined) updateData.display_order = display_order

    const { data, error } = await supabase
      .from("event_photos")
      .update(updateData)
      .eq("id", params.photoId)
      .select()
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// DELETE - Delete a specific photo/video
export async function DELETE(request: Request, { params }: { params: { id: string; photoId: string } }) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin
    const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

    if (profile?.role !== "admin") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { error } = await supabase.from("event_photos").delete().eq("id", params.photoId)

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Photo deleted successfully" })
  } catch (error) {
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
