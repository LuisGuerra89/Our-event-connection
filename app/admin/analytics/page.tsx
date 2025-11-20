import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Users, Calendar, DollarSign, UserCheck, UserX, TrendingUp } from "lucide-react"

export default async function AdminAnalyticsPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today)
  weekAgo.setDate(weekAgo.getDate() - 7)
  const monthAgo = new Date(today)
  monthAgo.setMonth(monthAgo.getMonth() - 1)
  const halfYearAgo = new Date(today)
  halfYearAgo.setMonth(halfYearAgo.getMonth() - 6)
  const yearAgo = new Date(today)
  yearAgo.setFullYear(yearAgo.getFullYear() - 1)

  // Events statistics
  const [{ count: upcomingEvents }, { count: ongoingEvents }, { count: pastEvents }, { count: totalEvents }] =
    await Promise.all([
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .gt("start_date", now.toISOString())
        .eq("status", "published"),
      supabase
        .from("events")
        .select("*", { count: "exact", head: true })
        .lte("start_date", now.toISOString())
        .gte("end_date", now.toISOString())
        .eq("status", "published"),
      supabase.from("events").select("*", { count: "exact", head: true }).lt("end_date", now.toISOString()),
      supabase.from("events").select("*", { count: "exact", head: true }),
    ])

  // Customer registrations by time period
  const [
    { count: customersToday },
    { count: customersWeek },
    { count: customersMonth },
    { count: customersHalfYear },
    { count: customersYear },
    { count: totalCustomers },
  ] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", today.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", weekAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", monthAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", halfYearAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }).gte("created_at", yearAgo.toISOString()),
    supabase.from("profiles").select("*", { count: "exact", head: true }),
  ])

  // Gender statistics
  const [{ count: maleCustomers }, { count: femaleCustomers }] = await Promise.all([
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("gender", "male"),
    supabase.from("profiles").select("*", { count: "exact", head: true }).eq("gender", "female"),
  ])

  // Revenue statistics
  const { data: payments } = await supabase
    .from("payments")
    .select("total_amount, payment_status, created_at")
    .eq("payment_status", "success")

  const totalRevenue = payments?.reduce((sum, p) => sum + (Number.parseFloat(p.total_amount) || 0), 0) || 0

  // Tickets sold
  const { count: ticketsSold } = await supabase.from("event_attendees").select("*", { count: "exact", head: true })

  // Recent activities
  const { data: recentUsers } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  const { data: recentEvents } = await supabase
    .from("events")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(5)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard Analytics</h1>
        <p className="text-muted-foreground">Comprehensive platform statistics and insights</p>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Events Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{upcomingEvents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ongoing Events</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{ongoingEvents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Past Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{pastEvents || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalEvents || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div>
        <h2 className="text-xl font-semibold mb-4">Customer Registrations</h2>
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Today</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersToday || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Week</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersWeek || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Month</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersMonth || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Half Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersHalfYear || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">This Year</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customersYear || 0}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">All Time</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{totalCustomers || 0}</div>
            </CardContent>
          </Card>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Male Customers</CardTitle>
            <UserCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{maleCustomers || 0}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Female Customers</CardTitle>
            <UserX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{femaleCustomers || 0}</div>
          </CardContent>
        </Card>

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
            <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{ticketsSold || 0}</div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle>Recent User Registrations</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentUsers?.map((user) => (
                <div key={user.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">
                      {user.first_name} {user.last_name || user.full_name || "No name"}
                    </p>
                    <p className="text-sm text-muted-foreground">{user.email}</p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(user.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Recently Created Events</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentEvents?.map((event) => (
                <div key={event.id} className="flex items-center justify-between">
                  <div>
                    <p className="font-medium">{event.title}</p>
                    <p className="text-sm text-muted-foreground">
                      {event.location_city}, {event.location_state}
                    </p>
                  </div>
                  <p className="text-sm text-muted-foreground">{new Date(event.created_at).toLocaleDateString()}</p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
