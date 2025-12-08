import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog"
import { ChangePasswordForm } from "@/components/settings/change-password-form"
import { CancelSubscriptionButton } from "@/components/cancel-subscription-button"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, CreditCard, AlertTriangle, Lock } from "lucide-react"

export default async function SettingsPage() {
    const supabase = await createClient()
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) redirect("/auth/login")

    // Get user profile
    const { data: profile } = await supabase
        .from("profiles")
        .select("*")
        .eq("id", user.id)
        .single()

    // Get active subscription
    const { data: subscription, error: subError } = await supabase
        .from("user_subscriptions")
        .select(`
      id,
      user_id,
      plan_id,
      start_date,
      end_date,
      auto_renew,
      status,
      stripe_subscription_id,
      plan:subscription_plans(id, name, price, plan_type, duration_days)
    `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

    const hasActiveSubscription = !!subscription

    console.log("Settings page - Subscription data:", {
        userId: user.id,
        subscription,
        subError,
        hasActiveSubscription,
    })

    return (
        <div className="container mx-auto py-8 max-w-4xl">
            <div className="mb-8">
                <h1 className="text-3xl font-bold">Account Settings</h1>
                <p className="text-muted-foreground">Manage your account settings and preferences</p>
            </div>

            <div className="space-y-6">
                {/* Account Information */}
                <Card>
                    <CardHeader>
                        <CardTitle>Account Information</CardTitle>
                        <CardDescription>Your personal account details</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Full Name</p>
                                <p className="text-sm text-muted-foreground">{profile?.full_name || "Not set"}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                            <Mail className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Email</p>
                                <p className="text-sm text-muted-foreground">{user.email}</p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                            <Calendar className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Member Since</p>
                                <p className="text-sm text-muted-foreground">
                                    {new Date(profile?.created_at || user.created_at).toLocaleDateString()}
                                </p>
                            </div>
                        </div>

                        <Separator />

                        <div className="flex items-center gap-3">
                            <User className="h-5 w-5 text-muted-foreground" />
                            <div>
                                <p className="text-sm font-medium">Referral Code</p>
                                <p className="text-sm font-mono bg-muted px-2 py-1 rounded inline-block">
                                    {profile?.referral_code || "Not available"}
                                </p>
                            </div>
                        </div>
                    </CardContent>
                </Card>

                {/* Subscription Information */}
                {hasActiveSubscription && subscription && (
                    <Card>
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2">
                                <CreditCard className="h-5 w-5" />
                                Active Subscription
                            </CardTitle>
                            <CardDescription>Your current subscription details</CardDescription>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="flex items-center justify-between">
                                <div>
                                    <p className="text-sm font-medium">{(subscription.plan as any)?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        ${(subscription.plan as any)?.price} / month
                                    </p>
                                </div>
                                <Badge variant="default" className="bg-green-600">Active</Badge>
                            </div>

                            <Separator />

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <p className="text-sm font-medium">Start Date</p>
                                    <p className="text-sm text-muted-foreground">
                                        {subscription.start_date
                                            ? new Date(subscription.start_date).toLocaleDateString()
                                            : "N/A"}
                                    </p>
                                </div>
                                <div>
                                    <p className="text-sm font-medium">End Date / Renewal</p>
                                    <p className="text-sm text-muted-foreground">
                                        {subscription.start_date ? (() => {
                                            const startDate = new Date(subscription.start_date)
                                            // If plan has duration_days, add it to start_date
                                            // Otherwise, assume monthly (30 days)
                                            const durationDays = (subscription.plan as any)?.duration_days || 30
                                            const renewalDate = new Date(startDate)
                                            renewalDate.setDate(renewalDate.getDate() + durationDays)
                                            return renewalDate.toLocaleDateString()
                                        })() : "N/A"}
                                    </p>
                                </div>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium mb-2">Auto-Renewal Status</p>
                                <Badge variant={subscription.auto_renew ? "default" : "secondary"}>
                                    {subscription.auto_renew ? "Enabled" : "Disabled"}
                                </Badge>
                            </div>

                            {subscription.auto_renew && (
                                <div className="mt-4">
                                    <CancelSubscriptionButton
                                        subscriptionId={subscription.id}
                                        planName={(subscription.plan as any)?.name || "Subscription"}
                                    />
                                </div>
                            )}
                        </CardContent>
                    </Card>
                )}

                {/* Change Password */}
                <Card>
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2">
                            <Lock className="h-5 w-5" />
                            Change Password
                        </CardTitle>
                        <CardDescription>Update your account password</CardDescription>
                    </CardHeader>
                    <CardContent>
                        <ChangePasswordForm />
                    </CardContent>
                </Card>

                {/* Danger Zone */}
                <Card className="border-destructive">
                    <CardHeader>
                        <CardTitle className="flex items-center gap-2 text-destructive">
                            <AlertTriangle className="h-5 w-5" />
                            Danger Zone
                        </CardTitle>
                        <CardDescription>
                            Irreversible actions that will permanently affect your account
                        </CardDescription>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            <div>
                                <h3 className="text-sm font-semibold mb-2">Delete Account</h3>
                                <p className="text-sm text-muted-foreground mb-4">
                                    Once you delete your account, there is no going back. Please be certain.
                                    {hasActiveSubscription && (
                                        <span className="block mt-2 text-destructive font-medium">
                                            Warning: Your active subscription will be cancelled immediately.
                                        </span>
                                    )}
                                </p>
                                <DeleteAccountDialog hasActiveSubscription={hasActiveSubscription} />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
