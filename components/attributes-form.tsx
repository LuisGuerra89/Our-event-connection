"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

interface AttributesFormProps {
  userId: string
  existingAttributes: any
}

export function AttributesForm({ userId, existingAttributes }: AttributesFormProps) {
  const [formData, setFormData] = useState({
    hair_color: existingAttributes?.hair_color || null,
    hair_length: existingAttributes?.hair_length || null,
    eye_color: existingAttributes?.eye_color || null,
    complexion: existingAttributes?.complexion || null,
    body_type: existingAttributes?.body_type || null,
    height: existingAttributes?.height || "",
    race: existingAttributes?.race || null,
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const response = await fetch("/api/user/attributes", {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          physical: {
            hair_color: formData.hair_color,
            hair_length: formData.hair_length,
            eye_color: formData.eye_color,
            complexion: formData.complexion,
            body_type: formData.body_type,
            height: formData.height || null,
            race: formData.race,
          },
        }),
      })

      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || "Failed to save attributes")
      }

      router.push("/onboarding/complete-profile")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save attributes")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Attributes</CardTitle>
        <CardDescription>Help others find you by sharing your attributes</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid gap-4 grid-cols-1">
            <div className="grid gap-2">
              <Label htmlFor="hair_color">Hair Color</Label>
              <Select
                value={formData.hair_color || ""}
                onValueChange={(value) => setFormData({ ...formData, hair_color: value || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select hair color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="dark_brown">Dark Brown</SelectItem>
                  <SelectItem value="light_brown">Light Brown</SelectItem>
                  <SelectItem value="blonde">Blonde</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hair_length">Hair Length</Label>
              <Select
                value={formData.hair_length || ""}
                onValueChange={(value) => setFormData({ ...formData, hair_length: value || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select hair length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="very_short">Very Short</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="shoulder_length">Shoulder Length</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                  <SelectItem value="very_long">Very Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eye_color">Eye Color</Label>
              <Select
                value={formData.eye_color || ""}
                onValueChange={(value) => setFormData({ ...formData, eye_color: value || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select eye color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="amber">Amber</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="hazel">Hazel</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="complexion">Complexion</Label>
              <Select
                value={formData.complexion || ""}
                onValueChange={(value) => setFormData({ ...formData, complexion: value || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select complexion" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="fair">Fair</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="olive">Olive</SelectItem>
                  <SelectItem value="dark">Dark</SelectItem>
                  <SelectItem value="very_dark">Very Dark</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body_type">Body Type</Label>
              <Select
                value={formData.body_type || ""}
                onValueChange={(value) => setFormData({ ...formData, body_type: value || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="slim">Slim</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="curvy">Curvy</SelectItem>
                  <SelectItem value="muscular">Muscular</SelectItem>
                  <SelectItem value="plus_size">Plus Size</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="race">Race/Ethnicity</Label>
              <Select
                value={formData.race || ""}
                onValueChange={(value) => setFormData({ ...formData, race: value || null })}
              >
                <SelectTrigger className="w-full">
                  <SelectValue placeholder="Select race/ethnicity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="">Not specified</SelectItem>
                  <SelectItem value="white">White</SelectItem>
                  <SelectItem value="black_african_american">Black / African American</SelectItem>
                  <SelectItem value="hispanic_latino">Hispanic / Latino</SelectItem>
                  <SelectItem value="asian">Asian</SelectItem>
                  <SelectItem value="middle_eastern">Middle Eastern</SelectItem>
                  <SelectItem value="native_american">Native American</SelectItem>
                  <SelectItem value="pacific_islander">Pacific Islander</SelectItem>
                  <SelectItem value="mixed">Mixed</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                  <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="height">Height (cm)</Label>
              <Input
                id="height"
                type="number"
                value={formData.height}
                onChange={(e) => setFormData({ ...formData, height: e.target.value })}
                className="w-full"
              />
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Saving..." : "Continue to Preferences"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
