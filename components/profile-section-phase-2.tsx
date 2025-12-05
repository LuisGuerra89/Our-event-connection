"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"

interface ProfileSectionPhase2Props {
  preferences: any
  attributes?: any
}

const relationshipTypeMap: Record<string, string> = {
  monogamous: "Monogamous Relationship",
  open_relationship: "Open Relationship",
  polyamorous: "Polyamorous",
  casual_dating: "Casual Dating",
  serious_long_term: "Serious Long-term Relationship",
  friendship_first: "Friendship First",
  not_sure: "Not Sure Yet",
  // Legacy values for backward compatibility
  dating: "Looking to Date",
  relationship: "Looking for Relationship",
  casual: "Casual Connection",
  friendship: "Just Friends",
}

export function ProfileSectionPhase2({ preferences, attributes }: ProfileSectionPhase2Props) {
  if (!preferences) return null

  const ageMin = preferences.age_min
  const ageMax = preferences.age_max
  const relationshipType = preferences.relationship_type_preference?.[0] || preferences.relationship_type
  const heightMin = preferences.height_min
  const heightMax = preferences.height_max

  // Check for comprehensive preferences
  const hasPhysicalPrefs = preferences.hair_color_importance !== 'open_to_all' || 
                          preferences.body_type_importance !== 'open_to_all' ||
                          preferences.eye_color_importance !== 'open_to_all'

  const hasLifestylePrefs = preferences.workout_importance !== 'open_to_all' ||
                           preferences.alcohol_importance !== 'open_to_all' ||
                           preferences.religion_importance !== 'open_to_all'

  const hasBasicData = ageMin || ageMax || relationshipType || heightMin || heightMax

  if (!hasBasicData && !hasPhysicalPrefs && !hasLifestylePrefs) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Looking For</CardTitle>
        <CardDescription>
          {preferences.questionnaire_completed 
            ? "Your comprehensive matching preferences"
            : "Your essential preferences"
          }
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-6">
          {/* Essential Preferences */}
          <div className="grid gap-4 md:grid-cols-2">
            {(ageMin || ageMax) && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Age Range</p>
                <Badge variant="outline" className="text-base py-2">
                  {ageMin || "18"} - {ageMax || "65"} years
                </Badge>
              </div>
            )}
            {relationshipType && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Relationship Type</p>
                <Badge variant="outline" className="text-base py-2">
                  {relationshipTypeMap[relationshipType] || relationshipType}
                </Badge>
              </div>
            )}
            {(heightMin || heightMax) && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Height Range</p>
                <Badge variant="outline" className="text-base py-2">
                  {heightMin || "140"} - {heightMax || "220"} cm
                </Badge>
              </div>
            )}
          </div>

          {/* Physical Preferences Summary */}
          {hasPhysicalPrefs && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Physical Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.hair_color_importance !== 'open_to_all' && preferences.hair_color_preference?.length > 0 && (
                    <Badge variant="secondary">
                      Hair: {preferences.hair_color_preference.join(", ")}
                    </Badge>
                  )}
                  {preferences.body_type_importance !== 'open_to_all' && preferences.body_type_preference?.length > 0 && (
                    <Badge variant="secondary">
                      Body: {preferences.body_type_preference.join(", ")}
                    </Badge>
                  )}
                  {preferences.eye_color_importance !== 'open_to_all' && preferences.eye_color_preference?.length > 0 && (
                    <Badge variant="secondary">
                      Eyes: {preferences.eye_color_preference.join(", ")}
                    </Badge>
                  )}
                  {preferences.race_importance !== 'open_to_all' && preferences.race_preference?.length > 0 && (
                    <Badge variant="secondary">
                      Ethnicity preferences set
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Lifestyle Preferences Summary */}
          {hasLifestylePrefs && (
            <>
              <Separator />
              <div>
                <h4 className="text-sm font-semibold mb-3">Lifestyle Preferences</h4>
                <div className="flex flex-wrap gap-2">
                  {preferences.workout_importance !== 'open_to_all' && (
                    <Badge variant="secondary">
                      Fitness: {preferences.workout_importance}
                    </Badge>
                  )}
                  {preferences.alcohol_importance !== 'open_to_all' && (
                    <Badge variant="secondary">
                      Alcohol: {preferences.alcohol_importance}
                    </Badge>
                  )}
                  {preferences.religion_importance !== 'open_to_all' && preferences.religion_preference?.length > 0 && (
                    <Badge variant="secondary">
                      Religion: {preferences.religion_preference.join(", ")}
                    </Badge>
                  )}
                  {preferences.marital_status_importance !== 'open_to_all' && preferences.marital_status_preference?.length > 0 && (
                    <Badge variant="secondary">
                      Status: {preferences.marital_status_preference.join(", ")}
                    </Badge>
                  )}
                </div>
              </div>
            </>
          )}

          {/* Questionnaire Status */}
          {!attributes?.questionnaire_completed && (
            <>
              <Separator />
              <div className="bg-muted/50 p-4 rounded-lg">
                <p className="text-sm text-muted-foreground">
                  💡 Complete the comprehensive questionnaire to improve your matching accuracy
                </p>
              </div>
            </>
          )}
        </div>
      </CardContent>
    </Card>
  )
}
