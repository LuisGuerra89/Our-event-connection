"use client"

import { useState } from "react"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Search, KeyRound } from "lucide-react"
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog"

type Profile = {
  id: string
  email: string
  full_name: string | null
  role_id: string | null
  created_at: string
  location_city: string | null
  location_state: string | null
  roles: {
    id: string
    role_name: string
    description: string | null
  } | null
}

export function UserManagementTable({ users }: { users: Profile[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [resetPasswordUser, setResetPasswordUser] = useState<Profile | null>(null)

  const filteredUsers = users.filter(
    (user) =>
      user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      user.full_name?.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by email or name..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      <div className="border rounded-lg">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Location</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.email}</TableCell>
                <TableCell>{user.full_name || "-"}</TableCell>
                <TableCell>
                  {user.location_city && user.location_state ? `${user.location_city}, ${user.location_state}` : "-"}
                </TableCell>
                <TableCell>
                  <Badge variant="secondary">{user.roles?.role_name || "user"}</Badge>
                </TableCell>
                <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => setResetPasswordUser(user)}
                    title="Reset Password"
                  >
                    <KeyRound className="h-4 w-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {filteredUsers.length === 0 && <div className="text-center py-12 text-muted-foreground">No users found</div>}

      {resetPasswordUser && (
        <ResetPasswordDialog
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          userId={resetPasswordUser.id}
          userName={resetPasswordUser.full_name || "User"}
          userEmail={resetPasswordUser.email}
        />
      )}
    </div>
  )
}
