/**
 * API Endpoint: Update Basic User Information
 * PUT /api/user/basic-info
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              )
            } catch {
              // Ignore set cookie errors
            }
          },
        },
      }
    )

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update profiles table
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.contactNumber,
        weight: body.weight,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      return NextResponse.json(
        { error: "Failed to update profile", details: profileError.message },
        { status: 500 }
      )
    }

    // Update user_attributes table
    const { error: attributesError } = await supabase
      .from("user_attributes")
      .update({
        weight: body.weight,
        skin_tone: body.skinTone,
        occupation: body.occupation,
        hobbies: body.hobbies,
        updated_at: new Date().toISOString(),
      })
      .eq("user_id", user.id)

    if (attributesError) {
      return NextResponse.json(
        { error: "Failed to update attributes", details: attributesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json({ success: true }, { status: 200 })
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 }
    )
  }
}
