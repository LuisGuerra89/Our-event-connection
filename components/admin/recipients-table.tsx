"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
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
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { PlusCircle, Pencil, Trash2, Search } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"

interface Recipient {
  id: string
  template_id: string
  first_name: string
  last_name: string
  email: string
  status: string
  email_templates?: { template_name: string }
}

interface Template {
  id: string
  template_name: string
}

export function RecipientsTable({ recipients, templates }: { recipients: Recipient[]; templates: Template[] }) {
  const router = useRouter()
  const { toast } = useToast()
  const [searchTerm, setSearchTerm] = useState("")
  const [isOpen, setIsOpen] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [recipientToDelete, setRecipientToDelete] = useState<Recipient | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [formData, setFormData] = useState({
    template_id: "",
    first_name: "",
    last_name: "",
    email: "",
    status: "active",
  })

  const supabase = createBrowserClient()

  const filteredRecipients = recipients.filter((recipient) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      recipient.first_name.toLowerCase().includes(searchLower) ||
      recipient.last_name.toLowerCase().includes(searchLower) ||
      recipient.email.toLowerCase().includes(searchLower) ||
      recipient.email_templates?.template_name.toLowerCase().includes(searchLower)
    )
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const data = {
        email_template_id: formData.template_id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        status: formData.status,
      }

      let error
      if (editingId) {
        const result = await supabase.from("email_recipients").update(data).eq("id", editingId)
        error = result.error
      } else {
        const result = await supabase.from("email_recipients").insert(data)
        error = result.error
      }

      if (error) throw error

      toast({
        title: "Success",
        description: `Recipient ${editingId ? "updated" : "created"} successfully`,
      })

      setIsOpen(false)
      setEditingId(null)
      setFormData({ template_id: "", first_name: "", last_name: "", email: "", status: "active" })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save recipient",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleEdit = (recipient: Recipient) => {
    setEditingId(recipient.id)
    setFormData({
      template_id: recipient.template_id,
      first_name: recipient.first_name,
      last_name: recipient.last_name,
      email: recipient.email,
      status: recipient.status,
    })
    setIsOpen(true)
  }

  const handleDeleteClick = (recipient: Recipient) => {
    setRecipientToDelete(recipient)
    setDeleteDialogOpen(true)
  }

  const handleDeleteConfirm = async () => {
    if (!recipientToDelete) return

    setIsLoading(true)
    try {
      const { error } = await supabase.from("email_recipients").delete().eq("id", recipientToDelete.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Recipient deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete recipient",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
      setDeleteDialogOpen(false)
      setRecipientToDelete(null)
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between gap-4">
        <div className="relative max-w-sm flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Search recipients..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="pl-10"
          />
        </div>
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() => {
                setEditingId(null)
                setFormData({ template_id: "", first_name: "", last_name: "", email: "", status: "active" })
              }}
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              {t("add_recipient")}
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingId ? t("edit_recipient") : t("add_recipient")}</DialogTitle>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="template_id">{t("email_template")}*</Label>
                <Select
                  value={formData.template_id}
                  onValueChange={(value) => setFormData({ ...formData, template_id: value })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder={t("select_template")} />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.template_name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="first_name">{t("first_name")}*</Label>
                <Input
                  id="first_name"
                  value={formData.first_name}
                  onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="last_name">{t("last_name")}*</Label>
                <Input
                  id="last_name"
                  value={formData.last_name}
                  onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">{t("email")}*</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="status">{t("status")}</Label>
                <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">{t("active")}</SelectItem>
                    <SelectItem value="inactive">{t("inactive")}</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="flex justify-end gap-2">
                <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                  {t("cancel")}
                </Button>
                <Button type="submit" disabled={isLoading}>
                  {isLoading ? "Saving..." : editingId ? t("update") : t("create")}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </div>

      <div className="rounded-md border">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>{t("template")}</TableHead>
              <TableHead>{t("name")}</TableHead>
              <TableHead>{t("email")}</TableHead>
              <TableHead>{t("status")}</TableHead>
              <TableHead className="text-right">{t("actions")}</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredRecipients.length === 0 ? (
              <TableRow>
                <TableCell colSpan={5} className="text-center text-muted-foreground">
                  {searchTerm ? "No recipients found matching your search" : "No recipients found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredRecipients.map((recipient) => (
              <TableRow key={recipient.id}>
                <TableCell>{recipient.email_templates?.template_name}</TableCell>
                <TableCell>
                  {recipient.first_name} {recipient.last_name}
                </TableCell>
                <TableCell>{recipient.email}</TableCell>
                <TableCell>
                  <Badge variant={recipient.status === "active" ? "default" : "secondary"}>{recipient.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button variant="ghost" size="sm" onClick={() => handleEdit(recipient)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                  <Button variant="ghost" size="sm" onClick={() => handleDeleteClick(recipient)}>
                    <Trash2 className="h-4 w-4 text-destructive" />
                  </Button>
                </TableCell>
              </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <AlertDialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Are you sure?</AlertDialogTitle>
            <AlertDialogDescription>
              This will permanently delete the recipient "{recipientToDelete?.first_name} {recipientToDelete?.last_name}". 
              This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isLoading}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteConfirm} disabled={isLoading} className="bg-destructive">
              {isLoading ? "Deleting..." : "Delete"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  )
}

// Helper function for translations
function t(key: string) {
  const translations: Record<string, string> = {
    recipients_management: "Recipients Management",
    manage_email_recipients: "Manage email recipients for templates",
    add_recipient: "Add Recipient",
    edit_recipient: "Edit Recipient",
    email_template: "Email Template",
    select_template: "Select template",
    first_name: "First Name",
    last_name: "Last Name",
    email: "Email",
    status: "Status",
    active: "Active",
    inactive: "Inactive",
    actions: "Actions",
    template: "Template",
    name: "Name",
    confirm_delete: "Are you sure you want to delete this recipient?",
    cancel: "Cancel",
    create: "Create",
    update: "Update",
  }
  return translations[key] || key
}
