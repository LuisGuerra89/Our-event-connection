"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
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
    hair_color: existingAttributes?.hair_color || "",
    hair_length: existingAttributes?.hair_length || "",
    eye_color: existingAttributes?.eye_color || "",
    body_type: existingAttributes?.body_type || "",
    height: existingAttributes?.height || "",
    race: existingAttributes?.race || "",
    religion: existingAttributes?.religion || "",
  })
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setError(null)

    try {
      const supabase = createClient()

      if (existingAttributes) {
        const { error: updateError } = await supabase.from("user_attributes").update(formData).eq("user_id", userId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase.from("user_attributes").insert({ ...formData, user_id: userId })
        if (insertError) throw insertError
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
          <div className="grid gap-4 md:grid-cols-2">
            <div className="grid gap-2">
              <Label htmlFor="hair_color">Hair Color</Label>
              <Select
                value={formData.hair_color}
                onValueChange={(value) => setFormData({ ...formData, hair_color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hair color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="black">Black</SelectItem>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="blonde">Blonde</SelectItem>
                  <SelectItem value="red">Red</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="hair_length">Hair Length</Label>
              <Select
                value={formData.hair_length}
                onValueChange={(value) => setFormData({ ...formData, hair_length: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select hair length" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="bald">Bald</SelectItem>
                  <SelectItem value="short">Short</SelectItem>
                  <SelectItem value="medium">Medium</SelectItem>
                  <SelectItem value="long">Long</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="eye_color">Eye Color</Label>
              <Select
                value={formData.eye_color}
                onValueChange={(value) => setFormData({ ...formData, eye_color: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select eye color" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="brown">Brown</SelectItem>
                  <SelectItem value="blue">Blue</SelectItem>
                  <SelectItem value="green">Green</SelectItem>
                  <SelectItem value="hazel">Hazel</SelectItem>
                  <SelectItem value="gray">Gray</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="grid gap-2">
              <Label htmlFor="body_type">Body Type</Label>
              <Select
                value={formData.body_type}
                onValueChange={(value) => setFormData({ ...formData, body_type: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select body type" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="slim">Slim</SelectItem>
                  <SelectItem value="athletic">Athletic</SelectItem>
                  <SelectItem value="average">Average</SelectItem>
                  <SelectItem value="curvy">Curvy</SelectItem>
                  <SelectItem value="heavyset">Heavyset</SelectItem>
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
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="race">Race/Ethnicity</Label>
              <Input
                id="race"
                type="text"
                value={formData.race}
                onChange={(e) => setFormData({ ...formData, race: e.target.value })}
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="religion">Religion</Label>
              <Input
                id="religion"
                type="text"
                value={formData.religion}
                onChange={(e) => setFormData({ ...formData, religion: e.target.value })}
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
