"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Edit, Trash2, Loader2, AlertCircle } from "lucide-react"
import Link from "next/link"
import { createClient } from "@/lib/supabase/client"

interface Affiliate {
  id: string
  name: string
  city: string | null
  state: string | null
  country: string | null
  approval_status: string
}

export function AffiliatesTable({ affiliates: initialAffiliates }: { affiliates: Affiliate[] }) {
  const [affiliates, setAffiliates] = useState(initialAffiliates)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [selectedAffiliateId, setSelectedAffiliateId] = useState<string | null>(null)
  const [selectedAffiliateName, setSelectedAffiliateName] = useState<string | null>(null)
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedAffiliateId(id)
    setSelectedAffiliateName(name)
    setDeleteDialogOpen(true)
    setError(null)
  }

  const confirmDelete = async () => {
    if (!selectedAffiliateId) return
    setIsDeleting(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from("affiliates")
        .delete()
        .eq("id", selectedAffiliateId)

      if (err) throw err

      setAffiliates(affiliates.filter((a) => a.id !== selectedAffiliateId))
      setDeleteDialogOpen(false)
      setSelectedAffiliateId(null)
      setSelectedAffiliateName(null)
    } catch (err) {
      console.error(err)
      setError("Error deleting affiliate. Please try again.")
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
            <TableHead>Business Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={4} className="text-center text-muted-foreground">
                No affiliates found
              </TableCell>
            </TableRow>
          ) : (
            affiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell className="font-medium">{affiliate.name}</TableCell>
                <TableCell>
                  {[affiliate.city, affiliate.state, affiliate.country].filter(Boolean).join(", ") || "—"}
                </TableCell>
                <TableCell>
                  <Badge 
                    variant={
                      affiliate.approval_status === "approved" 
                        ? "default" 
                        : affiliate.approval_status === "rejected"
                        ? "destructive"
                        : "secondary"
                    }
                  >
                    {affiliate.approval_status === "pending" && "Pending Review"}
                    {affiliate.approval_status === "approved" && "Approved"}
                    {affiliate.approval_status === "rejected" && "Rejected"}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/affiliates/${affiliate.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleDeleteClick(affiliate.id, affiliate.name)}
                      className="hover:text-destructive"
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

      <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Delete Affiliate</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete <span className="font-semibold">{selectedAffiliateName}</span>? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>

          {error && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setDeleteDialogOpen(false)}
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={confirmDelete}
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                "Delete"
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
