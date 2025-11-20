import { redirect } from "next/navigation"
import { createServerClient } from "@/lib/supabase/server"
import { EventList } from "@/components/event-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function DashboardPage() {
  const supabase = await createServerClient()

  const { data, error } = await supabase.auth.getUser()
  if (error || !data?.user) {
    redirect("/auth/login")
  }

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

  // Check if user signed waiver
  const { data: waiver } = await supabase.from("waivers").select("id").eq("user_id", data.user.id).maybeSingle()

  if (!waiver) {
    redirect("/onboarding/waiver")
  }

  // Fetch events - only show upcoming and ongoing events that haven't ended yet
  const { data: events } = await supabase
    .from("events")
    .select("*")
    .in("status", ["upcoming", "ongoing"])
    .gte("end_date", new Date().toISOString())
    .order("start_date", { ascending: true })

  return (
    <div className="min-h-full">
      <header className="border-b bg-card sticky top-0 z-10">
        <div className="container mx-auto px-6 py-4 flex items-center justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground">Discover Events</h1>
            <p className="text-sm text-muted-foreground">Find and register for upcoming events</p>
          </div>
          <Button asChild>
            <Link href="/admin/events/create">
              <Plus className="h-4 w-4 mr-2" />
              Suggest Event
            </Link>
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-6 py-8">
        <EventList events={events || []} userId={data.user.id} />
      </main>
    </div>
  )
}
