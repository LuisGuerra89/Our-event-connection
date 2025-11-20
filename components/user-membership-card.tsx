"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { CreditCard, Gift, UserCheck } from "lucide-react"
import Link from "next/link"
import { format } from "date-fns"

interface UserMembershipCardProps {
  subscription: any
  plan: any
  referralCount: number
  freeEventsEarned: number
}

export function UserMembershipCard({ subscription, plan, referralCount, freeEventsEarned }: UserMembershipCardProps) {
  const isActive = subscription?.status === "active"
  const referralsUntilReward = 25 - (referralCount % 25)

  return (
    <Card>
      <CardHeader>
        <div className="flex items-start justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Membership Status
            </CardTitle>
            <CardDescription>Your subscription and referral rewards</CardDescription>
          </div>
          {isActive && (
            <Badge variant="secondary" className="bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100">
              <UserCheck className="h-3 w-3 mr-1" />
              Active
            </Badge>
          )}
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {isActive && plan ? (
          <div className="space-y-4">
            <div>
              <p className="text-sm font-medium">Current Plan</p>
              <p className="text-2xl font-bold">{plan.name}</p>
              <p className="text-sm text-muted-foreground">${Number(plan.price).toFixed(2)} / {plan.plan_type}</p>
            </div>

            {subscription.end_date && (
              <div>
                <p className="text-sm font-medium">
                  {subscription.auto_renew ? "Renews on" : "Expires on"}
                </p>
                <p className="text-sm text-muted-foreground">
                  {format(new Date(subscription.end_date), "PPP")}
                </p>
              </div>
            )}

            <div className="border-t pt-4">
              <div className="flex items-center justify-between mb-2">
                <div className="flex items-center gap-2">
                  <Gift className="h-4 w-4 text-primary" />
                  <p className="text-sm font-medium">Referral Rewards</p>
                </div>
                {freeEventsEarned > 0 && (
                  <Badge variant="secondary" className="bg-amber-100 text-amber-900 dark:bg-amber-900 dark:text-amber-100">
                    {freeEventsEarned} Free Event{freeEventsEarned !== 1 ? "s" : ""}
                  </Badge>
                )}
              </div>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-muted-foreground">Referrals Made</span>
                  <span className="font-semibold">{referralCount}</span>
                </div>
                <div className="w-full bg-muted rounded-full h-2">
                  <div
                    className="bg-primary h-2 rounded-full transition-all"
                    style={{ width: `${((referralCount % 25) / 25) * 100}%` }}
                  />
                </div>
                <p className="text-xs text-muted-foreground">
                  {referralsUntilReward} more referral{referralsUntilReward !== 1 ? "s" : ""} until next free activity
                </p>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <Button asChild variant="outline" className="flex-1">
                <Link href={`/membership/${plan.id}`}>Manage Plan</Link>
              </Button>
              <Button asChild variant="outline" className="flex-1">
                <Link href="/dashboard/referrals">Share Referral</Link>
              </Button>
            </div>
          </div>
        ) : (
          <div className="text-center py-6 space-y-4">
            <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mx-auto">
              <CreditCard className="h-6 w-6 text-muted-foreground" />
            </div>
            <div>
              <p className="font-medium mb-1">No Active Membership</p>
              <p className="text-sm text-muted-foreground">
                Subscribe to access exclusive events and member benefits
              </p>
            </div>
            <Button asChild size="lg">
              <Link href="/membership">Browse Membership Plans</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
