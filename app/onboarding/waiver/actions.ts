"use server"

import { redirect } from "next/navigation"
import { revalidatePath } from "next/cache"
import { createServerClient } from "@/lib/supabase/server"
import { createClient as createAdminClient } from "@supabase/supabase-js"

export async function submitWaiver(formData: FormData) {
  console.log("[v0] Server Action - submitWaiver called")

  const supabase = await createServerClient()

  const {
    data: { user },
    error: authError,
  } = await supabase.auth.getUser()

  console.log("[v0] Server Action - Auth check:", {
    hasUser: !!user,
    userId: user?.id,
    error: authError?.message,
  })

  if (authError || !user) {
    return { error: "Not authenticated" }
  }

  const fullName = formData.get("fullName") as string
  const signature = formData.get("signature") as string
  const agreed = formData.get("agreed") === "true"
  const profileImageFile = formData.get("profileImage") as File | null

  console.log("[v0] Server Action - Form data:", {
    fullName,
    hasSignature: !!signature,
    agreed,
    hasProfileImage: !!profileImageFile,
    imageSize: profileImageFile?.size,
  })

  if (!agreed) {
    return { error: "You must agree to the terms to continue" }
  }

  if (!signature) {
    return { error: "Please provide your signature" }
  }

  if (!fullName) {
    return { error: "Please provide your full name" }
  }

  console.log("[v0] Server Action - Checking if profile exists for user:", user.id)

  const { data: existingProfile, error: profileCheckError } = await supabase
    .from("profiles")
    .select("id")
    .eq("id", user.id)
    .maybeSingle()

  if (profileCheckError) {
    console.error("[v0] Server Action - Profile check error:", profileCheckError)
    return { error: "Failed to verify profile" }
  }

  if (!existingProfile) {
    console.log("[v0] Server Action - Profile not found, creating profile for user:", user.id)

    // Get the user role_id using admin client to bypass RLS
    const adminSupabase = createAdminClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || ""
    )

    const { data: userRole, error: roleError } = await adminSupabase
      .from("roles")
      .select("id")
      .eq("role_name", "user")
      .single()

    if (roleError || !userRole) {
      console.error("[v0] Server Action - Failed to find user role:", roleError)
      return { error: "Failed to find user role" }
    }

    // Get referral code from user metadata (if provided during signup)
    const referralCode = user.user_metadata?.referral_code as string | undefined
    console.log("[v0] Server Action - Referral code from metadata:", referralCode)

    // Create profile if it doesn't exist
    const { error: profileInsertError } = await supabase.from("profiles").insert({
      id: user.id,
      email: user.email!,
      full_name: fullName,
      role_id: userRole.id,
    })

    if (profileInsertError) {
      console.error("[v0] Server Action - Profile creation error:", profileInsertError)
      return { error: "Failed to create profile" }
    }

    console.log("[v0] Server Action - Profile created successfully")

    // Upload profile image if provided
    if (profileImageFile && profileImageFile.size > 0) {
      try {
        console.log("[v0] Server Action - Processing profile image from waiver")
        
        // Generate filename
        const fileName = `profile-images/${user.id}-${Date.now()}.jpg`
        
        // Upload to storage directly (File is already a Blob)
        const { error: uploadError } = await supabase.storage
          .from("profiles")
          .upload(fileName, profileImageFile, {
            cacheControl: "3600",
            upsert: false,
          })
        
        if (uploadError) {
          console.error("[v0] Server Action - Image upload error:", uploadError)
        } else {
          // Get public URL
          const { data: { publicUrl } } = supabase.storage
            .from("profiles")
            .getPublicUrl(fileName)
          
          console.log("[v0] Server Action - Public URL generated:", publicUrl.substring(0, 50) + "...")
          
          // Update profile with image URL
          const { error: updateError } = await supabase
            .from("profiles")
            .update({ profile_image_url: publicUrl })
            .eq("id", user.id)
          
          if (updateError) {
            console.error("[v0] Server Action - Error updating profile image URL:", updateError)
          } else {
            console.log("[v0] Server Action - Profile image uploaded successfully")
          }
        }
      } catch (imgError) {
        console.error("[v0] Server Action - Image processing error:", imgError)
        // Non-fatal - continue
      }
    }

    // Apply referral code if provided
    if (referralCode && referralCode.trim() !== "") {
      console.log("[v0] Server Action - Processing referral code:", referralCode)

      // Find the referrer
      const { data: referrer, error: referrerError } = await supabase
        .from("profiles")
        .select("id")
        .eq("referral_code", referralCode.toUpperCase())
        .maybeSingle()

      if (referrerError) {
        console.error("[v0] Server Action - Error finding referrer:", referrerError)
        // Non-fatal - continue with profile creation
      } else if (referrer) {
        console.log("[v0] Server Action - Found referrer:", referrer.id)

        // Update the new user's referred_by field
        // This will trigger the process_referral trigger
        const { error: updateError } = await supabase
          .from("profiles")
          .update({ referred_by: referrer.id })
          .eq("id", user.id)

        if (updateError) {
          console.error("[v0] Server Action - Error updating referred_by:", updateError)
          // Non-fatal - continue
        } else {
          console.log("[v0] Server Action - Referral processed successfully")
        }
      } else {
        console.log("[v0] Server Action - Referral code not found:", referralCode)
      }
    }
  } else {
    console.log("[v0] Server Action - Profile already exists")
  }

  console.log("[v0] Server Action - Attempting to insert waiver for user:", user.id)

  const { data: insertedWaiver, error: insertError } = await supabase
    .from("waivers")
    .insert({
      user_id: user.id,
      full_name: fullName,
      signature_data: signature,
      waiver_version: "1.0",
    })
    .select()
    .single()

  if (insertError) {
    console.error("[v0] Server Action - Insert error details:", {
      message: insertError.message,
      code: insertError.code,
      details: insertError.details,
      hint: insertError.hint,
      fullError: JSON.stringify(insertError, null, 2),
    })
    return { error: `Database error: ${insertError.message}` }
  }

  console.log("[v0] Server Action - Waiver inserted successfully:", insertedWaiver?.id)

  revalidatePath("/onboarding/waiver")
  revalidatePath("/onboarding/complete-signup-profile")
  revalidatePath("/dashboard") // Revalidate dashboard to update header with new image

  await new Promise((resolve) => setTimeout(resolve, 100))

  console.log("[v0] Server Action - Redirecting to complete signup profile")
  redirect("/onboarding/complete-signup-profile")
}
