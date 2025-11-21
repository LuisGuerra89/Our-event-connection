import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/user/profile
 * 
 * Returns current user's profile including referral info, free events, etc.
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Fetch user profile with all relevant data
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("*")
      .eq("id", user.id)
      .single()
    
    if (profileError) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }
    
    return NextResponse.json({
      id: profile.id,
      email: profile.email,
      full_name: profile.full_name,
      referral_code: profile.referral_code,
      referral_count: profile.referral_count,
      referred_by: profile.referred_by,
      free_events_earned: profile.free_events_earned,
      profile_image_url: profile.profile_image_url,
      created_at: profile.created_at,
      updated_at: profile.updated_at
    })
    
  } catch (error) {
    console.error("[API] Error fetching profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * PUT /api/user/profile
 * 
 * Update user profile (non-sensitive fields only)
 */
export async function PUT(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    const body = await request.json()
    
    // Only allow updating specific fields
    const allowedFields = [
      "full_name",
      "profile_image_url",
      "bio",
      "location_city",
      "location_state",
      "location_country",
      "gender",
      "date_of_birth"
    ]
    
    const updateData: Record<string, any> = {}
    for (const field of allowedFields) {
      if (field in body) {
        updateData[field] = body[field]
      }
    }
    
    if (Object.keys(updateData).length === 0) {
      return NextResponse.json(
        { error: "No valid fields to update" },
        { status: 400 }
      )
    }
    
    const { data: updatedProfile, error: updateError } = await supabase
      .from("profiles")
      .update(updateData)
      .eq("id", user.id)
      .select()
      .single()
    
    if (updateError) {
      return NextResponse.json(
        { error: "Failed to update profile" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      message: "Profile updated successfully",
      profile: updatedProfile
    })
    
  } catch (error) {
    console.error("[API] Error updating profile:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
