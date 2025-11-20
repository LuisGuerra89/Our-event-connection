import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ContactsTable } from "@/components/admin/contacts-table"

export default async function ContactSubmissionsPage() {
  const supabase = await createServerClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase.from("profiles").select("role").eq("id", user.id).single()

  if (profile?.role !== "admin") redirect("/dashboard")

  const { data: contacts } = await supabase
    .from("contact_submissions")
    .select("*")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">Contact Submissions</h1>
        <p className="text-muted-foreground">View and manage contact form submissions</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Submissions</CardTitle>
          <CardDescription>Contact form messages from users</CardDescription>
        </CardHeader>
        <CardContent>
          <ContactsTable contacts={contacts || []} />
        </CardContent>
      </Card>
    </div>
  )
}
