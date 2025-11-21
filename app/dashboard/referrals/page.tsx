import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { ReferralCode } from "@/components/referral-code"
import { Gift, Users, TrendingUp, Award, CheckCircle2, Clock, AlertCircle } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

export default async function ReferralsPage() {
  const supabase = await createClient()

  const { data } = await supabase.auth.getUser()
  const user = data?.user

  if (!user) {
    redirect("/auth/login")
  }

  // Get user profile with referral data
  const { data: profile } = await supabase
    .from("profiles")
    .select("referral_code, referral_count, free_events_earned")
    .eq("id", user.id)
    .single()

  // Get affiliate status
  const { data: affiliateStatus } = await supabase
    .from("affiliates")
    .select("*")
    .eq("user_id", user.id)
    .single()

  // Get referrals made by this user
  const { data: referrals } = await supabase
    .from("referrals")
    .select(`
      id,
      referral_date,
      status,
      reward_granted,
      referred:profiles!referrals_referred_id_fkey(full_name, email, created_at)
    `)
    .eq("referrer_id", user.id)
    .order("referral_date", { ascending: false })

  const referralCount = profile?.referral_count || 0
  const freeEventsEarned = profile?.free_events_earned || 0
  const referralsUntilReward = 25 - (referralCount % 25)
  const progressPercentage = ((referralCount % 25) / 25) * 100

  const getAffiliateStatusBadge = () => {
    if (!affiliateStatus) return null

    const statusConfig = {
      pending: {
        icon: Clock,
        label: "Pending Review",
        className: "bg-yellow-100 text-yellow-900 dark:bg-yellow-900 dark:text-yellow-100",
      },
      approved: {
        icon: CheckCircle2,
        label: "Approved Affiliate",
        className: "bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100",
      },
      rejected: {
        icon: AlertCircle,
        label: "Application Rejected",
        className: "bg-red-100 text-red-900 dark:bg-red-900 dark:text-red-100",
      },
    }

    const config = statusConfig[affiliateStatus.approval_status as keyof typeof statusConfig]
    if (!config) return null

    const Icon = config.icon

    return (
      <Badge className={config.className}>
        <Icon className="h-3 w-3 mr-1" />
        {config.label}
      </Badge>
    )
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-start justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold">Referral Program</h1>
          <p className="text-muted-foreground mt-2">
            Share your code, earn rewards, and become an affiliate
          </p>
        </div>
        {getAffiliateStatusBadge()}
      </div>

      {/* Affiliate Status Alert */}
      {affiliateStatus?.approval_status === "approved" && (
        <Alert className="mb-6 border-green-500 bg-green-50 dark:bg-green-950">
          <Award className="h-4 w-4 text-green-600" />
          <AlertDescription className="text-green-800 dark:text-green-200">
            <strong>Congratulations!</strong> You are an approved affiliate.{" "}
            <Link href={`/affiliates/${affiliateStatus.id}`} className="underline font-semibold">
              View your public profile
            </Link>
          </AlertDescription>
        </Alert>
      )}

      {affiliateStatus?.approval_status === "pending" && (
        <Alert className="mb-6 border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
          <Clock className="h-4 w-4 text-yellow-600" />
          <AlertDescription className="text-yellow-800 dark:text-yellow-200">
            Your affiliate application is under review. We'll notify you once it's approved.
          </AlertDescription>
        </Alert>
      )}

      {!affiliateStatus && referralCount >= 10 && (
        <Alert className="mb-6 border-primary">
          <Award className="h-4 w-4" />
          <AlertDescription>
            <strong>Great progress!</strong> You've earned {referralCount} referrals and {freeEventsEarned} free activities!
          </AlertDescription>
        </Alert>
      )}

      <div className="grid md:grid-cols-3 gap-4 mb-8">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{referralCount}</p>
            <p className="text-xs text-muted-foreground mt-1">Members referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Gift className="h-4 w-4 text-muted-foreground" />
              Free Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{freeEventsEarned}</p>
            <p className="text-xs text-muted-foreground mt-1">Available to redeem</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Next Reward
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{referralsUntilReward}</p>
            <p className="text-xs text-muted-foreground mt-1">Referrals away</p>
          </CardContent>
        </Card>
      </div>

      {/* Progress Bar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Progress to Next Reward</CardTitle>
          <CardDescription>
            Refer 25 members to earn 1 FREE After Work Activity
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            <div className="w-full bg-muted rounded-full h-4">
              <div
                className="bg-primary h-4 rounded-full transition-all flex items-center justify-end pr-2"
                style={{ width: `${progressPercentage}%` }}
              >
                {progressPercentage > 15 && (
                  <span className="text-xs font-semibold text-primary-foreground">
                    {referralCount % 25} / 25
                  </span>
                )}
              </div>
            </div>
            <div className="flex justify-between text-sm text-muted-foreground">
              <span>{referralCount % 25} referrals</span>
              <span>25 referrals</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Referral Code & Affiliate Actions */}
      <Card className="mb-8">
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle>Your Referral Code</CardTitle>
              <CardDescription>
                Share this code with friends to earn rewards{affiliateStatus?.approval_status === "approved" && " and grow your affiliate network"}
              </CardDescription>
            </div>
            {!affiliateStatus && (
              <Button asChild variant="outline">
                <Link href="/affiliates/apply">
                  <Award className="h-4 w-4 mr-2" />
                  Become Affiliate
                </Link>
              </Button>
            )}
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {profile?.referral_code && <ReferralCode code={profile.referral_code} />}
          
          {affiliateStatus?.barcode && (
            <div className="border-t pt-4">
              <p className="text-sm font-medium mb-2">Your Affiliate Barcode</p>
              <div className="p-3 bg-muted rounded-lg font-mono text-lg font-bold text-center">
                {affiliateStatus.barcode}
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Referral History */}
      <Card>
        <CardHeader>
          <CardTitle>Referral History</CardTitle>
          <CardDescription>
            Members who joined using your referral code
          </CardDescription>
        </CardHeader>
        <CardContent>
          {referrals && referrals.length > 0 ? (
            <div className="space-y-4">
              {referrals.map((referral: any) => (
                <div key={referral.id} className="flex items-start justify-between border-b pb-4 last:border-0">
                  <div>
                    <p className="font-medium">{referral.referred?.full_name || "New Member"}</p>
                    <p className="text-sm text-muted-foreground">{referral.referred?.email}</p>
                    <p className="text-xs text-muted-foreground mt-1">
                      Joined {format(new Date(referral.referral_date), "PPP")}
                    </p>
                  </div>
                  {referral.reward_granted && (
                    <div className="flex items-center gap-1 text-xs bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100 px-2 py-1 rounded-full">
                      <Gift className="h-3 w-3" />
                      Reward
                    </div>
                  )}
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-8">
              <Users className="h-12 w-12 text-muted-foreground mx-auto mb-3" />
              <p className="text-sm text-muted-foreground">
                No referrals yet. Share your code to get started!
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
