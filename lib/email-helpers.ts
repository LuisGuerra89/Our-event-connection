import { sendEmail } from "./email-service"

// Welcome Email (after successful registration)
export async function sendWelcomeEmail(to: string, firstName: string) {
  return sendEmail({
    to,
    templateName: "welcome_email",
    variables: {
      firstName,
    },
  })
}

// Password Changed Email
export async function sendPasswordChangedEmail(
  to: string,
  firstName: string,
  ipAddress: string = "Unknown"
) {
  return sendEmail({
    to,
    templateName: "password_changed",
    variables: {
      firstName,
      email: to,
      dateTime: new Date().toLocaleString(),
      ipAddress,
    },
  })
}

// Password Reset Email
export async function sendPasswordResetEmail(
  to: string,
  firstName: string,
  resetLink: string
) {
  return sendEmail({
    to,
    templateName: "password_reset",
    variables: {
      firstName,
      resetLink,
    },
  })
}

// Event Registration Confirmation
export async function sendEventRegistrationEmail(
  to: string,
  data: {
    firstName: string
    eventName: string
    eventDate: string
    eventTime: string
    eventLocation: string
    registrationId: string
    eventUrl: string
  }
) {
  return sendEmail({
    to,
    templateName: "event_registration",
    variables: data,
  })
}

// Match Notification
export async function sendMatchNotificationEmail(
  to: string,
  data: {
    firstName: string
    matchName: string
    compatibilityScore: string
    eventName: string
    matchUrl: string
  }
) {
  return sendEmail({
    to,
    templateName: "match_notification",
    variables: data,
  })
}

// Event Reminder (day before)
export async function sendEventReminderEmail(
  to: string,
  data: {
    firstName: string
    eventName: string
    eventDate: string
    eventTime: string
    eventLocation: string
    eventUrl: string
  }
) {
  return sendEmail({
    to,
    templateName: "event_reminder",
    variables: data,
  })
}

// Payment Receipt
export async function sendPaymentReceiptEmail(
  to: string,
  data: {
    firstName: string
    eventName: string
    transactionId: string
    paymentDate: string
    paymentMethod: string
    subtotal: string
    tax: string
    total: string
    receiptUrl: string
  }
) {
  return sendEmail({
    to,
    templateName: "payment_receipt",
    variables: data,
  })
}
