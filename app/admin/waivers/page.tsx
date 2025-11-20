import { redirect } from "next/navigation"
import { isAdmin } from "@/lib/auth-utils"
import { createServerClient } from "@/lib/supabase/server"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"

export default async function AdminWaiversPage() {
  const admin = await isAdmin()
  if (!admin) {
    redirect("/dashboard")
  }

  const supabase = await createServerClient()

  const { data: waivers } = await supabase
    .from("waivers")
    .select("*, profiles(email, full_name)")
    .order("created_at", { ascending: false })

  return (
    <div className="container mx-auto p-6 max-w-7xl">
      <div className="mb-8">
        <h1 className="text-4xl font-bold mb-2">Liability Waivers</h1>
        <p className="text-muted-foreground">View all signed liability waivers</p>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Email</TableHead>
              <TableHead>Signed Name</TableHead>
              <TableHead>IP Address</TableHead>
              <TableHead>Version</TableHead>
              <TableHead>Signed At</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {waivers?.map((waiver) => (
              <TableRow key={waiver.id}>
                <TableCell className="font-medium">{waiver.profiles?.full_name || "-"}</TableCell>
                <TableCell>{waiver.profiles?.email}</TableCell>
                <TableCell>{waiver.full_name}</TableCell>
                <TableCell className="font-mono text-sm">{waiver.ip_address}</TableCell>
                <TableCell>{waiver.waiver_version}</TableCell>
                <TableCell>{new Date(waiver.agreed_at).toLocaleString()}</TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>

        {(!waivers || waivers.length === 0) && (
          <div className="text-center py-12 text-muted-foreground">No waivers found</div>
        )}
      </div>
    </div>
  )
}
