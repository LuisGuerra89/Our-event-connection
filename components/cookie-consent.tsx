"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Switch } from "@/components/ui/switch"
import { Label } from "@/components/ui/label"
import { Cookie, Settings, X } from "lucide-react"
import Link from "next/link"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"

interface CookiePreferences {
  essential: boolean
  functional: boolean
  analytics: boolean
  marketing: boolean
}

const COOKIE_CONSENT_KEY = "cookie_consent"
const COOKIE_PREFERENCES_KEY = "cookie_preferences"

export function CookieConsent() {
  const [showBanner, setShowBanner] = useState(false)
  const [showSettings, setShowSettings] = useState(false)
  const [preferences, setPreferences] = useState<CookiePreferences>({
    essential: true, // Always true, cannot be disabled
    functional: true,
    analytics: true,
    marketing: false,
  })

  useEffect(() => {
    // Check if user has already made a choice
    const consent = localStorage.getItem(COOKIE_CONSENT_KEY)
    if (!consent) {
      // Small delay to avoid layout shift on page load
      const timer = setTimeout(() => setShowBanner(true), 1000)
      return () => clearTimeout(timer)
    } else {
      // Load saved preferences
      const savedPreferences = localStorage.getItem(COOKIE_PREFERENCES_KEY)
      if (savedPreferences) {
        setPreferences(JSON.parse(savedPreferences))
      }
    }
  }, [])

  const saveConsent = (acceptAll: boolean) => {
    const newPreferences: CookiePreferences = acceptAll
      ? { essential: true, functional: true, analytics: true, marketing: true }
      : preferences

    localStorage.setItem(COOKIE_CONSENT_KEY, "true")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(newPreferences))
    setPreferences(newPreferences)
    setShowBanner(false)
    setShowSettings(false)

    // Here you would typically initialize or disable tracking based on preferences
    // For example:
    // if (newPreferences.analytics) {
    //   initializeAnalytics()
    // }
  }

  const handleRejectAll = () => {
    const minimalPreferences: CookiePreferences = {
      essential: true,
      functional: false,
      analytics: false,
      marketing: false,
    }
    localStorage.setItem(COOKIE_CONSENT_KEY, "true")
    localStorage.setItem(COOKIE_PREFERENCES_KEY, JSON.stringify(minimalPreferences))
    setPreferences(minimalPreferences)
    setShowBanner(false)
  }

  const handlePreferenceChange = (key: keyof CookiePreferences, value: boolean) => {
    if (key === "essential") return // Cannot disable essential cookies
    setPreferences(prev => ({ ...prev, [key]: value }))
  }

  if (!showBanner) return null

  return (
    <>
      {/* Main Cookie Banner */}
      <div className="fixed bottom-0 left-0 right-0 z-50 p-4 animate-in slide-in-from-bottom-5 duration-500">
        <Card className="max-w-4xl mx-auto shadow-lg border-2">
          <CardContent className="p-4 md:p-6">
            <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
              {/* Icon and Text */}
              <div className="flex items-start gap-3 flex-1">
                <div className="p-2 bg-primary/10 rounded-lg text-primary flex-shrink-0">
                  <Cookie className="h-5 w-5" />
                </div>
                <div className="space-y-1">
                  <h3 className="font-semibold text-sm md:text-base">We use cookies 🍪</h3>
                  <p className="text-xs md:text-sm text-muted-foreground">
                    We use cookies to enhance your browsing experience, analyze site traffic, and personalize content. 
                    By clicking "Accept All", you consent to our use of cookies.{" "}
                    <Link href="/cookies" className="text-primary hover:underline">
                      Learn more
                    </Link>
                  </p>
                </div>
              </div>

              {/* Buttons */}
              <div className="flex flex-wrap gap-2 w-full md:w-auto">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleRejectAll}
                  className="flex-1 md:flex-none"
                >
                  Reject All
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setShowSettings(true)}
                  className="flex-1 md:flex-none"
                >
                  <Settings className="h-4 w-4 mr-1" />
                  Customize
                </Button>
                <Button
                  size="sm"
                  onClick={() => saveConsent(true)}
                  className="flex-1 md:flex-none"
                >
                  Accept All
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Cookie Settings Dialog */}
      <Dialog open={showSettings} onOpenChange={setShowSettings}>
        <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Cookie className="h-5 w-5 text-primary" />
              Cookie Preferences
            </DialogTitle>
            <DialogDescription>
              Manage your cookie preferences. Essential cookies cannot be disabled as they are 
              required for the website to function properly.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 py-4">
            {/* Essential Cookies */}
            <div className="flex items-center justify-between p-4 bg-muted/50 rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">Essential Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Required for the website to function. Cannot be disabled.
                </p>
              </div>
              <Switch checked={true} disabled />
            </div>

            {/* Functional Cookies */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">Functional Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Remember your preferences like theme and language.
                </p>
              </div>
              <Switch
                checked={preferences.functional}
                onCheckedChange={(checked) => handlePreferenceChange("functional", checked)}
              />
            </div>

            {/* Analytics Cookies */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">Analytics Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Help us understand how visitors use our website.
                </p>
              </div>
              <Switch
                checked={preferences.analytics}
                onCheckedChange={(checked) => handlePreferenceChange("analytics", checked)}
              />
            </div>

            {/* Marketing Cookies */}
            <div className="flex items-center justify-between p-4 border rounded-lg">
              <div className="space-y-1">
                <Label className="font-medium">Marketing Cookies</Label>
                <p className="text-xs text-muted-foreground">
                  Used to deliver relevant advertisements.
                </p>
              </div>
              <Switch
                checked={preferences.marketing}
                onCheckedChange={(checked) => handlePreferenceChange("marketing", checked)}
              />
            </div>
          </div>

          <div className="flex gap-2 justify-end">
            <Button variant="outline" onClick={handleRejectAll}>
              Reject All
            </Button>
            <Button onClick={() => saveConsent(false)}>
              Save Preferences
            </Button>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Read our full{" "}
            <Link href="/cookies" className="text-primary hover:underline" onClick={() => setShowSettings(false)}>
              Cookie Policy
            </Link>
          </p>
        </DialogContent>
      </Dialog>
    </>
  )
}

// Export a function to reset consent (useful for footer link)
export function resetCookieConsent() {
  if (typeof window !== "undefined") {
    localStorage.removeItem(COOKIE_CONSENT_KEY)
    window.location.reload()
  }
}
