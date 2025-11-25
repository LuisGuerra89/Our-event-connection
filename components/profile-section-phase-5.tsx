"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProfileSectionPhase5Props {
  preferences: any
}

const importanceMap: Record<string, string> = {
  open_to_all: "🔓 Open to all",
  not_important: "Not important",
  somewhat_important: "Somewhat important",
  important: "Important",
  very_important: "⭐ Very important",
}

function PreferenceItem({
  label,
  importance,
  values,
}: {
  label: string
  importance?: string
  values?: any[]
}) {
  if (!importance || importance === "open_to_all") return null

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <p className="text-sm font-semibold">{label}</p>
        <Badge variant="secondary" className="text-xs">
          {importanceMap[importance] || importance}
        </Badge>
      </div>
      {values && values.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {values.map((v: any) => (
            <Badge key={v} variant="outline" className="text-xs">
              {typeof v === "string" ? v : v.toString()}
            </Badge>
          ))}
        </div>
      )}
    </div>
  )
}

export function ProfileSectionPhase5({ preferences }: ProfileSectionPhase5Props) {
  if (!preferences) return null

  const physicalPrefs = {
    hairColor: {
      importance: preferences.hair_color_importance,
      values: preferences.hair_color_preference,
    },
    hairLength: {
      importance: preferences.hair_length_importance,
      values: preferences.hair_length_preference,
    },
    eyeColor: {
      importance: preferences.eye_color_importance,
      values: preferences.eye_color_preference,
    },
    bodyType: {
      importance: preferences.body_type_importance,
      values: preferences.body_type_preference,
    },
    complexion: {
      importance: preferences.complexion_importance,
      values: preferences.complexion_preference,
    },
    race: {
      importance: preferences.race_importance,
      values: preferences.race_preference,
    },
    height: {
      importance: preferences.height_importance,
      min: preferences.height_min,
      max: preferences.height_max,
    },
  }

  const lifestylePrefs = {
    religion: {
      importance: preferences.religion_importance,
      values: preferences.religion_preference,
    },
    workout: {
      importance: preferences.workout_importance,
      values: preferences.workout_frequency_preference,
    },
    alcohol: {
      importance: preferences.alcohol_importance,
      values: preferences.alcohol_preference,
    },
    nightclub: {
      importance: preferences.nightclub_importance,
      values: preferences.nightclub_preference,
    },
  }

  const hasPhysicalPrefs = Object.values(physicalPrefs).some(
    (p) => p.importance && p.importance !== "open_to_all"
  )
  const hasLifestylePrefs = Object.values(lifestylePrefs).some(
    (p) => p.importance && p.importance !== "open_to_all"
  )

  if (!hasPhysicalPrefs && !hasLifestylePrefs) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Detailed Preferences</CardTitle>
        <CardDescription>What you're looking for in a partner</CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        {hasPhysicalPrefs && (
          <div className="space-y-4">
            <h3 className="font-semibold">Physical</h3>
            <div className="grid gap-4 md:grid-cols-2 pl-4 border-l-2 border-primary/20">
              <PreferenceItem
                label="Hair Color"
                importance={physicalPrefs.hairColor.importance}
                values={physicalPrefs.hairColor.values}
              />
              <PreferenceItem
                label="Hair Length"
                importance={physicalPrefs.hairLength.importance}
                values={physicalPrefs.hairLength.values}
              />
              <PreferenceItem
                label="Eye Color"
                importance={physicalPrefs.eyeColor.importance}
                values={physicalPrefs.eyeColor.values}
              />
              <PreferenceItem
                label="Body Type"
                importance={physicalPrefs.bodyType.importance}
                values={physicalPrefs.bodyType.values}
              />
              <PreferenceItem
                label="Complexion"
                importance={physicalPrefs.complexion.importance}
                values={physicalPrefs.complexion.values}
              />
              <PreferenceItem
                label="Race/Ethnicity"
                importance={physicalPrefs.race.importance}
                values={physicalPrefs.race.values}
              />
              {physicalPrefs.height.importance && physicalPrefs.height.importance !== "open_to_all" && (
                <PreferenceItem
                  label={`Height: ${physicalPrefs.height.min || "N/A"} - ${physicalPrefs.height.max || "N/A"} cm`}
                  importance={physicalPrefs.height.importance}
                />
              )}
            </div>
          </div>
        )}

        {hasLifestylePrefs && (
          <div className="space-y-4">
            <h3 className="font-semibold">Lifestyle</h3>
            <div className="grid gap-4 md:grid-cols-2 pl-4 border-l-2 border-primary/20">
              <PreferenceItem
                label="Religion"
                importance={lifestylePrefs.religion.importance}
                values={lifestylePrefs.religion.values}
              />
              <PreferenceItem
                label="Workout Frequency"
                importance={lifestylePrefs.workout.importance}
                values={lifestylePrefs.workout.values}
              />
              <PreferenceItem
                label="Alcohol Consumption"
                importance={lifestylePrefs.alcohol.importance}
                values={lifestylePrefs.alcohol.values}
              />
              <PreferenceItem
                label="Nightclub/Bars"
                importance={lifestylePrefs.nightclub.importance}
                values={lifestylePrefs.nightclub.values}
              />
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
