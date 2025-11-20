"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Separator } from "@/components/ui/separator"

interface PreferencesFormProps {
  userId: string
  existingPreferences: any
}

type ImportanceLevel = "important" | "not_important" | "open_to_all"

export function PreferencesForm({ userId, existingPreferences }: PreferencesFormProps) {
  const [preferences, setPreferences] = useState({
    hair_color_importance: (existingPreferences?.hair_color_importance || "open_to_all") as ImportanceLevel,
    hair_length_importance: (existingPreferences?.hair_length_importance || "open_to_all") as ImportanceLevel,
    eye_color_importance: (existingPreferences?.eye_color_importance || "open_to_all") as ImportanceLevel,
    body_type_importance: (existingPreferences?.body_type_importance || "open_to_all") as ImportanceLevel,
    height_importance: (existingPreferences?.height_importance || "open_to_all") as ImportanceLevel,
    age_importance: (existingPreferences?.age_importance || "open_to_all") as ImportanceLevel,
    race_importance: (existingPreferences?.race_importance || "open_to_all") as ImportanceLevel,
    religion_importance: (existingPreferences?.religion_importance || "open_to_all") as ImportanceLevel,
    sports_hobbies_importance: (existingPreferences?.sports_hobbies_importance || "open_to_all") as ImportanceLevel,
    food_importance: (existingPreferences?.food_importance || "open_to_all") as ImportanceLevel,
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

      if (existingPreferences) {
        const { error: updateError } = await supabase.from("user_preferences").update(preferences).eq("user_id", userId)
        if (updateError) throw updateError
      } else {
        const { error: insertError } = await supabase
          .from("user_preferences")
          .insert({ ...preferences, user_id: userId })
        if (insertError) throw insertError
      }

      router.push("/dashboard")
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to save preferences")
    } finally {
      setIsLoading(false)
    }
  }

  const PreferenceItem = ({ label, field }: { label: string; field: keyof typeof preferences }) => (
    <div className="space-y-3">
      <Label className="text-base font-medium">{label}</Label>
      <RadioGroup
        value={preferences[field]}
        onValueChange={(value) => setPreferences({ ...preferences, [field]: value as ImportanceLevel })}
        className="flex gap-4"
      >
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="important" id={`${field}-important`} />
          <Label htmlFor={`${field}-important`} className="font-normal cursor-pointer">
            Important
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="not_important" id={`${field}-not-important`} />
          <Label htmlFor={`${field}-not-important`} className="font-normal cursor-pointer">
            Not Important
          </Label>
        </div>
        <div className="flex items-center space-x-2">
          <RadioGroupItem value="open_to_all" id={`${field}-open`} />
          <Label htmlFor={`${field}-open`} className="font-normal cursor-pointer">
            Open to All
          </Label>
        </div>
      </RadioGroup>
    </div>
  )

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-2xl">Your Matching Preferences</CardTitle>
        <CardDescription>
          Tell us what matters to you in a potential match. This helps us find compatible connections.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-8">
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-semibold mb-4">Physical Attributes</h3>
              <div className="space-y-6">
                <PreferenceItem label="Hair Color" field="hair_color_importance" />
                <Separator />
                <PreferenceItem label="Hair Length" field="hair_length_importance" />
                <Separator />
                <PreferenceItem label="Eye Color" field="eye_color_importance" />
                <Separator />
                <PreferenceItem label="Body Type" field="body_type_importance" />
                <Separator />
                <PreferenceItem label="Height" field="height_importance" />
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <h3 className="text-lg font-semibold mb-4">Demographics</h3>
              <div className="space-y-6">
                <PreferenceItem label="Age" field="age_importance" />
                <Separator />
                <PreferenceItem label="Race/Ethnicity" field="race_importance" />
                <Separator />
                <PreferenceItem label="Religion" field="religion_importance" />
              </div>
            </div>

            <Separator className="my-8" />

            <div>
              <h3 className="text-lg font-semibold mb-4">Interests & Lifestyle</h3>
              <div className="space-y-6">
                <PreferenceItem label="Sports & Hobbies" field="sports_hobbies_importance" />
                <Separator />
                <PreferenceItem label="Food Preferences" field="food_importance" />
              </div>
            </div>
          </div>

          {error && <div className="rounded-md bg-destructive/10 p-3 text-sm text-destructive">{error}</div>}

          <Button type="submit" className="w-full" size="lg" disabled={isLoading}>
            {isLoading ? "Saving..." : "Complete Setup"}
          </Button>
        </form>
      </CardContent>
    </Card>
  )
}
