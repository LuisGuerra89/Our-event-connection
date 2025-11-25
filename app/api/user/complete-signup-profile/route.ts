/**
 * API Endpoint: Complete Signup Profile
 * POST /api/user/complete-signup-profile
 *
 * Saves the additional profile information collected during signup
 * (before the questionnaire)
 */

import { createServerClient } from "@supabase/ssr"
import { cookies } from "next/headers"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
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
              // Ignore set cookie errors on server-side rendering
            }
          },
        },
      }
    )

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser()

    if (authError || !user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const body = await request.json()

    // Update profiles table with basic information
    const { error: profileError } = await supabase
      .from("profiles")
      .update({
        first_name: body.firstName,
        last_name: body.lastName,
        phone: body.contactNumber,
        date_of_birth: body.dateOfBirth,
        location_city: body.city,
        location_state: body.state,
        location_country: body.country,
        address_1: body.address1,
        address_2: body.address2,
        zip_code: body.zipCode,
        weight: body.weight,
        updated_at: new Date().toISOString(),
      })
      .eq("id", user.id)

    if (profileError) {
      console.error("Profile update error:", profileError)
      return NextResponse.json(
        { error: "Failed to update profile", details: profileError.message },
        { status: 500 }
      )
    }

    // Upsert user_attributes with physical information
    const { error: attributesError } = await supabase
      .from("user_attributes")
      .upsert(
        {
          user_id: user.id,
          height: body.height,
          weight: body.weight,
          skin_tone: body.skinTone,
          hair_color: body.hairColor,
          occupation: body.occupation,
          hobbies: body.hobbies,
          updated_at: new Date().toISOString(),
        },
        { onConflict: "user_id" }
      )

    if (attributesError) {
      console.error("Attributes update error:", attributesError)
      return NextResponse.json(
        { error: "Failed to update attributes", details: attributesError.message },
        { status: 500 }
      )
    }

    return NextResponse.json(
      { success: true, message: "Profile information saved successfully" },
      { status: 200 }
    )
  } catch (error) {
    console.error("API error:", error)
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 }
    )
  }
}
