"use server"

import { createServerClient } from "@/lib/supabase/server"
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

interface PaymentEmailData {
  userEmail: string
  userName: string
  eventTitle: string
  eventDate: string
  eventLocation: string
  baseAmount: number
  taxAmount: number
  discountAmount: number
  totalAmount: number
  transactionId: string
  isCouponPayment: boolean
}

export async function sendPaymentConfirmationEmail(data: PaymentEmailData) {
  try {
    const smtpSettings = await getSMTPSettings()
    
    if (!smtpSettings?.host || !smtpSettings?.auth?.user || !smtpSettings?.auth?.pass) {
      console.warn("SMTP settings incomplete, skipping payment email notification")
      return { success: true, emailSent: false }
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

    // Prepare email variables
    const variables: Record<string, string> = {
      USER_NAME: data.userName,
      EVENT_TITLE: data.eventTitle,
      EVENT_DATE: data.eventDate,
      EVENT_LOCATION: data.eventLocation,
      TRANSACTION_ID: data.transactionId,
      WEBSITE_URL: process.env.NEXT_PUBLIC_BASE_URL || "https://ourloveconnection.com",
      TICKET_TYPE: data.isCouponPayment ? "Free Ticket Claimed!" : "Payment Confirmed",
      TICKET_MESSAGE: data.isCouponPayment 
        ? `Congratulations! Your free ticket has been successfully claimed using your referral reward coupon. You're all set to attend <strong>${data.eventTitle}</strong>!`
        : `Thank you for your purchase! Your ticket for <strong>${data.eventTitle}</strong> has been confirmed. Your payment has been processed successfully.`,
      BASE_AMOUNT: `$${data.baseAmount.toFixed(2)}`,
      SERVICE_FEE_ROW: !data.isCouponPayment && data.taxAmount > 0
        ? `<div class="pricing-row"><span>Service Fee</span><span>$${data.taxAmount.toFixed(2)}</span></div>`
        : "",
      DISCOUNT_ROW: data.discountAmount > 0
        ? `<div class="pricing-row discount"><span>Discount (Coupon)</span><span class="amount">-$${data.discountAmount.toFixed(2)}</span></div>`
        : "",
      TOTAL_AMOUNT: `$${data.totalAmount.toFixed(2)}`,
    }

    const confirmationTemplate = loadEmailTemplate("payment-confirmation-email", variables)

    await transporter.sendMail({
      from: smtpSettings.from_email,
      to: data.userEmail,
      subject: data.isCouponPayment 
        ? "Free Ticket Claimed - Our Love Connection"
        : "Payment Confirmation - Our Love Connection",
      html: confirmationTemplate,
    })

    return { success: true, emailSent: true }
  } catch (error) {
    console.error("Payment confirmation email error:", error)
    // Don't throw, just log and return success to not interrupt payment flow
    return { success: true, emailSent: false }
  }
}
