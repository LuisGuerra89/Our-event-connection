import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"
import { isAdmin } from "@/lib/auth-utils"

// GET - Get a single category
export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
    const supabase = await createServerClient()

    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { data, error } = await supabase.from("event_categories").select("*").eq("id", id).single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!data) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("GET category error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}

// PATCH - Update a category
export async function PATCH(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Check if category is protected
    const { data: category, error: fetchError } = await supabase
      .from("event_categories")
      .select("is_protected")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (category.is_protected) {
      return NextResponse.json(
        { error: "System categories cannot be edited" },
        { status: 403 }
      )
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

    // Validate display_order
    const order = display_order ?? 0
    if (typeof order !== "number" || order < 0) {
      return NextResponse.json(
        { error: "Display order must be a non-negative number" },
        { status: 400 }
      )
    }

    // Check if display_order already exists (but not for the current category)
    const { data: existingCategory, error: checkError } = await supabase
      .from("event_categories")
      .select("id")
      .eq("display_order", order)
      .neq("id", id)
      .maybeSingle()

    if (checkError) {
      console.error("Check order error:", checkError)
      return NextResponse.json({ error: checkError.message }, { status: 500 })
    }

    if (existingCategory) {
      return NextResponse.json(
        { error: "This display order is already in use. Please choose a different number." },
        { status: 400 }
      )
    }

    const updateData: Record<string, any> = {
      name,
      slug,
      description,
      display_order: order,
      is_featured: is_featured ?? false,
      status: status ?? "active",
      updated_at: new Date().toISOString(),
    }

    // Only add image_url if provided
    if (image_url !== undefined && image_url !== null && image_url !== "") {
      updateData.image_url = image_url
    }

    const { data, error } = await supabase
      .from("event_categories")
      .update(updateData)
      .eq("id", id)
      .select()
      .single()

    if (error) {
      console.error("Update category error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
  } catch (error) {
    console.error("PATCH category error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}

// DELETE - Delete a category
export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params
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

    // Check if category is protected
    const { data: category, error: fetchError } = await supabase
      .from("event_categories")
      .select("is_protected")
      .eq("id", id)
      .single()

    if (fetchError) {
      return NextResponse.json({ error: fetchError.message }, { status: 500 })
    }

    if (!category) {
      return NextResponse.json({ error: "Category not found" }, { status: 404 })
    }

    if (category.is_protected) {
      return NextResponse.json(
        { error: "System categories cannot be deleted" },
        { status: 403 }
      )
    }

    const { error } = await supabase.from("event_categories").delete().eq("id", id)

    if (error) {
      console.error("Delete category error:", error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json({ message: "Category deleted successfully" })
  } catch (error) {
    console.error("DELETE category error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    )
  }
}
