"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  MapPin, Heart, User, Briefcase, GraduationCap, Home, 
  Calendar, Users, MessageCircle, X, Loader2
} from "lucide-react"

interface ProfileModalProps {
  userId: string
  open: boolean
  onOpenChange: (open: boolean) => void
  onMessageClick?: (userId: string) => void
}

export function ProfileModal({ userId, open, onOpenChange, onMessageClick }: ProfileModalProps) {
  const [profile, setProfile] = useState<any>(null)
  const [attributes, setAttributes] = useState<any>(null)
  const [preferences, setPreferences] = useState<any>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (open && userId) {
      fetchProfileData()
    }
  }, [open, userId])

  const fetchProfileData = async () => {
    setLoading(true)
    try {
      const [profileRes, attributesRes, preferencesRes] = await Promise.all([
        fetch(`/api/profiles/${userId}`),
        fetch(`/api/attributes/${userId}`),
        fetch(`/api/preferences/${userId}`)
      ])

      if (profileRes.ok) setProfile(await profileRes.json())
      if (attributesRes.ok) setAttributes(await attributesRes.json())
      if (preferencesRes.ok) setPreferences(await preferencesRes.json())
    } catch (error) {
      console.error("Error fetching profile:", error)
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl max-h-[90vh] p-0">
        {loading ? (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-pink-500" />
          </div>
        ) : profile ? (
          <ScrollArea className="max-h-[90vh]">
            <div className="p-6">
              {/* Header with Profile Image */}
              <div className="flex flex-col md:flex-row gap-6 mb-6">
                <div className="flex flex-col items-center md:items-start">
                  <Avatar className="h-32 w-32 ring-4 ring-pink-200 dark:ring-pink-800">
                    <AvatarImage src={profile.profile_image_url || ""} alt={profile.display_name} />
                    <AvatarFallback className="text-3xl bg-gradient-to-br from-pink-400 to-purple-600 text-white">
                      {profile.display_name?.[0]?.toUpperCase()}
                    </AvatarFallback>
                  </Avatar>
                  {onMessageClick && (
                    <Button 
                      className="mt-4 w-full bg-gradient-to-r from-pink-500 to-purple-600 hover:from-pink-600 hover:to-purple-700"
                      onClick={() => {
                        onMessageClick(userId)
                        onOpenChange(false)
                      }}
                    >
                      <MessageCircle className="h-4 w-4 mr-2" />
                      Send Message
                    </Button>
                  )}
                </div>

                <div className="flex-1">
                  <DialogTitle className="text-3xl mb-2">{profile.display_name}</DialogTitle>
                  {profile.gender && (
                    <p className="text-muted-foreground capitalize mb-4">{profile.gender}</p>
                  )}
                  {(profile.location_city || profile.location_state) && (
                    <div className="flex items-center gap-2 text-muted-foreground mb-4">
                      <MapPin className="h-4 w-4 text-pink-500" />
                      <span>
                        {profile.location_city && profile.location_state
                          ? `${profile.location_city}, ${profile.location_state}`
                          : profile.location_city || profile.location_state}
                      </span>
                    </div>
                  )}
                  {profile.bio && (
                    <p className="text-sm text-muted-foreground">{profile.bio}</p>
                  )}
                </div>
              </div>

              <Separator className="my-6" />

              {/* Attributes Section */}
              {attributes && (
                <div className="space-y-6">
                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <User className="h-5 w-5 text-pink-500" />
                      Physical Attributes
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {attributes.height && (
                        <div>
                          <p className="text-sm text-muted-foreground">Height</p>
                          <p className="font-medium">{attributes.height}</p>
                        </div>
                      )}
                      {attributes.body_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">Body Type</p>
                          <p className="font-medium capitalize">{attributes.body_type}</p>
                        </div>
                      )}
                      {attributes.hair_color && (
                        <div>
                          <p className="text-sm text-muted-foreground">Hair Color</p>
                          <p className="font-medium capitalize">{attributes.hair_color}</p>
                        </div>
                      )}
                      {attributes.hair_length && (
                        <div>
                          <p className="text-sm text-muted-foreground">Hair Length</p>
                          <p className="font-medium capitalize">{attributes.hair_length}</p>
                        </div>
                      )}
                      {attributes.eye_color && (
                        <div>
                          <p className="text-sm text-muted-foreground">Eye Color</p>
                          <p className="font-medium capitalize">{attributes.eye_color}</p>
                        </div>
                      )}
                      {attributes.race && (
                        <div>
                          <p className="text-sm text-muted-foreground">Ethnicity</p>
                          <p className="font-medium capitalize">{attributes.race}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Briefcase className="h-5 w-5 text-pink-500" />
                      Lifestyle
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {attributes.education_level && (
                        <div>
                          <p className="text-sm text-muted-foreground">Education</p>
                          <p className="font-medium capitalize">{attributes.education_level.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                      {attributes.occupation && (
                        <div>
                          <p className="text-sm text-muted-foreground">Occupation</p>
                          <p className="font-medium">{attributes.occupation}</p>
                        </div>
                      )}
                      {attributes.smoking_habits && (
                        <div>
                          <p className="text-sm text-muted-foreground">Smoking</p>
                          <p className="font-medium capitalize">{attributes.smoking_habits.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                      {attributes.drinking_habits && (
                        <div>
                          <p className="text-sm text-muted-foreground">Drinking</p>
                          <p className="font-medium capitalize">{attributes.drinking_habits.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                      {attributes.exercise_frequency && (
                        <div>
                          <p className="text-sm text-muted-foreground">Exercise</p>
                          <p className="font-medium capitalize">{attributes.exercise_frequency.replace(/_/g, ' ')}</p>
                        </div>
                      )}
                      {attributes.religion && (
                        <div>
                          <p className="text-sm text-muted-foreground">Religion</p>
                          <p className="font-medium capitalize">{attributes.religion}</p>
                        </div>
                      )}
                    </div>
                  </div>

                  <Separator />

                  <div>
                    <h3 className="text-xl font-semibold mb-4 flex items-center gap-2">
                      <Heart className="h-5 w-5 text-pink-500" />
                      Interests & Personality
                    </h3>
                    <div className="grid gap-4 md:grid-cols-2">
                      {attributes.personality_type && (
                        <div>
                          <p className="text-sm text-muted-foreground">Personality</p>
                          <p className="font-medium capitalize">{attributes.personality_type}</p>
                        </div>
                      )}
                      {attributes.interests && (
                        <div className="md:col-span-2">
                          <p className="text-sm text-muted-foreground mb-2">Interests</p>
                          <div className="flex flex-wrap gap-2">
                            {attributes.interests.split(',').map((interest: string, index: number) => (
                              <Badge key={index} variant="secondary">
                                {interest.trim()}
                              </Badge>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        ) : (
          <div className="p-6 text-center text-muted-foreground">
            Profile not found
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}
