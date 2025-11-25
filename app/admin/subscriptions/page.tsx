import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { SubscriptionPlansTable } from "@/components/admin/subscription-plans-table"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function SubscriptionsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role_id, roles(role_name)").eq("id", user.id).single()
  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") redirect("/dashboard")

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Subscription Plans</h1>
          <p className="text-muted-foreground">Manage membership and subscription plans</p>
        </div>
        <Button asChild>
          <Link href="/admin/subscriptions/create">
            <Plus className="h-4 w-4 mr-2" />
            Add Plan
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Plans</CardTitle>
          <CardDescription>View and manage subscription offerings</CardDescription>
        </CardHeader>
        <CardContent>
          <SubscriptionPlansTable plans={plans || []} />
        </CardContent>
      </Card>
    </div>
  )
}
