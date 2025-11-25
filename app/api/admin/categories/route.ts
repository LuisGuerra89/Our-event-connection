import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth-utils"

// GET - List all categories with optional search
export async function GET(request: Request) {
  try {
    const supabase = await createServerClient()
    const { searchParams } = new URL(request.url)
    const search = searchParams.get("search")

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    let query = supabase.from("event_categories").select("*").order("display_order")

    if (search) {
      query = query.or(`name.ilike.%${search}%,slug.ilike.%${search}%,description.ilike.%${search}%`)
    }

    const { data, error } = await query

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET categories error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// POST - Create a new category
export async function POST(request: Request) {
  try {
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    // Check if user is admin using the auth utility
    const adminCheck = await isAdmin(user.id)
    if (!adminCheck) {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json()
    const { name, slug, description, image_url, display_order, is_featured, status } = body

    // Validate required fields
    if (!name || !slug || !description) {
      return NextResponse.json(
        { error: "Missing required fields: name, slug, description" },
        { status: 400 }
      )
    }

    const insertData: Record<string, any> = {
      name,
      slug,
      description,
      display_order: display_order ?? 0,
      is_featured: is_featured ?? false,
      status: status ?? "active",
    }

    // Only add image_url if provided
    if (image_url !== undefined && image_url !== null && image_url !== "") {
      insertData.image_url = image_url
    }

    const { data, error } = await supabase
      .from("event_categories")
      .insert(insertData)
      .select()
      .single()

    if (error) {
      console.error("Create category error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data, { status: 201 })
  } catch (error) {
    console.error("POST categories error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
