"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2, KeyRound } from "lucide-react"
import Link from "next/link"
import { ResetPasswordDialog } from "@/components/admin/reset-password-dialog"
import { deleteAdminUser } from "@/app/admin/admin-users/actions"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { useToast } from "@/hooks/use-toast"

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
  const [deleteUser, setDeleteUser] = useState<AdminUser | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const { toast } = useToast()

  const handleDeleteConfirm = async () => {
    if (!deleteUser) return

    setIsDeleting(true)
    try {
      const result = await deleteAdminUser(deleteUser.id, deleteUser.user_id)

      if (result.success) {
        toast({
          title: "Success",
          description: result.message || "Admin user deleted successfully",
        })
        setDeleteUser(null)
        // Refresh the page
        window.location.reload()
      } else {
        toast({
          title: "Error",
          description: result.error || "Failed to delete admin user",
          variant: "destructive",
        })
      }
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete admin user",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
    }
  }

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
                    <Button 
                      variant="ghost" 
                      size="icon"
                      onClick={() => setDeleteUser(user)}
                    >
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

      <AlertDialog open={!!deleteUser} onOpenChange={(open) => !open && setDeleteUser(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Admin User</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete <strong>{deleteUser?.first_name} {deleteUser?.last_name}</strong> ({deleteUser?.email})?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <div className="space-y-3">
            <p className="text-sm text-muted-foreground">This will:</p>
            <ul className="ml-4 list-disc space-y-1 text-sm text-muted-foreground">
              <li>Remove the admin user from the database</li>
              <li>Delete their authentication account</li>
              <li>They will no longer be able to log in</li>
            </ul>
            <p className="text-sm font-semibold text-destructive">This action cannot be undone.</p>
          </div>
          <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
          <AlertDialogAction
            onClick={handleDeleteConfirm}
            disabled={isDeleting}
            className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
          >
            {isDeleting ? "Deleting..." : "Delete"}
          </AlertDialogAction>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
