"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { User, MapPin, Heart } from "lucide-react"
import { useMemo } from "react"

interface UserWithAttributes {
  id: string
  display_name: string
  bio: string | null
  location_city: string | null
  location_state: string | null
  gender: string | null
  user_attributes: any
}

interface MatchListProps {
  users: UserWithAttributes[]
  preferences: any
}

export function MatchList({ users, preferences }: MatchListProps) {
  // Calculate match scores
  const matchedUsers = useMemo(() => {
    if (!preferences) return users.map((user) => ({ ...user, matchScore: 50 }))

    return users
      .map((user) => {
        let score = 0
        let totalImportant = 0

        const attrs = user.user_attributes
        if (!attrs) return { ...user, matchScore: 0 }

        // Check each preference
        const checks = [
          { pref: preferences.hair_color_importance, attr: attrs.hair_color },
          { pref: preferences.hair_length_importance, attr: attrs.hair_length },
          { pref: preferences.eye_color_importance, attr: attrs.eye_color },
          { pref: preferences.body_type_importance, attr: attrs.body_type },
          { pref: preferences.race_importance, attr: attrs.race },
          { pref: preferences.religion_importance, attr: attrs.religion },
        ]

        checks.forEach(({ pref, attr }) => {
          if (pref === "important" && attr) {
            totalImportant++
            score++
          } else if (pref === "open_to_all") {
            score += 0.5
          }
        })

        const matchScore = totalImportant > 0 ? Math.round((score / totalImportant) * 100) : 50
        return { ...user, matchScore }
      })
      .sort((a, b) => b.matchScore - a.matchScore)
  }, [users, preferences])

  if (matchedUsers.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-muted-foreground">No matches found yet. Check back later!</p>
      </div>
    )
  }

  return (
    <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
      {matchedUsers.map((user) => (
        <Card key={user.id} className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-3">
                  <User className="h-6 w-6 text-primary" />
                </div>
                <div>
                  <CardTitle className="text-xl">{user.display_name}</CardTitle>
                  {user.gender && <CardDescription className="capitalize">{user.gender}</CardDescription>}
                </div>
              </div>
              <Badge variant={user.matchScore >= 70 ? "default" : "secondary"}>
                <Heart className="h-3 w-3 mr-1" />
                {user.matchScore}%
              </Badge>
            </div>
          </CardHeader>

          <CardContent className="space-y-4">
            {user.bio && <p className="text-sm text-muted-foreground line-clamp-2">{user.bio}</p>}

            {(user.location_city || user.location_state) && (
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <MapPin className="h-4 w-4" />
                <span>
                  {user.location_city && user.location_state
                    ? `${user.location_city}, ${user.location_state}`
                    : user.location_city || user.location_state}
                </span>
              </div>
            )}

            {user.user_attributes && (
              <div className="flex flex-wrap gap-2">
                {user.user_attributes.hair_color && (
                  <Badge variant="outline" className="text-xs">
                    {user.user_attributes.hair_color}
                  </Badge>
                )}
                {user.user_attributes.eye_color && (
                  <Badge variant="outline" className="text-xs">
                    {user.user_attributes.eye_color} eyes
                  </Badge>
                )}
                {user.user_attributes.body_type && (
                  <Badge variant="outline" className="text-xs">
                    {user.user_attributes.body_type}
                  </Badge>
                )}
              </div>
            )}

            <Button className="w-full bg-transparent" variant="outline">
              View Profile
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
