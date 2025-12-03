"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { AlertCircle, Info, Loader2 } from "lucide-react"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { submitContactForm } from "@/app/contact/actions"

interface ContactFormWrapperProps {
  error?: string
}

export function ContactFormWrapper({ error }: ContactFormWrapperProps) {
  const [displayError, setDisplayError] = useState(error)
  const [isLoading, setIsLoading] = useState(false)

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
    <div>
      {displayError && (
        <Alert variant="destructive" className="mb-4">
          <AlertCircle className="h-4 w-4" />
          <AlertDescription>{displayError}</AlertDescription>
        </Alert>
      )}

      <Alert className="mb-6 border-blue-200 bg-blue-50 dark:border-blue-900 dark:bg-blue-950">
        <Info className="h-4 w-4 text-blue-600 dark:text-blue-400" />
        <AlertDescription className="text-blue-800 dark:text-blue-200">
          To prevent spam, you can only send one message every 5 minutes. Please wait before sending another message.
        </AlertDescription>
      </Alert>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="name">Name *</Label>
            <Input id="name" name="name" required disabled={isLoading} />
          </div>
          <div>
            <Label htmlFor="email">Email *</Label>
            <Input id="email" name="email" type="email" required disabled={isLoading} />
          </div>
        </div>
        <div>
          <Label htmlFor="subject">Subject</Label>
          <Input id="subject" name="subject" disabled={isLoading} />
        </div>
        <div>
          <Label htmlFor="message">Message *</Label>
          <Textarea id="message" name="message" rows={6} required disabled={isLoading} />
        </div>
        <Button type="submit" className="w-full" disabled={isLoading}>
          {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isLoading ? "Sending..." : "Send Message"}
        </Button>
      </form>
    </div>
  )
}
