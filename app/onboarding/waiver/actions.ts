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

  console.log("[v0] Server Action - Form data:", {
    fullName,
    hasSignature: !!signature,
    signatureLength: signature?.length,
    agreed,
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
  revalidatePath("/onboarding/profile")

  await new Promise((resolve) => setTimeout(resolve, 100))

  console.log("[v0] Server Action - Redirecting to profile page")
  redirect("/onboarding/profile")
}
