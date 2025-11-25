import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { PaymentsTable } from "@/components/admin/payments-table"
import { DollarSign, TrendingUp, Users, Calendar } from "lucide-react"

export default async function PaymentsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  // Check if user is admin using the auth utility
  const adminCheck = await isAdmin(user.id)
  if (!adminCheck) redirect("/dashboard")

  // Get all payments with related data
  const { data: payments } = await supabase
    .from("payments")
    .select(`
      *,
      profiles:user_id (full_name, email),
      events:event_id (title)
    `)
    .order("payment_date", { ascending: false })
    .limit(500)

  // Get stats for calculations
  const { data: stats } = await supabase.from("payments").select("total_amount, payment_status, payment_date, created_at")

  // Calculate total revenue (successful payments only)
  const totalRevenue =
    stats?.filter((p) => p.payment_status === "success").reduce((sum, p) => sum + Number(p.total_amount || 0), 0) || 0

  // Count successful payments
  const successfulPayments = stats?.filter((p) => p.payment_status === "success").length || 0

  // Calculate this month's payments
  const now = new Date()
  const thisMonthStart = new Date(now.getFullYear(), now.getMonth(), 1)
  const thisMonthEnd = new Date(now.getFullYear(), now.getMonth() + 1, 0, 23, 59, 59)

  const thisMonthPayments = stats?.filter((p) => {
    const paymentDate = new Date(p.payment_date || p.created_at)
    return paymentDate >= thisMonthStart && paymentDate <= thisMonthEnd && p.payment_status === "success"
  }).length || 0

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Payment Management</h1>
        <p className="text-muted-foreground">View and track all payment transactions</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
            <DollarSign className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">${totalRevenue.toFixed(2)}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Successful Payments</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{successfulPayments}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Transactions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats?.length || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">This Month</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{thisMonthPayments}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Recent Payments</CardTitle>
          <CardDescription>Latest payment transactions across the platform</CardDescription>
        </CardHeader>
        <CardContent>
          <PaymentsTable payments={payments || []} />
        </CardContent>
      </Card>
    </div>
  )
}
