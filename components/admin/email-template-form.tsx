"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { createBrowserClient } from "@/lib/supabase/client"

interface EmailTemplate {
  id: string
  template_name: string
  subject: string
  content: string
  status: string
}

interface EmailTemplateFormProps {
  template?: EmailTemplate
}

export function EmailTemplateForm({ template }: EmailTemplateFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    templateName: template?.template_name || "",
    subject: template?.subject || "",
    content: template?.content || "",
    status: template?.status || "active",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createBrowserClient()
      const data = {
        template_name: formData.templateName,
        subject: formData.subject,
        content: formData.content,
        status: formData.status,
        updated_at: new Date().toISOString(),
      }

      let error

      if (template) {
        // Update existing template
        const result = await supabase.from("email_templates").update(data).eq("id", template.id)
        error = result.error
      } else {
        // Create new template
        const result = await supabase.from("email_templates").insert(data)
        error = result.error
      }

      if (error) throw error

      toast({
        title: "Success",
        description: `Email template ${template ? "updated" : "created"} successfully`,
      })

      router.push("/admin/email-templates")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : `Failed to ${template ? "update" : "create"} template`,
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="templateName">Template Name *</Label>
          <Input
            id="templateName"
            required
            value={formData.templateName}
            onChange={(e) => setFormData({ ...formData, templateName: e.target.value })}
            placeholder="welcome_email"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="subject">Subject *</Label>
          <Input
            id="subject"
            required
            value={formData.subject}
            onChange={(e) => setFormData({ ...formData, subject: e.target.value })}
            placeholder="Welcome to our platform!"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="content">Content * (HTML Supported)</Label>
          <Textarea
            id="content"
            required
            value={formData.content}
            onChange={(e) => setFormData({ ...formData, content: e.target.value })}
            placeholder="<h1>Welcome!</h1><p>Thank you for joining us...</p>"
            rows={15}
            className="font-mono text-sm"
          />
          <p className="text-sm text-muted-foreground">
            You can use HTML tags to format your email content
          </p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? (template ? "Updating..." : "Creating...") : template ? "Update Template" : "Create Template"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
