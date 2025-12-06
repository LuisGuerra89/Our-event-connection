import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { EventList } from "@/components/event-list"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, Gift, Heart, MessageSquare } from "lucide-react"
import Link from "next/link"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  // Fetch profile with referral count and role
  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, full_name, referral_count, roles(role_name)")
    .eq("id", data.user.id)
    .single()

  // Redirect admins to /admin
  if (profile?.roles?.role_name && profile.roles.role_name !== 'user') {
    redirect("/admin")
  }

  // Check if user signed waiver
  const { data: waiver } = await supabase.from("waivers").select("id").eq("user_id", data.user.id).maybeSingle()

  if (!waiver) {
    redirect("/onboarding/waiver")
  }

  // Fetch stats in parallel
  const [
    { count: matchesCount },
    { count: conversationsCount },
    { count: myEventsCount },
    { data: upcomingEvents }
  ] = await Promise.all([
    supabase.from("matches").select("*", { count: 'exact', head: true }).eq("user_id", data.user.id),
    supabase.from("chat_conversations").select("*", { count: 'exact', head: true }).or(`user1_id.eq.${data.user.id},user2_id.eq.${data.user.id}`),
    supabase.from("event_registrations").select("*", { count: 'exact', head: true }).eq("user_id", data.user.id).eq("status", "confirmed"),
    supabase
      .from("events")
      .select("*")
      .in("status", ["upcoming", "ongoing"])
      .gte("end_date", new Date().toISOString())
      .order("start_date", { ascending: true })
      .limit(6)
  ])

  const firstName = profile?.full_name?.split(' ')[0] || 'there'

  return (
    <div className="container mx-auto px-6 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
        <p className="text-muted-foreground">Here's an overview of your activity and upcoming events.</p>
      </div>

      {/* Stats Grid */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4 mb-10">
        <Link href="/dashboard/matches">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Matches</CardTitle>
              <Heart className="h-4 w-4 text-pink-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{matchesCount || 0}</div>
              <p className="text-xs text-muted-foreground">People you've matched with</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/chat">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Conversations</CardTitle>
              <MessageSquare className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{conversationsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Active chats</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/referrals">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Referrals</CardTitle>
              <Gift className="h-4 w-4 text-purple-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{profile?.referral_count || 0}</div>
              <p className="text-xs text-muted-foreground">Friends you've invited</p>
            </CardContent>
          </Card>
        </Link>

        <Link href="/dashboard/events">
          <Card className="hover:shadow-md transition-shadow cursor-pointer h-full">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">My Events</CardTitle>
              <Calendar className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{myEventsCount || 0}</div>
              <p className="text-xs text-muted-foreground">Events you're registered for</p>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Events Section */}
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-2xl font-bold">Discover Events</h2>
          <Link href="/events" className="text-sm text-primary hover:underline">
            View all events
          </Link>
        </div>
        <EventList events={upcomingEvents || []} userId={data.user.id} />
      </div>
    </div>
  )
}
