import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { EditEventFormComplete } from "@/components/admin/edit-event-form-complete"

export default async function EditEventPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const { id } = await params
  const supabase = await createServerClient()

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single()

  if (!event) {
    redirect("/admin/events")
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Edit Event</h1>
        <p className="text-muted-foreground">Update event details and settings</p>
      </div>

      <EditEventFormComplete event={event} />
    </div>
  )
}
