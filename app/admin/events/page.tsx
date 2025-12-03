import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { AdminEventList } from "@/components/admin/admin-event-list"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Plus } from "lucide-react"

export default async function AdminEventsPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()

  const { data: events } = await supabase
    .from("events")
    .select("*, profiles(full_name, email)")
    .order("start_date", { ascending: true })

  return (
    <div className="container mx-auto p-4 md:p-6 max-w-7xl">
      <div className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl md:text-4xl font-bold mb-2">Event Management</h1>
          <p className="text-muted-foreground text-sm md:text-base">Create and manage all platform events</p>
        </div>
        <Link href="/admin/events/create" className="w-full md:w-auto">
          <Button className="w-full md:w-auto">
            <Plus className="h-4 w-4 mr-2" />
            Create Event
          </Button>
        </Link>
      </div>

      <AdminEventList events={events || []} />
    </div>
  )
}
