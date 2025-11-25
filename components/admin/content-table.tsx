"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
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
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

interface Content {
  id: string
  page_key: string
  title: string
  status: string
  updated_at: string
}

// Default content pages that cannot be deleted
const DEFAULT_PAGES = ["terms_conditions", "privacy_policy", "faq", "about_us", "how_it_works"]

export function ContentTable({ content: initialContent }: { content: Content[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [content, setContent] = useState(initialContent)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [contentToDelete, setContentToDelete] = useState<Content | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)

  const isDefaultPage = (pageKey: string) => DEFAULT_PAGES.includes(pageKey)

  const handleDeleteClick = (page: Content) => {
    setContentToDelete(page)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!contentToDelete) return

    setIsDeleting(true)
    try {
      const supabase = createBrowserClient()
      const { error } = await supabase.from("cms_content").delete().eq("id", contentToDelete.id)

      if (error) throw error

      // Remove the deleted content from local state
      setContent((prev) => prev.filter((c) => c.id !== contentToDelete.id))

      toast({
        title: "Success",
        description: "Content deleted successfully",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete content",
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteDialogOpen(false)
      setContentToDelete(null)
    }
  }

  return (
    <>
      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Title</TableHead>
              <TableHead>Page Key</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Last Updated</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {content.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  No content pages found
                </TableCell>
              </TableRow>
            ) : (
              content.map((page) => {
                const isDefault = isDefaultPage(page.page_key)
                return (
                  <TableRow key={page.id}>
                    <TableCell className="font-medium">{page.title}</TableCell>
                    <TableCell>{page.page_key}</TableCell>
                    <TableCell>
                      <Badge variant={page.status === "active" ? "default" : "secondary"}>{page.status}</Badge>
                    </TableCell>
                    <TableCell>{new Date(page.updated_at).toLocaleDateString()}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button variant="ghost" size="icon" asChild title="Edit Content">
                          <Link href={`/admin/content/${page.id}`}>
                            <Edit className="h-4 w-4" />
                          </Link>
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDeleteClick(page)}
                          title={isDefault ? "Cannot delete default content" : "Delete Content"}
                          disabled={isDefault || isDeleting}
                          className={isDefault ? "opacity-50 cursor-not-allowed" : ""}
                        >
                          <Trash2 className={`h-4 w-4 ${isDefault ? "text-muted-foreground" : "text-destructive"}`} />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the content page "{contentToDelete?.title}". This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isDeleting} className="bg-destructive">
              {isDeleting ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
