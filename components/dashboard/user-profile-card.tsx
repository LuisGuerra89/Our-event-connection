"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  Calendar,
  User as UserIcon,
  Palette,
  Eye,
  Zap,
  Heart,
  Flame,
  Sparkles,
  BookOpen,
  Briefcase,
  Wine,
  Cigarette,
  Activity,
  Globe,
  Music,
  Utensils,
} from "lucide-react"
import { Badge as BadgeUI } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

interface UserProfile {
  id: string
  display_name: string
  bio: string | null
  age: number | null
  gender: string | null
  location_city: string | null
  location_state: string | null
  profile_image_url: string | null
  email: string | null
  user_attributes: any
}

interface UserPreferences {
  [key: string]: any
}

interface UserProfileCardProps {
  user: UserProfile
  preferences?: UserPreferences | null
}

export function UserProfileCard({ user, preferences }: UserProfileCardProps) {
  // Helper function to render attribute sections
  const renderAttributeSection = (title: string, icon: React.ReactNode, attributes: any) => {
    const hasContent = Object.values(attributes).some((v) => v)
    if (!hasContent) return null

    return (
      <div>
        <h4 className="font-semibold mb-2 flex items-center gap-2 text-sm">
          {icon}
          {title}
        </h4>
        <div className="flex flex-wrap gap-2">
          {Object.entries(attributes).map(([key, value]) => {
            if (!value) return null
            return (
              <Badge key={key} variant="outline" className="capitalize text-xs">
                {String(value).replace(/_/g, " ")}
              </Badge>
            )
          })}
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Hero Section */}
      <Card className="overflow-hidden relative mb-6">
        <CardHeader className="pb-0">
          <div className="bg-gradient-to-r from-primary/10 to-primary/5 -mx-6 -mt-6 px-6 py-10 mb-6">
            <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
              <Avatar className="h-28 w-28 border-4 border-background shadow-lg flex-shrink-0">
                {user.profile_image_url ? (
                  <AvatarImage src={user.profile_image_url} alt={user.display_name || "User"} />
                ) : (
                  <AvatarFallback className="bg-primary/20 text-2xl font-bold">
                    {user.display_name
                      ? user.display_name
                          .split(" ")
                          .map((n) => n[0])
                          .join("")
                          .toUpperCase()
                      : "U"}
                  </AvatarFallback>
                )}
              </Avatar>

              <div className="flex-1">
                <div className="flex flex-col gap-2 mb-4">
                  <CardTitle className="text-3xl md:text-4xl">{user.display_name || "User Profile"}</CardTitle>
                  
                  {user.age && user.gender && (
                    <p className="text-lg text-muted-foreground capitalize">
                      {user.age} • {user.gender}
                    </p>
                  )}

                  {user.location_city && user.location_state && (
                    <div className="flex items-center gap-2 text-muted-foreground">
                      <MapPin className="h-4 w-4" />
                      <span>{user.location_city}, {user.location_state}</span>
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        </CardHeader>

        <CardContent className="pt-0 pb-6">
          {user.bio && (
            <div>
              <h3 className="text-sm font-semibold mb-2 flex items-center gap-2">
                <UserIcon className="h-4 w-4 text-primary" />
                About
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{user.bio}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Tabs for detailed information */}
      {(user.user_attributes || preferences) && (
        <Tabs defaultValue="attributes" className="w-full">
          <TabsList className="grid w-full grid-cols-2 mb-6">
            <TabsTrigger value="attributes">Attributes</TabsTrigger>
            {preferences && <TabsTrigger value="preferences">Preferences</TabsTrigger>}
          </TabsList>

          {/* Attributes Tab */}
          <TabsContent value="attributes" className="space-y-4">
            {user.user_attributes && (
              <>
                {/* Physical Traits */}
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Physical Traits
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                      {user.user_attributes.hair_color && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Hair Color</p>
                          <p className="font-medium capitalize text-sm">{user.user_attributes.hair_color}</p>
                        </div>
                      )}
                      {user.user_attributes.hair_length && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Hair Length</p>
                          <p className="font-medium capitalize text-sm">{user.user_attributes.hair_length}</p>
                        </div>
                      )}
                      {user.user_attributes.eye_color && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Eye Color</p>
                          <p className="font-medium capitalize text-sm">{user.user_attributes.eye_color}</p>
                        </div>
                      )}
                      {user.user_attributes.body_type && (
                        <div className="bg-muted/50 rounded-lg p-3">
                          <p className="text-xs text-muted-foreground mb-1">Body Type</p>
                          <p className="font-medium capitalize text-sm">{user.user_attributes.body_type}</p>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>

                {/* Background & Heritage */}
                {(user.user_attributes.race || user.user_attributes.religion || user.user_attributes.ethnicity) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Globe className="h-5 w-5 text-primary" />
                        Background & Heritage
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {user.user_attributes.race && (
                          <Badge className="capitalize">{user.user_attributes.race}</Badge>
                        )}
                        {user.user_attributes.religion && (
                          <Badge className="capitalize">{user.user_attributes.religion}</Badge>
                        )}
                        {user.user_attributes.ethnicity && (
                          <Badge className="capitalize">{user.user_attributes.ethnicity}</Badge>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Lifestyle & Habits */}
                {(user.user_attributes.smoking_status ||
                  user.user_attributes.drinking_status ||
                  user.user_attributes.exercise_frequency) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Activity className="h-5 w-5 text-primary" />
                        Lifestyle & Habits
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {user.user_attributes.smoking_status && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Cigarette className="h-3 w-3" /> Smoking
                            </p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.smoking_status}</p>
                          </div>
                        )}
                        {user.user_attributes.drinking_status && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Wine className="h-3 w-3" /> Drinking
                            </p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.drinking_status}</p>
                          </div>
                        )}
                        {user.user_attributes.exercise_frequency && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1 flex items-center gap-1">
                              <Activity className="h-3 w-3" /> Exercise
                            </p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.exercise_frequency}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Professional & Education */}
                {(user.user_attributes.occupation ||
                  user.user_attributes.education_level ||
                  user.user_attributes.income_level) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Briefcase className="h-5 w-5 text-primary" />
                        Professional & Education
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {user.user_attributes.occupation && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Occupation</p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.occupation}</p>
                          </div>
                        )}
                        {user.user_attributes.education_level && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Education</p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.education_level}</p>
                          </div>
                        )}
                        {user.user_attributes.income_level && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Income</p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.income_level}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Interests & Entertainment */}
                {(user.user_attributes.music_taste ||
                  user.user_attributes.movie_genres ||
                  user.user_attributes.hobbies) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Music className="h-5 w-5 text-primary" />
                        Interests & Entertainment
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      {user.user_attributes.music_taste && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Music Taste</p>
                          <div className="flex flex-wrap gap-2">
                            {String(user.user_attributes.music_taste)
                              .split(",")
                              .map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                      {user.user_attributes.movie_genres && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Movie Genres</p>
                          <div className="flex flex-wrap gap-2">
                            {String(user.user_attributes.movie_genres)
                              .split(",")
                              .map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                      {user.user_attributes.hobbies && (
                        <div>
                          <p className="text-xs text-muted-foreground mb-2">Hobbies</p>
                          <div className="flex flex-wrap gap-2">
                            {String(user.user_attributes.hobbies)
                              .split(",")
                              .map((tag) => (
                                <Badge key={tag} variant="secondary" className="text-xs">
                                  {tag.trim()}
                                </Badge>
                              ))}
                          </div>
                        </div>
                      )}
                    </CardContent>
                  </Card>
                )}

                {/* Food & Dining */}
                {user.user_attributes.cuisine_preference && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Utensils className="h-5 w-5 text-primary" />
                        Food & Dining
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="flex flex-wrap gap-2">
                        {String(user.user_attributes.cuisine_preference)
                          .split(",")
                          .map((cuisine) => (
                            <Badge key={cuisine} className="capitalize text-xs">
                              {cuisine.trim()}
                            </Badge>
                          ))}
                      </div>
                    </CardContent>
                  </Card>
                )}

                {/* Personality & Values */}
                {(user.user_attributes.personality_type ||
                  user.user_attributes.love_language ||
                  user.user_attributes.relationship_goals) && (
                  <Card>
                    <CardHeader className="pb-3">
                      <CardTitle className="text-lg flex items-center gap-2">
                        <Heart className="h-5 w-5 text-primary" />
                        Personality & Values
                      </CardTitle>
                    </CardHeader>
                    <CardContent className="space-y-3">
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        {user.user_attributes.personality_type && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Personality</p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.personality_type}</p>
                          </div>
                        )}
                        {user.user_attributes.love_language && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Love Language</p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.love_language}</p>
                          </div>
                        )}
                        {user.user_attributes.relationship_goals && (
                          <div className="bg-muted/50 rounded-lg p-3">
                            <p className="text-xs text-muted-foreground mb-1">Relationship Goals</p>
                            <p className="font-medium capitalize text-sm">{user.user_attributes.relationship_goals}</p>
                          </div>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                )}
              </>
            )}
          </TabsContent>

          {/* Preferences Tab */}
          {preferences && (
            <TabsContent value="preferences" className="space-y-4">
              {/* Physical Preferences */}
              {(preferences.hair_color_importance ||
                preferences.hair_length_importance ||
                preferences.eye_color_importance ||
                preferences.body_type_importance) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Palette className="h-5 w-5 text-primary" />
                      Physical Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {preferences.hair_color_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Hair Color</span>
                        <Badge variant="outline" className="capitalize">{preferences.hair_color_importance}</Badge>
                      </div>
                    )}
                    {preferences.hair_length_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Hair Length</span>
                        <Badge variant="outline" className="capitalize">{preferences.hair_length_importance}</Badge>
                      </div>
                    )}
                    {preferences.eye_color_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Eye Color</span>
                        <Badge variant="outline" className="capitalize">{preferences.eye_color_importance}</Badge>
                      </div>
                    )}
                    {preferences.body_type_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Body Type</span>
                        <Badge variant="outline" className="capitalize">{preferences.body_type_importance}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Background Preferences */}
              {(preferences.race_importance || preferences.religion_importance || preferences.ethnicity_importance) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Globe className="h-5 w-5 text-primary" />
                      Background Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {preferences.race_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Race</span>
                        <Badge variant="outline" className="capitalize">{preferences.race_importance}</Badge>
                      </div>
                    )}
                    {preferences.religion_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Religion</span>
                        <Badge variant="outline" className="capitalize">{preferences.religion_importance}</Badge>
                      </div>
                    )}
                    {preferences.ethnicity_importance && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Ethnicity</span>
                        <Badge variant="outline" className="capitalize">{preferences.ethnicity_importance}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Lifestyle Preferences */}
              {(preferences.age_range_min || preferences.age_range_max || 
                preferences.smoking_preference || preferences.drinking_preference) && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <Activity className="h-5 w-5 text-primary" />
                      Lifestyle Preferences
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-2 text-sm">
                    {(preferences.age_range_min || preferences.age_range_max) && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Age Range</span>
                        <Badge variant="outline">
                          {preferences.age_range_min || "Any"} - {preferences.age_range_max || "Any"}
                        </Badge>
                      </div>
                    )}
                    {preferences.smoking_preference && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Smoking</span>
                        <Badge variant="outline" className="capitalize">{preferences.smoking_preference}</Badge>
                      </div>
                    )}
                    {preferences.drinking_preference && (
                      <div className="flex justify-between items-center p-2 bg-muted/50 rounded">
                        <span>Drinking</span>
                        <Badge variant="outline" className="capitalize">{preferences.drinking_preference}</Badge>
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}

              {/* Other Preferences */}
              {preferences.location_preference && (
                <Card>
                  <CardHeader className="pb-3">
                    <CardTitle className="text-lg flex items-center gap-2">
                      <MapPin className="h-5 w-5 text-primary" />
                      Location Preference
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <Badge className="capitalize">{preferences.location_preference}</Badge>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
          )}
        </Tabs>
      )}
    </div>
  )
}
