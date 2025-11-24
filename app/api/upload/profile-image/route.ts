import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()

    // Get authenticated user
    const { data } = await supabase.auth.getUser()
    if (!data?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const formData = await request.formData()
    const file = formData.get("file") as File

    if (!file) {
      return NextResponse.json({ error: "No file provided" }, { status: 400 })
    }

    // Validate file type
    if (!file.type.startsWith("image/")) {
      return NextResponse.json({ error: "File must be an image" }, { status: 400 })
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      return NextResponse.json({ error: "File size must be less than 5MB" }, { status: 400 })
    }

    // Create unique filename
    const fileExtension = file.name.split(".").pop()
    const fileName = `${data.user.id}-${Date.now()}.${fileExtension}`
    const filePath = `profile-images/${fileName}`

    // Upload file to Supabase Storage
    const { error: uploadError, data: uploadData } = await supabase.storage
      .from("profiles")
      .upload(filePath, file, {
        cacheControl: "3600",
        upsert: false,
      })

    if (uploadError) {
      console.error("Upload error:", uploadError)
      return NextResponse.json({ error: "Failed to upload image" }, { status: 500 })
    }

    // Get public URL
    const {
      data: { publicUrl },
    } = supabase.storage.from("profiles").getPublicUrl(filePath)

    // Update profile with image URL
    const { error: updateError } = await supabase
      .from("profiles")
      .update({ profile_image_url: publicUrl })
      .eq("id", data.user.id)

    if (updateError) {
      console.error("Update error:", updateError)
      return NextResponse.json({ error: "Failed to update profile" }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      url: publicUrl,
      message: "Profile image uploaded successfully",
    })
  } catch (error) {
    console.error("Upload profile image error:", error)
    return NextResponse.json({ error: "Internal server error" }, { status: 500 })
  }
}
