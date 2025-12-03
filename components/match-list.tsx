"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { User, MapPin, Heart } from "lucide-react"
import { useMemo, useState } from "react"
import { useRouter } from "next/navigation"

interface UserWithAttributes {
  id: string
  display_name: string
  bio: string | null
  location_city: string | null
  location_state: string | null
  gender: string | null
  profile_image_url: string | null
  user_attributes: any
}

interface MatchListProps {
  users: UserWithAttributes[]
  preferences: any
}

export function MatchList({ users, preferences }: MatchListProps) {
  const router = useRouter()
  const [viewingProfile, setViewingProfile] = useState<string | null>(null)

  const handleViewProfile = (userId: string) => {
    setViewingProfile(userId)
    router.push(`/dashboard/matches/${userId}`)
  }

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
        <Card key={user.id} className="hover:shadow-lg transition-shadow overflow-hidden flex flex-col">
          {/* Profile Image Header */}
          {user.profile_image_url ? (
            <div className="relative h-48 w-full bg-muted overflow-hidden">
              <img
                src={user.profile_image_url}
                alt={user.display_name}
                className="w-full h-full object-cover"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              <div className="absolute top-3 right-3">
                <Badge variant={user.matchScore >= 70 ? "default" : "secondary"}>
                  <Heart className="h-3 w-3 mr-1" />
                  {user.matchScore}%
                </Badge>
              </div>
              <div className="absolute bottom-3 left-3 right-3">
                <CardTitle className="text-white text-xl">{user.display_name}</CardTitle>
                {user.gender && (
                  <CardDescription className="text-white/80 capitalize">
                    {user.gender}
                  </CardDescription>
                )}
              </div>
            </div>
          ) : (
            <CardHeader className="pb-3">
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <Avatar className="h-12 w-12">
                    <AvatarFallback className="bg-primary/10">
                      <User className="h-6 w-6 text-primary" />
                    </AvatarFallback>
                  </Avatar>
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
          )}

          <CardContent className="space-y-3 flex-1 flex flex-col pt-4">
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

            <Button 
              className="w-full bg-transparent mt-auto" 
              variant="outline"
              onClick={() => handleViewProfile(user.id)}
              disabled={viewingProfile === user.id}
            >
              {viewingProfile === user.id ? "Loading..." : "View Profile"}
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
