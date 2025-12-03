import { redirect, notFound } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import {
  MapPin,
  Heart,
  Mail,
  Calendar,
  User as UserIcon,
  Palette,
  Eye,
  Zap,
  MessageCircle,
} from "lucide-react"
import Link from "next/link"
import { MessageButton } from "@/components/message-button"

export default async function UserProfilePage({
  params,
}: {
  params: Promise<{ userId: string }>
}) {
  const { userId } = await params
  const supabase = await createServerClient()

  // Get current user
  const { data: currentUserData, error: authError } = await supabase.auth.getUser()
  if (authError || !currentUserData?.user) {
    redirect("/auth/login")
  }

  // Fetch user profile
  const { data: user, error: userError } = await supabase
    .from("profiles")
    .select(`
      *,
      user_attributes (*)
    `)
    .eq("id", userId)
    .single()

  if (userError || !user) {
    notFound()
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-background to-muted/20">
      {/* Header */}
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <Link href="/dashboard/matches">
            <Button variant="ghost" size="sm">
              ← Back to Matches
            </Button>
          </Link>
          <h1 className="text-2xl font-bold text-foreground">Profile</h1>
          <div className="w-20" />
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-6 py-8">
        <div className="grid gap-8 max-w-4xl mx-auto">
          {/* Hero Section with Profile Image */}
          <Card className="overflow-hidden relative">
            <CardHeader className="pb-0">
              {/* Chat Button - Top Right Corner */}
              <div className="absolute top-4 right-4 z-10">
                <MessageButton recipientId={user.id} recipientName={user.display_name} type="chat" />
              </div>

              <div className="bg-gradient-to-r from-primary/10 to-primary/5 -mx-6 -mt-6 px-6 py-12 mb-6">
                <div className="flex flex-col md:flex-row items-start md:items-end gap-6">
                  <Avatar className="h-32 w-32 border-4 border-background shadow-lg">
                    {user.profile_image_url ? (
                      <AvatarImage src={user.profile_image_url} alt={user.display_name || "User"} />
                    ) : (
                      <AvatarFallback className="bg-primary/20 text-2xl">
                        {user.display_name
                          ? user.display_name
                              .split(" ")
                              .map((n: string) => n[0])
                              .join("")
                              .toUpperCase()
                          : "U"}
                      </AvatarFallback>
                    )}
                  </Avatar>

                  <div className="flex-1">
                    <div className="flex flex-col gap-2 mb-6">
                      <CardTitle className="text-4xl">{user.display_name || "User Profile"}</CardTitle>
                      {user.gender && (
                        <CardDescription className="text-lg capitalize">
                          {user.gender}
                        </CardDescription>
                      )}
                      {user.age && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <Calendar className="h-4 w-4" />
                          <span>{user.age} years old</span>
                        </div>
                      )}
                      {(user.location_city || user.location_state) && (
                        <div className="flex items-center gap-2 text-muted-foreground">
                          <MapPin className="h-4 w-4" />
                          <span>
                            {user.location_city && user.location_state
                              ? `${user.location_city}, ${user.location_state}`
                              : user.location_city || user.location_state}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-8">
              {/* Bio Section */}
              {user.bio && (
                <div>
                  <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                    <UserIcon className="h-5 w-5 text-primary" />
                    About
                  </h3>
                  <p className="text-base text-muted-foreground leading-relaxed">{user.bio}</p>
                </div>
              )}

              {/* Physical Attributes */}
              {user.user_attributes && (
                <>
                  {(user.user_attributes.hair_color ||
                    user.user_attributes.hair_length ||
                    user.user_attributes.eye_color ||
                    user.user_attributes.body_type) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Palette className="h-5 w-5 text-primary" />
                        Physical Traits
                      </h3>
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                        {user.user_attributes.hair_color && (
                          <Card className="bg-muted/50 border-0">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Hair Color</p>
                              <p className="font-medium capitalize">
                                {user.user_attributes.hair_color}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {user.user_attributes.hair_length && (
                          <Card className="bg-muted/50 border-0">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Hair Length</p>
                              <p className="font-medium capitalize">
                                {user.user_attributes.hair_length}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {user.user_attributes.eye_color && (
                          <Card className="bg-muted/50 border-0">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Eye Color</p>
                              <p className="font-medium capitalize">
                                {user.user_attributes.eye_color}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                        {user.user_attributes.body_type && (
                          <Card className="bg-muted/50 border-0">
                            <CardContent className="pt-4">
                              <p className="text-xs text-muted-foreground mb-1">Body Type</p>
                              <p className="font-medium capitalize">
                                {user.user_attributes.body_type}
                              </p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Other Attributes */}
                  {(user.user_attributes.race ||
                    user.user_attributes.religion ||
                    user.user_attributes.ethnicity) && (
                    <div>
                      <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                        <Zap className="h-5 w-5 text-primary" />
                        Background
                      </h3>
                      <div className="flex flex-wrap gap-2">
                        {user.user_attributes.race && (
                          <Badge variant="secondary" className="capitalize">
                            {user.user_attributes.race}
                          </Badge>
                        )}
                        {user.user_attributes.religion && (
                          <Badge variant="secondary" className="capitalize">
                            {user.user_attributes.religion}
                          </Badge>
                        )}
                        {user.user_attributes.ethnicity && (
                          <Badge variant="secondary" className="capitalize">
                            {user.user_attributes.ethnicity}
                          </Badge>
                        )}
                      </div>
                    </div>
                  )}
                </>
              )}

            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}
