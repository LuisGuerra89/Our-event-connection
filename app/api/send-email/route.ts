import { NextResponse } from "next/server"
import { sendEmail } from "@/lib/email-service"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { to, templateName, variables } = body

    // Validate required fields
    if (!to || !templateName) {
      return NextResponse.json(
        { error: "Missing required fields: to, templateName" },
        { status: 400 }
      )
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(to)) {
      return NextResponse.json({ error: "Invalid email address" }, { status: 400 })
    }

    // Send email
    const result = await sendEmail({
      to,
      templateName,
      variables: variables || {},
    })

    return NextResponse.json({
      success: true,
      message: "Email sent successfully",
      messageId: result.messageId,
    })
  } catch (error) {
    console.error("Error in send-email API:", error)
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : "Failed to send email",
      },
      { status: 500 }
    )
  }
}
