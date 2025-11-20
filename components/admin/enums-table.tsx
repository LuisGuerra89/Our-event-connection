"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import { Edit, Trash2, Search } from "lucide-react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"

interface Enum {
  id: string
  enum_type: string
  enum_title: string
  parent_type: string | null
  parent_value: string | null
  display_order: number
  status: string
}

export function EnumsTable({ enums }: { enums: Enum[] }) {
  const [searchTerm, setSearchTerm] = useState("")
  const [deleteId, setDeleteId] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const router = useRouter()
  const { toast } = useToast()

  const filteredEnums = enums.filter(
    (item) =>
      item.enum_type.toLowerCase().includes(searchTerm.toLowerCase()) ||
      item.enum_title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (item.parent_type && item.parent_type.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (item.parent_value && item.parent_value.toLowerCase().includes(searchTerm.toLowerCase())),
  )

  const handleDelete = async () => {
    if (!deleteId) return

    setIsDeleting(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("enums").delete().eq("id", deleteId)

      if (error) throw error

      toast({
        title: "Success",
        description: "Enum deleted successfully",
      })
      router.refresh()
    } catch (error) {
      console.error("Error deleting enum:", error)
      toast({
        title: "Error",
        description: "Failed to delete enum",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }
  const groupedEnums = filteredEnums.reduce(
    (acc, item) => {
      if (!acc[item.enum_type]) acc[item.enum_type] = []
      acc[item.enum_type].push(item)
      return acc
    },
    {} as Record<string, Enum[]>,
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by type, title, or parent..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-9"
          />
        </div>
      </div>

      {Object.entries(groupedEnums).map(([type, items]) => (
        <div key={type} className="rounded-md border">
          <div className="bg-muted px-4 py-2">
            <h3 className="font-semibold capitalize">{type.replace(/_/g, " ")}</h3>
          </div>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Order</TableHead>
                <TableHead>Title</TableHead>
                <TableHead>Parent</TableHead>
                <TableHead>Status</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {items.map((item) => (
                <TableRow key={item.id}>
                  <TableCell>{item.display_order}</TableCell>
                  <TableCell className="font-medium">{item.enum_title}</TableCell>
                  <TableCell className="text-muted-foreground">
                    {item.parent_type && item.parent_value ? `${item.parent_type}: ${item.parent_value}` : "—"}
                  </TableCell>
                  <TableCell>
                    <Badge variant={item.status === "active" ? "default" : "secondary"}>{item.status}</Badge>
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex justify-end gap-2">
                      <Button variant="ghost" size="icon" asChild>
                        <Link href={`/admin/enums/${item.id}`}>
                          <Edit className="h-4 w-4" />
                        </Link>
                      </Button>
                      <Button variant="ghost" size="icon" onClick={() => setDeleteId(item.id)}>
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ))}

      <AlertDialog open={!!deleteId} onOpenChange={(open) => !open && setDeleteId(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This action cannot be undone. This will permanently delete this enum value.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} disabled={isDeleting}>
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}
