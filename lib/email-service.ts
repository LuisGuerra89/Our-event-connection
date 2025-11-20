import nodemailer from "nodemailer"
import { createClient } from "@supabase/supabase-js"

// Supabase client with service role
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!,
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  }
)

interface EmailOptions {
  to: string
  templateName: string
  variables: Record<string, string>
}

interface SiteSettings {
  smtp_server: string
  smtp_email: string
  smtp_password: string
  smtp_ssl: string
  site_url: string
}

// Get SMTP configuration from site_settings
async function getSMTPConfig(): Promise<SiteSettings> {
  const { data: settings } = await supabaseAdmin
    .from("site_settings")
    .select("setting_key, setting_value")
    .in("setting_key", ["smtp_server", "smtp_email", "smtp_password", "smtp_ssl", "site_url"])

  if (!settings || settings.length === 0) {
    throw new Error("SMTP settings not found in database")
  }

  const config: any = {}
  settings.forEach((setting) => {
    config[setting.setting_key] = setting.setting_value
  })

  // Validate required settings
  if (!config.smtp_server || !config.smtp_email || !config.smtp_password) {
    throw new Error("Missing required SMTP configuration")
  }

  return config as SiteSettings
}

// Create nodemailer transporter with database settings
async function createTransporter() {
  const config = await getSMTPConfig()

  return nodemailer.createTransport({
    host: config.smtp_server,
    port: config.smtp_ssl === "true" ? 465 : 587,
    secure: config.smtp_ssl === "true", // true for 465, false for other ports
    auth: {
      user: config.smtp_email,
      pass: config.smtp_password,
    },
  })
}

// Get email template from database
async function getEmailTemplate(templateName: string) {
  const { data: template, error } = await supabaseAdmin
    .from("email_templates")
    .select("*")
    .eq("template_name", templateName)
    .eq("status", "active")
    .single()

  if (error || !template) {
    throw new Error(`Email template '${templateName}' not found or inactive`)
  }

  return template
}

// Replace variables in template content
function replaceVariables(content: string, variables: Record<string, string>): string {
  let result = content

  // Add default variables
  const defaultVars = {
    year: new Date().getFullYear().toString(),
    ...variables,
  }

  // Replace all {{variable}} with actual values
  Object.entries(defaultVars).forEach(([key, value]) => {
    const regex = new RegExp(`{{${key}}}`, "g")
    result = result.replace(regex, value || "")
  })

  return result
}

// Main function to send email
export async function sendEmail({ to, templateName, variables }: EmailOptions) {
  try {
    // Get SMTP config and email template
    const [transporter, template, config] = await Promise.all([
      createTransporter(),
      getEmailTemplate(templateName),
      getSMTPConfig(),
    ])

    // Add site URL to variables if not provided
    if (!variables.siteUrl && config.site_url) {
      variables.siteUrl = config.site_url
    }

    // Replace variables in subject and content
    const subject = replaceVariables(template.subject, variables)
    const html = replaceVariables(template.content, variables)

    // Send email
    const info = await transporter.sendMail({
      from: `"EventMatch" <${config.smtp_email}>`,
      to,
      subject,
      html,
    })

    console.log("Email sent successfully:", info.messageId)
    return { success: true, messageId: info.messageId }
  } catch (error) {
    console.error("Error sending email:", error)
    throw error
  }
}

// Send multiple emails (batch)
export async function sendBatchEmails(emails: EmailOptions[]) {
  const results = await Promise.allSettled(
    emails.map((emailOptions) => sendEmail(emailOptions))
  )

  const successful = results.filter((r) => r.status === "fulfilled").length
  const failed = results.filter((r) => r.status === "rejected").length

  return {
    total: emails.length,
    successful,
    failed,
    results,
  }
}

// Test SMTP connection
export async function testSMTPConnection() {
  try {
    const transporter = await createTransporter()
    await transporter.verify()
    return { success: true, message: "SMTP connection successful" }
  } catch (error) {
    console.error("SMTP connection test failed:", error)
    return {
      success: false,
      message: error instanceof Error ? error.message : "Connection failed",
    }
  }
}
