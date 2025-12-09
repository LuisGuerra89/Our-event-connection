"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Loader2, CheckCircle } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitContactForm } from "@/app/contact/actions"
import { Checkbox } from "@/components/ui/checkbox"

interface ContactFormClientProps {
  error?: string
}

export function ContactFormClient({ error }: ContactFormClientProps) {
  const [displayError, setDisplayError] = useState<string | undefined>(error)
  const [isLoading, setIsLoading] = useState(false)
  const [suggestEvent, setSuggestEvent] = useState(false)

  useEffect(() => {
    setDisplayError(error)
    if (error) {
      const timer = setTimeout(() => setDisplayError(undefined), 10000)
      return () => clearTimeout(timer)
    }
  }, [error])

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    try {
      const formData = new FormData(e.currentTarget)
      await submitContactForm(formData)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="space-y-6">
      {displayError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name" className="font-semibold">Name *</Label>
            <Input 
              id="name" 
              name="name" 
              required 
              disabled={isLoading}
              placeholder="Your full name"
              className="mt-2"
            />
          </div>
          <div>
            <Label htmlFor="email" className="font-semibold">Email *</Label>
            <Input 
              id="email" 
              name="email" 
              type="email" 
              required 
              disabled={isLoading}
              placeholder="your.email@example.com"
              className="mt-2"
            />
          </div>
        </div>

        <div>
          <Label htmlFor="subject" className="font-semibold">Subject</Label>
          <Input 
            id="subject" 
            name="subject" 
            disabled={isLoading}
            placeholder="How can we help you?"
            className="mt-2"
          />
        </div>

        <div>
          <Label htmlFor="message" className="font-semibold">Message *</Label>
          <Textarea 
            id="message" 
            name="message" 
            rows={6} 
            required 
            disabled={isLoading}
            placeholder="Please tell us more about your inquiry..."
            className="mt-2 resize-none"
          />
        </div>

        {/* Suggest Event Checkbox */}
        <div className="border rounded-lg p-4 bg-primary/5">
          <div className="flex items-center space-x-3">
            <Checkbox
              id="suggest-event"
              name="suggest_event"
              checked={suggestEvent}
              onCheckedChange={(checked) => setSuggestEvent(checked as boolean)}
              disabled={isLoading}
              className="h-5 w-5"
            />
            <Label htmlFor="suggest-event" className="flex-1 cursor-pointer font-medium">
              I'd like to suggest a future event idea
            </Label>
          </div>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-primary hover:bg-primary/90 text-white font-semibold py-6 text-base" 
          disabled={isLoading}
        >
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Sending..." : "Send Message"}
        </Button>

        {/* Response time message */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 flex gap-3">
          <CheckCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
          <div>
            <p className="font-semibold text-blue-900">We'll reply within 48 hours</p>
            <p className="text-sm text-blue-800 mt-1">
              Our team reviews all messages and will get back to you as soon as possible.
            </p>
          </div>
        </div>
      </form>
    </div>
  )
}
