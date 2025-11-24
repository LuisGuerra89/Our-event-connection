import { redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { DeleteAccountDialog } from "@/components/settings/delete-account-dialog"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { User, Mail, Calendar, CreditCard, AlertTriangle } from "lucide-react"

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
    const { data: subscription } = await supabase
        .from("user_subscriptions")
        .select(`
      *,
      plan:subscription_plans(name, price, billing_cycle)
    `)
        .eq("user_id", user.id)
        .eq("status", "active")
        .maybeSingle()

    const hasActiveSubscription = !!subscription

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
                                    <p className="text-sm font-medium">{subscription.plan?.name}</p>
                                    <p className="text-sm text-muted-foreground">
                                        ${subscription.plan?.price} / {subscription.plan?.billing_cycle}
                                    </p>
                                </div>
                                <Badge variant="default">Active</Badge>
                            </div>

                            <Separator />

                            <div>
                                <p className="text-sm font-medium">Next Billing Date</p>
                                <p className="text-sm text-muted-foreground">
                                    {subscription.end_date
                                        ? new Date(subscription.end_date).toLocaleDateString()
                                        : "N/A"}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

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
