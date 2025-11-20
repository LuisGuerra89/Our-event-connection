import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import CreateEventForm from "@/components/admin/create-event-form"

export default async function CreateEventPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  return (
    <div className="container mx-auto p-6 max-w-3xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Create Event</h1>
        <p className="text-muted-foreground">Create a new event for the platform</p>
      </div>

      <CreateEventForm />
    </div>
  )
}
