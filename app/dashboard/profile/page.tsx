import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProfileImageUpload } from "@/components/profile-image-upload"
import { EditAttributes } from "@/components/edit-attributes"
import { EditBasicInfo } from "@/components/edit-basic-info"
import { EditAddress } from "@/components/edit-address"
import { ProfileSectionPhase2 } from "@/components/profile-section-phase-2"
import { ProfileSectionPhase5 } from "@/components/profile-section-phase-5"
import { QuestionnaireStatus } from "@/components/questionnaire-status"
import { ComprehensiveProfileDisplay } from "@/components/comprehensive-profile-display"
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

          {/* Basic Information - Combined with Your Profile */}
          <EditBasicInfo profile={profile} attributes={attributes} />

          {/* Address Information */}
          <EditAddress profile={profile} />

          {/* Questionnaire Status */}
          <QuestionnaireStatus questionnaireCompleted={profile?.questionnaire_completed} />

          {/* Comprehensive Profile Display - All attributes and preferences organized */}
          <ComprehensiveProfileDisplay attributes={attributes} preferences={preferences} />
        </div>
      </main>
    </div>
  )
}
