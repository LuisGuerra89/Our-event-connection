import { createClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { PublicPageLayout } from "@/components/public-page-layout"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { CheckCircle2 } from "lucide-react"
import Link from "next/link"
import { ReferralCode } from "@/components/referral-code"

export default async function MembershipSuccessPage() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/auth/login")
  }

  // Get user's referral code
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, referral_count, free_events_earned")
    .eq("id", user.id)
    .single()

  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card>
          <CardHeader className="text-center">
            <div className="flex justify-center mb-4">
              <div className="h-16 w-16 rounded-full bg-primary/10 flex items-center justify-center">
                <CheckCircle2 className="h-10 w-10 text-primary" />
              </div>
            </div>
            <CardTitle className="text-3xl">Welcome to the Club!</CardTitle>
            <CardDescription className="text-base">
              Your membership subscription has been successfully activated
            </CardDescription>
          </CardHeader>

          <CardContent className="space-y-6">
            <div className="text-center p-4 bg-muted rounded-lg">
              <p className="text-sm text-muted-foreground mb-2">
                You can now access exclusive member-only events and benefits
              </p>
            </div>

            {/* Referral Code Section */}
            {profile?.referral_code && (
              <div className="border-t pt-6">
                <h3 className="font-semibold mb-4 text-center">
                  Share & Earn Free Activities!
                </h3>
                <ReferralCode code={profile.referral_code} />
                {profile.referral_count > 0 && (
                  <div className="mt-4 text-center">
                    <p className="text-sm text-muted-foreground">
                      You've referred <strong>{profile.referral_count}</strong> member{profile.referral_count !== 1 ? "s" : ""}
                    </p>
                    {profile.free_events_earned > 0 && (
                      <p className="text-sm text-primary font-semibold mt-1">
                        Free Activities Earned: {profile.free_events_earned}
                      </p>
                    )}
                  </div>
                )}
              </div>
            )}

            <div className="flex flex-col gap-3 pt-4">
              <Button asChild size="lg">
                <Link href="/events">Browse Events</Link>
              </Button>
              <Button asChild variant="outline">
                <Link href="/dashboard">Go to Dashboard</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageLayout>
  )
}
