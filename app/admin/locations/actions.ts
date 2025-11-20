"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

// Country actions
export async function addCountry(formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("countries").insert({
    name: formData.get("name") as string,
    code: (formData.get("code") as string) || null,
    status: formData.get("status") === "on" ? "active" : "inactive",
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

export async function updateCountry(id: string, formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("countries")
    .update({
      name: formData.get("name") as string,
      code: (formData.get("code") as string) || null,
      status: formData.get("status") === "on" ? "active" : "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

export async function deleteCountry(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("countries").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

// State actions
export async function addState(formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("states").insert({
    country_id: formData.get("country_id") as string,
    name: formData.get("name") as string,
    code: (formData.get("code") as string) || null,
    status: formData.get("status") === "on" ? "active" : "inactive",
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

export async function updateState(id: string, formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("states")
    .update({
      country_id: formData.get("country_id") as string,
      name: formData.get("name") as string,
      code: (formData.get("code") as string) || null,
      status: formData.get("status") === "on" ? "active" : "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

export async function deleteState(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("states").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

// City actions
export async function addCity(formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("cities").insert({
    state_id: formData.get("state_id") as string,
    name: formData.get("name") as string,
    status: formData.get("status") === "on" ? "active" : "inactive",
  })

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

export async function updateCity(id: string, formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase
    .from("cities")
    .update({
      state_id: formData.get("state_id") as string,
      name: formData.get("name") as string,
      status: formData.get("status") === "on" ? "active" : "inactive",
      updated_at: new Date().toISOString(),
    })
    .eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}

export async function deleteCity(id: string) {
  const supabase = await createServerClient()
  const { error } = await supabase.from("cities").delete().eq("id", id)

  if (error) return { error: error.message }

  revalidatePath("/admin/locations")
  return { success: true }
}
