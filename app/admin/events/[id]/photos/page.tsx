import { createServerClient } from "@/lib/supabase/server"
import { notFound } from "next/navigation"
import { EventPhotosManager } from "@/components/admin/event-photos-manager"

export default async function EventPhotosPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params
  const supabase = await createServerClient()

  const { data: event } = await supabase.from("events").select("*").eq("id", id).single()

  if (!event) {
    notFound()
  }

  const { data: photos } = await supabase
    .from("event_photos")
    .select("*")
    .eq("event_id", id)
    .order("display_order", { ascending: true })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">{event.title} - Photo Gallery</h1>
        <p className="text-muted-foreground">Manage photos and videos for this event</p>
      </div>

      <EventPhotosManager eventId={id} photos={photos || []} />
    </div>
  )
}
