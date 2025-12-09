import { createServerClient } from "@/lib/supabase/server"
import { redirect } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { ArrowLeft, Mail, User, Calendar, CheckCircle, AlertCircle } from "lucide-react"
import { Badge } from "@/components/ui/badge"

export default async function ContactDetailPage({
  params,
}: {
  params: Promise<{ id: string }>
}) {
  const { id } = await params
  const supabase = await createServerClient()
  
  const {
    data: { user },
  } = await supabase.auth.getUser()

  if (!user) redirect("/auth/login")

  const { data: profile } = await supabase
    .from("profiles")
    .select("role_id, roles(role_name)")
    .eq("id", user.id)
    .single()
  
  const profileWithRole = profile as { role_id: string; roles: { role_name: string } } | null
  if (!profileWithRole || profileWithRole.roles?.role_name !== "admin") redirect("/dashboard")

  const { data: contact } = await supabase
    .from("contact_submissions")
    .select("*")
    .eq("id", id)
    .single()

  if (!contact) {
    redirect("/admin/contacts")
  }

  const statusColors = {
    new: "bg-blue-100 text-blue-800 hover:bg-blue-100",
    read: "bg-gray-100 text-gray-800 hover:bg-gray-100",
    responded: "bg-green-100 text-green-800 hover:bg-green-100",
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "new":
        return <AlertCircle className="h-4 w-4" />
      case "read":
        return <Mail className="h-4 w-4" />
      case "responded":
        return <CheckCircle className="h-4 w-4" />
      default:
        return null
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-4xl">
      {/* Header with back button */}
      <div className="mb-8 flex items-center gap-4">
        <Button variant="ghost" size="sm" asChild>
          <Link href="/admin/contacts" className="flex items-center gap-2">
            <ArrowLeft className="h-4 w-4" />
            Back to Contacts
          </Link>
        </Button>
      </div>

      {/* Main content */}
      <Card className="border-2">
        <CardHeader className="bg-muted/50">
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-2xl mb-2 flex items-center gap-3">
                <User className="h-6 w-6" />
                {contact.name}
              </CardTitle>
              <CardDescription className="text-base flex items-center gap-2">
                <Mail className="h-4 w-4" />
                {contact.email}
              </CardDescription>
            </div>
            <div className="flex flex-col gap-2 items-end">
              <Badge className={statusColors[contact.status as keyof typeof statusColors]}>
                <span className="mr-1">{getStatusIcon(contact.status)}</span>
                {contact.status.charAt(0).toUpperCase() + contact.status.slice(1)}
              </Badge>
              {contact.suggest_event && (
                <Badge variant="outline" className="border-primary text-primary">
                  Event Suggestion
                </Badge>
              )}
            </div>
          </div>
        </CardHeader>
        <CardContent className="pt-8">
          <div className="space-y-8">
            {/* Subject */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Subject</h3>
              <p className="text-lg font-medium">{contact.subject || "No subject provided"}</p>
            </div>

            {/* Message */}
            <div>
              <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Message</h3>
              <div className="bg-muted/30 rounded-lg p-6 border border-muted">
                <p className="whitespace-pre-wrap text-base leading-relaxed">{contact.message}</p>
              </div>
            </div>

            {/* Metadata */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-6 border-t">
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2 flex items-center gap-2">
                  <Calendar className="h-4 w-4" />
                  Submitted
                </h3>
                <p className="text-base">
                  {new Date(contact.created_at).toLocaleString("en-US", {
                    year: "numeric",
                    month: "long",
                    day: "numeric",
                    hour: "2-digit",
                    minute: "2-digit",
                  })}
                </p>
              </div>
              <div>
                <h3 className="text-sm font-semibold text-muted-foreground uppercase mb-2">Contact ID</h3>
                <p className="text-base font-mono text-xs break-all">{contact.id}</p>
              </div>
            </div>

            {/* Suggestion info */}
            {contact.suggest_event && (
              <div className="bg-primary/5 border border-primary/20 rounded-lg p-4">
                <p className="text-sm text-muted-foreground">
                  <strong>This user is suggesting a future event idea.</strong> Consider reviewing their message for potential event concepts.
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action buttons */}
      <div className="mt-8 flex gap-4">
        <Button asChild variant="outline">
          <a href={`mailto:${contact.email}`}>Reply via Email</a>
        </Button>
      </div>
    </div>
  )
}
