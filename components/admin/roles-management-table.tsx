"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Shield } from "lucide-react"
import Link from "next/link"

interface Role {
  id: string
  role_name: string
  description: string | null
  status: string
  created_at: string
  profiles?: { count: number }[]
}

export function RolesManagementTable({ roles }: { roles: Role[] }) {
  const getUserCount = (role: Role) => {
    return role.profiles?.[0]?.count || 0
  }

  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Role Name</TableHead>
            <TableHead>Description</TableHead>
            <TableHead>Status</TableHead>
            <TableHead>Users</TableHead>
            <TableHead>Created</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {roles.length === 0 ? (
            <TableRow>
              <TableCell colSpan={6} className="text-center text-muted-foreground">
                No roles found
              </TableCell>
            </TableRow>
          ) : (
            roles.map((role) => (
              <TableRow key={role.id}>
                <TableCell className="font-medium">{role.role_name}</TableCell>
                <TableCell>{role.description || "—"}</TableCell>
                <TableCell>
                  <Badge variant={role.status === "active" ? "default" : "secondary"}>{role.status}</Badge>
                </TableCell>
                <TableCell>{getUserCount(role)}</TableCell>
                <TableCell>{new Date(role.created_at).toLocaleDateString()}</TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/roles/${role.id}/edit`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/roles/${role.id}/privileges`}>
                        <Shield className="h-4 w-4" />
                      </Link>
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
