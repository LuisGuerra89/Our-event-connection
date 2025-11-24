import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import Link from "next/link"
import { Edit, MapPin, Calendar, User } from "lucide-react"

export default async function ProfilePage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch profile
  const { data: profile } = await supabase.from("profiles").select("*").eq("id", data.user.id).single()

  // Fetch attributes
  const { data: attributes } = await supabase
    .from("user_attributes")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle()

  // Fetch preferences
  const { data: preferences } = await supabase
    .from("user_preferences")
    .select("*")
    .eq("user_id", data.user.id)
    .maybeSingle()

  return (
    <div className="min-h-full">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4">
          <h1 className="text-2xl font-bold text-foreground">My Profile</h1>
          <p className="text-sm text-muted-foreground">Manage your personal information and preferences</p>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8 max-w-4xl">
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Profile Picture</CardTitle>
              <CardDescription>Upload or change your profile picture</CardDescription>
            </CardHeader>
            <CardContent>
              <ProfileImageUpload
                userName={profile?.display_name || profile?.full_name || "User"}
                currentImageUrl={profile?.profile_image_url}
              />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-3xl">{profile?.display_name || "Your Profile"}</CardTitle>
                  <CardDescription className="text-base mt-2">{profile?.email}</CardDescription>
                </div>
                <Button variant="outline" asChild>
                  <Link href="/onboarding/profile">
                    <Edit className="h-4 w-4 mr-2" />
                    Edit
                  </Link>
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <User className="h-4 w-4" />
                  <span>{profile?.gender || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Calendar className="h-4 w-4" />
                  <span>{profile?.date_of_birth || "Not specified"}</span>
                </div>
                <div className="flex items-center gap-2 text-muted-foreground">
                  <MapPin className="h-4 w-4" />
                  <span>
                    {profile?.location_city && profile?.location_state
                      ? `${profile.location_city}, ${profile.location_state}`
                      : "Not specified"}
                  </span>
                </div>
              </div>

              {profile?.bio && (
                <div>
                  <h3 className="font-semibold mb-2">About Me</h3>
                  <p className="text-muted-foreground">{profile.bio}</p>
                </div>
              )}
            </CardContent>
          </Card>

          {attributes && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Attributes</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/onboarding/attributes">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {attributes.hair_color && <Badge variant="secondary">{attributes.hair_color} hair</Badge>}
                  {attributes.hair_length && <Badge variant="secondary">{attributes.hair_length} hair</Badge>}
                  {attributes.eye_color && <Badge variant="secondary">{attributes.eye_color} eyes</Badge>}
                  {attributes.body_type && <Badge variant="secondary">{attributes.body_type}</Badge>}
                  {attributes.height && <Badge variant="secondary">{attributes.height} cm</Badge>}
                  {attributes.race && <Badge variant="secondary">{attributes.race}</Badge>}
                  {attributes.religion && <Badge variant="secondary">{attributes.religion}</Badge>}
                </div>
              </CardContent>
            </Card>
          )}

          {preferences && (
            <Card>
              <CardHeader>
                <div className="flex items-center justify-between">
                  <CardTitle>My Preferences</CardTitle>
                  <Button variant="outline" size="sm" asChild>
                    <Link href="/onboarding/preferences">
                      <Edit className="h-4 w-4 mr-2" />
                      Edit
                    </Link>
                  </Button>
                </div>
                <CardDescription>What I&apos;m looking for in a match</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {Object.entries(preferences)
                    .filter(([key, value]) => key.endsWith("_importance") && value === "important")
                    .map(([key]) => {
                      const label = key.replace("_importance", "").replace(/_/g, " ")
                      return (
                        <div key={key} className="flex items-center gap-2">
                          <Badge>{label}</Badge>
                          <span className="text-sm text-muted-foreground">is important to me</span>
                        </div>
                      )
                    })}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  )
}
