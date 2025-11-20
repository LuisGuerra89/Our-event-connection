"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, KeyRound } from "lucide-react"
import Link from "next/link"
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog"

interface AdminUser {
  id: string
  user_id: string
  username: string
  first_name: string
  last_name: string | null
  email: string
  mobile: string | null
  status: string
  created_at: string
  roles?: {
    id: string
    role_name: string
  }
}

export function AdminUsersTable({ adminUsers }: { adminUsers: AdminUser[] }) {
  const [resetPasswordUser, setResetPasswordUser] = useState<AdminUser | null>(null)

  return (
    <>
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Username</TableHead>
            <TableHead>Name</TableHead>
            <TableHead>Email</TableHead>
            <TableHead>Role</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {adminUsers.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No admin users found
              </TableCell>
            </TableRow>
          ) : (
            adminUsers.map((user) => (
              <TableRow key={user.id}>
                <TableCell className="font-medium">{user.username}</TableCell>
                <TableCell>
                  {user.first_name} {user.last_name}
                </TableCell>
                <TableCell>{user.email}</TableCell>
                <TableCell>{user.roles?.role_name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={user.status === "active" ? "default" : "secondary"}>{user.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => setResetPasswordUser(user)}
                      title="Reset Password"
                    >
                      <KeyRound className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/admin-users/${user.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>

      {resetPasswordUser && (
        <ResetPasswordDialog
          open={!!resetPasswordUser}
          onOpenChange={(open) => !open && setResetPasswordUser(null)}
          userId={resetPasswordUser.user_id}
          userName={`${resetPasswordUser.first_name} ${resetPasswordUser.last_name || ""}`.trim()}
          userEmail={resetPasswordUser.email}
        />
      )}
    </>
  )
}
