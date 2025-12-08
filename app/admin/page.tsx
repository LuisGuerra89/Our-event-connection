import { redirect } from "next/navigation"
import { isAdmin, hasPrivilege, getCurrentUser } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Users, Calendar, DollarSign, Ticket, UserCircle2, CalendarCheck, CalendarClock, CalendarX, BarChart3 } from "lucide-react"
import Link from "next/link"
import { Badge } from "@/components/ui/badge"
import { TrafficAnalyticsPanel } from "@/components/admin/traffic-analytics-panel"
import { RegistrationTrendsChart } from "@/components/admin/registration-trends-chart"

export default async function AdminDashboard() {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  // For admin users, grant access (admins have all privileges by default)
  // For other roles, check specific privilege
  const currentUser = await getCurrentUser()
  if (!currentUser) {
    redirect("/auth/login")
  }

  const supabase = await createServerClient()

  const now = new Date()
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
  const weekAgo = new Date(today.getTime() - 7 * 24 * 60 * 60 * 1000)
  const monthAgo = new Date(today.getFullYear(), today.getMonth() - 1, today.getDate())
  const halfYearAgo = new Date(today.getFullYear(), today.getMonth() - 6, today.getDate())
  const yearAgo = new Date(today.getFullYear() - 1, today.getMonth(), today.getDate())

  // Fetch all data in parallel
  const [
    { data: allProfiles },
    { data: events },
    { data: payments },
    { data: eventAttendees },
  ] = await Promise.all([
    supabase.from("profiles").select("id, gender, created_at"),
    supabase.from("events").select("id, start_date, end_date, status"),
    supabase.from("payments").select("total_amount, payment_status, created_at"),
    supabase.from("event_attendees").select("id"),
  ])

  // Calculate customer registrations by time period
  const customersToday = allProfiles?.filter(p => 
    new Date(p.created_at) >= today
  ).length || 0

  const customersThisWeek = allProfiles?.filter(p => 
    new Date(p.created_at) >= weekAgo
  ).length || 0

  const customersThisMonth = allProfiles?.filter(p => 
    new Date(p.created_at) >= monthAgo
  ).length || 0

  const customersHalfYear = allProfiles?.filter(p => 
    new Date(p.created_at) >= halfYearAgo
  ).length || 0

  const customersThisYear = allProfiles?.filter(p => 
    new Date(p.created_at) >= yearAgo
  ).length || 0

  // Gender statistics
  const maleCustomers = allProfiles?.filter(p => 
    p.gender?.toLowerCase() === 'male'
  ).length || 0

  const femaleCustomers = allProfiles?.filter(p => 
    p.gender?.toLowerCase() === 'female'
  ).length || 0

  // Event statistics
  const upcomingEvents = events?.filter(e => {
    const startDate = new Date(e.start_date)
    return startDate > now && e.status !== 'cancelled'
  }).length || 0

  const ongoingEvents = events?.filter(e => {
    const startDate = new Date(e.start_date)
    const endDate = new Date(e.end_date)
    return startDate <= now && endDate >= now && e.status !== 'cancelled'
  }).length || 0

  const pastEvents = events?.filter(e => {
    const endDate = new Date(e.end_date)
    return endDate < now
  }).length || 0

  // Revenue statistics
  const totalRevenue = payments?.filter(p => 
    p.payment_status === 'success'
  ).reduce((sum, p) => sum + Number(p.total_amount), 0) || 0

  // Tickets sold (event attendees)
  const ticketsSold = eventAttendees?.length || 0

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Admin Dashboard</h1>
        <p className="text-muted-foreground">Overview of platform metrics and statistics</p>
      </div>

      <Tabs defaultValue="overview" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="overview" className="flex items-center gap-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="traffic" className="flex items-center gap-2">
            <Users className="h-4 w-4" />
            <span>Traffic Analytics</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Events Summary</h2>
        <div className="grid gap-4 md:grid-cols-3">
          <Link href="/admin/events?tab=upcoming">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Upcoming Events</CardTitle>
                <CalendarClock className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{upcomingEvents}</div>
                <p className="text-xs text-muted-foreground">Events scheduled for the future</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/events?tab=ongoing">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Ongoing Events</CardTitle>
                <CalendarCheck className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">{ongoingEvents}</div>
                <p className="text-xs text-muted-foreground">Currently active events</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/events?tab=past">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Past Events</CardTitle>
                <CalendarX className="h-4 w-4 text-gray-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-gray-600">{pastEvents}</div>
                <p className="text-xs text-muted-foreground">Completed events</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Customer Registrations Chart */}
      <RegistrationTrendsChart
        customersToday={customersToday}
        customersThisWeek={customersThisWeek}
        customersThisMonth={customersThisMonth}
        customersHalfYear={customersHalfYear}
        customersThisYear={customersThisYear}
      />

      {/* Key Metrics */}
      <div className="mb-6">
        <h2 className="text-2xl font-semibold mb-4">Key Metrics</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Male Candidates</CardTitle>
                <UserCircle2 className="h-4 w-4 text-blue-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-blue-600">{maleCustomers}</div>
                <p className="text-xs text-muted-foreground">Total male users</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/users">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Female Candidates</CardTitle>
                <UserCircle2 className="h-4 w-4 text-pink-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-pink-600">{femaleCustomers}</div>
                <p className="text-xs text-muted-foreground">Total female users</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/payments">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Total Revenue</CardTitle>
                <DollarSign className="h-4 w-4 text-green-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-green-600">${totalRevenue.toFixed(2)}</div>
                <p className="text-xs text-muted-foreground">All successful payments</p>
              </CardContent>
            </Card>
          </Link>

          <Link href="/admin/events">
            <Card className="hover:shadow-lg transition-shadow cursor-pointer">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Tickets Sold</CardTitle>
                <Ticket className="h-4 w-4 text-purple-500" />
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-purple-600">{ticketsSold}</div>
                <p className="text-xs text-muted-foreground">Event registrations</p>
              </CardContent>
            </Card>
          </Link>
        </div>
      </div>

      {/* Quick Stats */}
      <div>
        <h2 className="text-2xl font-semibold mb-4">Platform Overview</h2>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{allProfiles?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All registered users</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Events</CardTitle>
              <Calendar className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{events?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All events created</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Total Payments</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">{payments?.length || 0}</div>
              <p className="text-xs text-muted-foreground">All transactions</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Avg. Ticket Price</CardTitle>
              <Ticket className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-3xl font-bold">
                ${ticketsSold > 0 ? (totalRevenue / ticketsSold).toFixed(2) : "0.00"}
              </div>
              <p className="text-xs text-muted-foreground">Revenue per ticket</p>
            </CardContent>
          </Card>
        </div>
      </div>
        </TabsContent>

        <TabsContent value="traffic" className="space-y-6">
          <TrafficAnalyticsPanel />
        </TabsContent>
      </Tabs>
    </div>
  )
}
