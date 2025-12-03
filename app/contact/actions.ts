"use server"

import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import nodemailer from "nodemailer"
import { readFileSync } from "fs"
import { join } from "path"

async function getSMTPSettings() {
  const supabase = await createServerClient()
  const { data: settings } = await supabase
    .from("site_settings")
    .select("setting_key, setting_value")

  if (!settings) return null

  const smtpSettings: Record<string, string | null> = {}
  settings.forEach((s) => {
    smtpSettings[s.setting_key] = s.setting_value
  })

  // Auto-determine port based on SSL setting
  const isSSL = smtpSettings["smtp_ssl"] === "true"
  const smtpPort = isSSL ? 465 : 587

  return {
    host: smtpSettings["smtp_server"] || "",
    port: smtpPort,
    secure: isSSL,
    auth: {
      user: smtpSettings["smtp_email"] || "",
      pass: smtpSettings["smtp_password"] || "",
    },
    from_email: smtpSettings["smtp_email"] || "",
  }
}

function loadEmailTemplate(name: string, variables: Record<string, string>): string {
  const templatePath = join(process.cwd(), "email-templates", `${name}.html`)
  let template = readFileSync(templatePath, "utf-8")
  
  Object.entries(variables).forEach(([key, value]) => {
    template = template.replace(new RegExp(`{{${key}}}`, "g"), value)
  })
  
  return template
}

export async function submitContactForm(formData: FormData) {
  const supabase = await createServerClient()
  const name = formData.get("name") as string
  const email = formData.get("email") as string
  const subject = (formData.get("subject") as string) || "No Subject"
  const message = formData.get("message") as string

  // Rate limiting: Check if user has sent a message in the last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  const { data: recentSubmission } = await supabase
    .from("contact_submissions")
    .select("id")
    .eq("email", email)
    .gte("created_at", fiveMinutesAgo.toISOString())
    .limit(1)
    .single()

  if (recentSubmission) {
    redirect("/contact?error=Please wait at least 5 minutes before sending another message")
  }

  // Save to database
  const { error: insertError } = await supabase.from("contact_submissions").insert({
    name,
    email,
    subject,
    message,
    status: "new",
  })

  if (insertError) {
    console.error("Contact form error:", insertError)
    redirect("/contact?error=Failed to submit form")
  }

  // Send emails using SMTP settings
  try {
    const smtpSettings = await getSMTPSettings()
    
    if (!smtpSettings?.host || !smtpSettings?.auth?.user || !smtpSettings?.auth?.pass) {
      console.warn("SMTP settings incomplete, skipping email notification")
      redirect("/contact/success")
    }

    const transporter = nodemailer.createTransport({
      host: smtpSettings.host,
      port: smtpSettings.port,
      secure: smtpSettings.secure,
      auth: smtpSettings.auth,
      tls: {
        rejectUnauthorized: false,
      },
    })

    // Send email to admin
    await transporter.sendMail({
      from: smtpSettings.from_email,
      to: "admin@ourloveconnection.com",
      subject: `New Contact Form Submission: ${subject}`,
      html: `
        <h2>New Contact Form Submission</h2>
        <p><strong>From:</strong> ${name} (${email})</p>
        <p><strong>Subject:</strong> ${subject}</p>
        <p><strong>Message:</strong></p>
        <p>${message.replace(/\n/g, "<br>")}</p>
      `,
    })

    // Load and send confirmation email using template
    const confirmationTemplate = loadEmailTemplate("contact-confirmation-email", {
      USER_NAME: name,
      USER_MESSAGE: message,
    })

    await transporter.sendMail({
      from: smtpSettings.from_email,
      to: email,
      subject: "We received your message - Our Love Connection",
      html: confirmationTemplate,
    })
  } catch (emailError) {
    console.error("Email sending error:", emailError)
    // Don't fail the form submission if email fails
  }

  redirect("/contact/success")
}
