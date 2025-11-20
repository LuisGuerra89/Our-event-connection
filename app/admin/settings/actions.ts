"use server"

import { createServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export async function updateSiteSettings(formData: FormData) {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()
  if (!user) {
    return { error: "Unauthorized" }
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(role_name)")
    .eq("id", user.id)
    .single()

  // Check if user is admin
  const isAdmin = profile?.roles && typeof profile.roles === 'object' && 'role_name' in profile.roles 
    ? profile.roles.role_name === "admin" 
    : false

  if (!isAdmin) {
    return { error: "Unauthorized" }
  }

  const settings = [
    { key: "smtp_server", value: formData.get("smtp_server") as string },
    { key: "smtp_email", value: formData.get("smtp_email") as string },
    { key: "smtp_password", value: formData.get("smtp_password") as string },
    { key: "smtp_ssl", value: formData.get("smtp_ssl") === "on" ? "true" : "false" },
    { key: "site_url", value: formData.get("site_url") as string },
  ]

  for (const setting of settings) {
    const { error } = await supabase
      .from("site_settings")
      .update({ setting_value: setting.value, updated_at: new Date().toISOString() })
      .eq("setting_key", setting.key)

    if (error) {
      return { error: `Failed to update ${setting.key}: ${error.message}` }
    }
  }

  revalidatePath("/admin/settings")
  return { success: true }
}
