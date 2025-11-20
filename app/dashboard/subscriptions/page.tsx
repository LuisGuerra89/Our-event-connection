import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Check } from "lucide-react"
import Link from "next/link"

export default async function SubscriptionsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const [{ data: plans }, { data: userSubscription }] = await Promise.all([
    supabase.from("subscription_plans").select("*").eq("status", "active").order("price"),
    supabase
      .from("user_subscriptions")
      .select("*, subscription_plans(*)")
      .eq("user_id", user.id)
      .eq("status", "active")
      .single(),
  ])

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 text-center">
        <h1 className="text-4xl font-bold mb-2">Choose Your Plan</h1>
        <p className="text-muted-foreground text-lg">Unlock premium features and access exclusive events</p>
      </div>

      {userSubscription && (
        <Card className="mb-8 bg-primary/5 border-primary">
          <CardHeader>
            <CardTitle>Current Subscription</CardTitle>
            <CardDescription>You are subscribed to {userSubscription.subscription_plans?.name}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-muted-foreground">
                  Expires: {new Date(userSubscription.end_date).toLocaleDateString()}
                </p>
                <p className="text-sm text-muted-foreground">
                  Auto-renew: {userSubscription.auto_renew ? "Enabled" : "Disabled"}
                </p>
              </div>
              <Button variant="outline" asChild>
                <Link href="/dashboard/profile/subscription">Manage</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {plans?.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">${plan.price}</span>
                <span className="text-muted-foreground">/{plan.plan_type}</span>
              </div>

              {plan.features && Array.isArray(plan.features) && (
                <ul className="space-y-2 mb-6">
                  {plan.features.map((feature: string, idx: number) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                      <span className="text-sm">{feature}</span>
                    </li>
                  ))}
                </ul>
              )}

              <Button className="w-full" asChild>
                <Link href={`/checkout/subscription/${plan.id}`}>
                  {userSubscription?.plan_id === plan.id ? "Current Plan" : "Subscribe"}
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
