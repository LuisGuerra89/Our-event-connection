"use client"

import type React from "react"

import { useState, useRef } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { ScrollArea } from "@/components/ui/scroll-area"
import { AlertCircle } from "lucide-react"
import { submitWaiver } from "@/app/onboarding/waiver/actions"

interface WaiverFormProps {
  userId: string
  userEmail: string
}

export function WaiverForm({ userId, userEmail }: WaiverFormProps) {
  const [fullName, setFullName] = useState("")
  const [agreed, setAgreed] = useState(false)
  const [signature, setSignature] = useState("")
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const [isDrawing, setIsDrawing] = useState(false)

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    setIsDrawing(true)
    ctx.beginPath()
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top)
  }

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return

    const canvas = canvasRef.current
    if (!canvas) return

    const rect = canvas.getBoundingClientRect()
    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top)
    ctx.stroke()
  }

  const stopDrawing = () => {
    setIsDrawing(false)
    const canvas = canvasRef.current
    if (canvas) {
      setSignature(canvas.toDataURL())
    }
  }

  const clearSignature = () => {
    const canvas = canvasRef.current
    if (!canvas) return

    const ctx = canvas.getContext("2d")
    if (!ctx) return

    ctx.clearRect(0, 0, canvas.width, canvas.height)
    setSignature("")
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)

    console.log("[v0] Form - Submit started")

    if (!agreed) {
      setError("You must agree to the terms to continue")
      return
    }

    if (!signature) {
      setError("Please provide your signature")
      return
    }

    console.log("[v0] Form - Validation passed, calling server action")

    setIsLoading(true)

    const formData = new FormData()
    formData.append("fullName", fullName)
    formData.append("signature", signature)
    formData.append("agreed", agreed.toString())

    // Get profile image from sessionStorage if available
    const profileImageBase64 = typeof window !== "undefined" ? sessionStorage.getItem("pendingProfileImage") : null
    if (profileImageBase64) {
      try {
        // Convert base64 to blob and add to FormData
        const response = await fetch(profileImageBase64)
        const blob = await response.blob()
        formData.append("profileImage", blob, "profile.jpg")
        console.log("[v0] Form - Profile image from sessionStorage included as blob")
      } catch (e) {
        console.warn("[v0] Form - Could not convert image to blob:", e)
      }
    }

    console.log("[v0] Form - FormData prepared:", {
      fullName,
      hasSignature: !!signature,
      agreed,
      hasImage: !!profileImageBase64,
    })

    try {
      const result = await submitWaiver(formData)

      // If we get here with a result, it means there was an error
      if (result?.error) {
        setError(result.error)
        setIsLoading(false)
      }
      // If result is undefined or no error, the redirect happened successfully
    } catch (error) {
      // Network or other unexpected errors
      setError("An unexpected error occurred. Please try again.")
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Liability Waiver</CardTitle>
        <CardDescription>Please read and sign the waiver before attending events</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="rounded-lg border bg-muted/50 p-4">
            <div className="flex gap-2 mb-3">
              <AlertCircle className="h-5 w-5 text-muted-foreground flex-shrink-0 mt-0.5" />
              <p className="text-sm font-medium">Important Notice</p>
            </div>
            <ScrollArea className="h-64 w-full rounded-md border bg-background p-4">
              <div className="space-y-4 text-sm text-muted-foreground">
                <h3 className="font-semibold text-foreground">ASSUMPTION OF RISK AND WAIVER OF LIABILITY</h3>

                <p>
                  By signing this waiver, I acknowledge that participation in events organized through this platform
                  involves inherent risks, including but not limited to physical injury, emotional distress, property
                  damage, or other harm.
                </p>

                <p>
                  I voluntarily assume all risks associated with my participation in any event, whether such risks are
                  known or unknown, and whether they arise from the negligence of the organizers, other participants, or
                  any other cause.
                </p>

                <h4 className="font-semibold text-foreground mt-4">Release of Liability</h4>
                <p>
                  I hereby release, waive, discharge, and covenant not to sue the platform, its owners, operators, event
                  organizers, moderators, and all affiliated parties from any and all liability, claims, demands,
                  actions, or causes of action arising out of or related to any loss, damage, or injury that may be
                  sustained by me during participation in any event.
                </p>

                <h4 className="font-semibold text-foreground mt-4">Indemnification</h4>
                <p>
                  I agree to indemnify and hold harmless the platform and all affiliated parties from any loss,
                  liability, damage, or costs that may incur due to my participation in events, whether caused by
                  negligence or otherwise.
                </p>

                <h4 className="font-semibold text-foreground mt-4">Medical Treatment</h4>
                <p>
                  I authorize the platform and event organizers to obtain emergency medical treatment for me if
                  necessary, and I agree to be financially responsible for any costs incurred as a result of such
                  treatment.
                </p>

                <h4 className="font-semibold text-foreground mt-4">Acknowledgment</h4>
                <p>
                  I have read this waiver of liability, assumption of risk, and indemnity agreement, fully understand
                  its terms, and understand that I am giving up substantial rights, including my right to sue. I
                  acknowledge that I am signing this agreement freely and voluntarily.
                </p>
              </div>
            </ScrollArea>
          </div>

          <div className="space-y-4">
            <div className="grid gap-2">
              <Label htmlFor="fullName">Full Legal Name</Label>
              <Input
                id="fullName"
                type="text"
                placeholder="Enter your full legal name"
                required
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="email">Email Address</Label>
              <Input id="email" type="email" value={userEmail} disabled className="bg-muted" />
            </div>

            <div className="grid gap-2">
              <Label>Digital Signature</Label>
              <div className="border rounded-md bg-background">
                <canvas
                  ref={canvasRef}
                  width={600}
                  height={200}
                  className="w-full cursor-crosshair"
                  onMouseDown={startDrawing}
                  onMouseMove={draw}
                  onMouseUp={stopDrawing}
                  onMouseLeave={stopDrawing}
                />
              </div>
              <Button type="button" variant="outline" size="sm" onClick={clearSignature}>
                Clear Signature
              </Button>
            </div>

            <div className="flex items-start space-x-2">
              <Checkbox id="agree" checked={agreed} onCheckedChange={(checked) => setAgreed(checked as boolean)} />
              <label htmlFor="agree" className="text-sm leading-relaxed cursor-pointer">
                I have read, understood, and agree to the terms of this liability waiver. I acknowledge that I am
                signing this agreement freely and voluntarily.
              </label>
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Submitting..." : "Sign and Continue"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
