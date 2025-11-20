"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"

export async function submitContactForm(formData: FormData) {
  const supabase = await createServerClient()

  const { error } = await supabase.from("contact_submissions").insert({
    name: formData.get("name") as string,
    email: formData.get("email") as string,
    subject: (formData.get("subject") as string) || null,
    message: formData.get("message") as string,
    status: "new",
  })

  if (error) {
    console.error("Contact form error:", error)
    return { error: error.message }
  }

  redirect("/contact/success")
}
