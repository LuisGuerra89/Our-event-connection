"use client"

import React from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface ProfileSectionPhase2Props {
  preferences: any
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

export function ProfileSectionPhase2({ preferences }: ProfileSectionPhase2Props) {
  if (!preferences) return null

  const ageMin = preferences.age_min
  const ageMax = preferences.age_max
  const relationshipType = preferences.relationship_type_preference?.[0] || preferences.relationship_type

  const hasData = ageMin || ageMax || relationshipType

  if (!hasData) return null

  return (
    <Card>
      <CardHeader>
        <CardTitle>Looking For</CardTitle>
        <CardDescription>Your essential preferences</CardDescription>
      </CardHeader>
      <CardContent>
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
        </div>
      </CardContent>
    </Card>
  )
}
