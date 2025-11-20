import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Gift, Users, Share2 } from "lucide-react"
import { ReferralCode } from "@/components/referral-code"

export default async function ReferralsPage() {
  const supabase = await createServerClient()

  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase
    .from("profiles")
    .select("*, referrals:referrals!referrer_id(count)")
    .eq("id", user.id)
    .single()

  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      *,
      referred:profiles!referred_id(
        first_name,
        last_name,
        email
      )
    `)
    .eq("referrer_id", user.id)
    .order("created_at", { ascending: false })

  const referralCount = profile?.referral_count || 0
  const freeEventsEarned = profile?.free_events_earned || 0

  return (
    <div className="container mx-auto py-8">
      <div className="max-w-6xl mx-auto space-y-6">
        <div>
          <h1 className="text-3xl font-bold mb-2">Referral Program</h1>
          <p className="text-muted-foreground">
            Invite friends and earn free event passes! Refer 25 members to get 1 FREE After Work Activity.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Referrals</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralCount}</div>
              <p className="text-xs text-muted-foreground">Members referred</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Progress to Reward</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{referralCount % 25}/25</div>
              <div className="w-full bg-secondary rounded-full h-2 mt-2">
                <div
                  className="bg-primary h-2 rounded-full transition-all"
                  style={{ width: `${((referralCount % 25) / 25) * 100}%` }}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Free Events Earned</CardTitle>
              <Share2 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{freeEventsEarned}</div>
              <p className="text-xs text-muted-foreground">Available to use</p>
            </CardContent>
          </Card>
        </div>

        {/* Referral Code Section */}
        <Card>
          <CardHeader>
            <CardTitle>Your Referral Code</CardTitle>
            <CardDescription>
              Share your unique referral code with friends. They'll need to enter it during registration.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ReferralCode code={profile?.referral_code || ""} />
          </CardContent>
        </Card>

        {/* Referral History */}
        <Card>
          <CardHeader>
            <CardTitle>Referral History</CardTitle>
            <CardDescription>Track all the members you've referred</CardDescription>
          </CardHeader>
          <CardContent>
            {referrals && referrals.length > 0 ? (
              <div className="space-y-4">
                {referrals.map((referral: any) => (
                  <div key={referral.id} className="flex items-center justify-between p-4 border rounded-lg">
                    <div>
                      <p className="font-medium">
                        {referral.referred?.first_name} {referral.referred?.last_name}
                      </p>
                      <p className="text-sm text-muted-foreground">{referral.referred?.email}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-sm text-muted-foreground">
                        {new Date(referral.created_at).toLocaleDateString()}
                      </p>
                      {referral.reward_granted && (
                        <span className="text-xs text-green-600 font-medium">Reward Granted</span>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-center text-muted-foreground py-8">
                No referrals yet. Start sharing your code to earn rewards!
              </p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
