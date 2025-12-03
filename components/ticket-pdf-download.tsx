"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Download, Loader2 } from "lucide-react"
import jsPDF from "jspdf"

interface TicketPDFDownloadProps {
  eventId: string
  userId: string
  eventTitle: string
  eventDate: string
  eventTime: string
  eventLocation: string
  userName: string
  transactionId: string
}

export function TicketPDFDownload({
  eventId,
  userId,
  eventTitle,
  eventDate,
  eventTime,
  eventLocation,
  userName,
  transactionId
}: TicketPDFDownloadProps) {
  const [isGenerating, setIsGenerating] = useState(false)

  const generatePDF = async () => {
    setIsGenerating(true)
    try {
      // Create PDF with A4 size
      const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4"
      })

      const pageWidth = pdf.internal.pageSize.getWidth()
      const pageHeight = pdf.internal.pageSize.getHeight()
      const margin = 15
      const contentWidth = pageWidth - 2 * margin

      let yPosition = margin

      // Header with red background
      pdf.setFillColor(239, 68, 68) // Red #ef4444
      pdf.rect(0, 0, pageWidth, 40, "F")

      // Header text
      pdf.setTextColor(255, 255, 255)
      pdf.setFontSize(28)
      pdf.setFont("helvetica", "bold")
      pdf.text("EVENT TICKET", pageWidth / 2, 20, { align: "center" })

      pdf.setFontSize(10)
      pdf.setFont("helvetica", "normal")
      pdf.text("Our Love Connection", pageWidth / 2, 32, { align: "center" })

      yPosition = 55

      // Event title section with light red background
      pdf.setFillColor(254, 242, 242) // Light red background
      pdf.setDrawColor(239, 68, 68) // Red border
      pdf.setLineWidth(0.8)
      pdf.rect(margin, yPosition - 5, contentWidth, 40, "FD")

      pdf.setTextColor(31, 41, 55) // Dark gray
      pdf.setFontSize(18)
      pdf.setFont("helvetica", "bold")
      const titleLines = pdf.splitTextToSize(eventTitle, contentWidth - 6)
      pdf.text(titleLines, margin + 3, yPosition + 5)
      yPosition += 45

      // Event details in a structured format
      pdf.setTextColor(107, 114, 128) // Medium gray for labels
      pdf.setFontSize(9)
      pdf.setFont("helvetica", "bold")

      // Date & Time
      pdf.text("DATE & TIME", margin, yPosition)
      pdf.setTextColor(31, 41, 55)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      pdf.text(eventDate, margin, yPosition + 6)
      pdf.text(eventTime, margin, yPosition + 12)
      yPosition += 22

      // Location
      pdf.setTextColor(107, 114, 128)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      pdf.text("LOCATION", margin, yPosition)
      pdf.setTextColor(31, 41, 55)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(11)
      const locationLines = pdf.splitTextToSize(eventLocation, contentWidth - 6)
      pdf.text(locationLines, margin, yPosition + 6)
      yPosition += locationLines.length * 6 + 12

      // Divider line
      pdf.setDrawColor(229, 231, 235) // Light gray
      pdf.setLineWidth(0.5)
      pdf.line(margin, yPosition, pageWidth - margin, yPosition)
      yPosition += 8

      // Attendee name
      pdf.setTextColor(107, 114, 128)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      pdf.text("ATTENDEE NAME", margin, yPosition)
      pdf.setTextColor(31, 41, 55)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(14)
      pdf.text(userName, margin, yPosition + 7)
      yPosition += 18

      // Confirmation number box
      pdf.setFillColor(249, 250, 251) // Very light gray
      pdf.setDrawColor(229, 231, 235)
      pdf.setLineWidth(0.5)
      pdf.rect(margin, yPosition, contentWidth, 18, "FD")

      pdf.setTextColor(107, 114, 128)
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(8)
      pdf.text("CONFIRMATION #", margin + 3, yPosition + 5)

      pdf.setTextColor(239, 68, 68) // Red
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(10)
      pdf.text(transactionId, margin + 3, yPosition + 12)
      yPosition += 25

      // Important info section
      pdf.setFillColor(254, 243, 199) // Yellow background
      pdf.setDrawColor(245, 158, 11) // Orange border
      pdf.setLineWidth(0.5)
      pdf.rect(margin, yPosition, contentWidth, 40, "FD")

      pdf.setTextColor(146, 64, 14) // Dark yellow/brown
      pdf.setFont("helvetica", "bold")
      pdf.setFontSize(9)
      pdf.text("Important Information:", margin + 3, yPosition + 5)

      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(8)
      const infoText = [
        "• Arrive 15 minutes before event start time",
        "• Bring a valid ID for check-in",
        "• Show this ticket at the door",
        "• One ticket per person"
      ]
      let infoY = yPosition + 12
      infoText.forEach((line) => {
        pdf.text(line, margin + 3, infoY)
        infoY += 5
      })

      // Footer
      yPosition = pageHeight - 20
      pdf.setTextColor(107, 114, 128)
      pdf.setFont("helvetica", "normal")
      pdf.setFontSize(9)
      pdf.text("Thank you for registering with Our Love Connection!", pageWidth / 2, yPosition, {
        align: "center"
      })
      pdf.text("Keep this ticket safe for entry to the event.", pageWidth / 2, yPosition + 6, {
        align: "center"
      })

      // Download
      const fileName = `ticket-${eventId}-${new Date().getTime()}.pdf`
      pdf.save(fileName)
    } catch (error) {
      console.error("Error generating PDF:", error)
      alert("Error generating PDF. Please try again.")
    } finally {
      setIsGenerating(false)
    }
  }

  return (
    <Button 
      className="w-full" 
      size="lg" 
      variant="outline"
      onClick={generatePDF}
      disabled={isGenerating}
    >
      {isGenerating ? (
        <>
          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
          Generating PDF...
        </>
      ) : (
        <>
          <Download className="w-4 h-4 mr-2" />
          Download Ticket (PDF)
        </>
      )}
    </Button>
  )
}
