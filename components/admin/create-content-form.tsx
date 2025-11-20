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

export function CreateContentForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    pageKey: "",
    title: "",
    content: "",
    status: "active",
    metaDescription: "",
    metaKeywords: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      // Convert title to page_key if not provided
      const pageKey =
        formData.pageKey ||
        formData.title
          .toLowerCase()
          .replace(/[^a-z0-9]+/g, "_")
          .replace(/^_|_$/g, "")

      const { error } = await supabase.from("cms_content").insert({
        page_key: pageKey,
        title: formData.title,
        content: formData.content,
        status: formData.status,
        meta_description: formData.metaDescription || null,
        meta_keywords: formData.metaKeywords || null,
      })

      if (error) throw error

      toast({
        title: "Success",
        description: "Content page created successfully",
      })

      router.push("/admin/content")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create content page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter page title"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="pageKey">
          Page Key <span className="text-muted-foreground">(auto-generated if empty)</span>
        </Label>
        <Input
          id="pageKey"
          value={formData.pageKey}
          onChange={(e) =>
            setFormData({
              ...formData,
              pageKey: e.target.value
                .toLowerCase()
                .replace(/[^a-z0-9_]/g, "")
                .replace(/_+/g, "_"),
            })
          }
          placeholder="e.g., about_us, terms_conditions"
        />
        <p className="text-xs text-muted-foreground">Unique identifier for the page (lowercase, underscores only)</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">
          Content <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter page content"
          rows={12}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">Supports HTML and markdown formatting</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaDescription">Meta Description (Optional)</Label>
        <Textarea
          id="metaDescription"
          value={formData.metaDescription}
          onChange={(e) => setFormData({ ...formData, metaDescription: e.target.value })}
          placeholder="Enter meta description for SEO"
          rows={3}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="metaKeywords">Meta Keywords (Optional)</Label>
        <Input
          id="metaKeywords"
          value={formData.metaKeywords}
          onChange={(e) => setFormData({ ...formData, metaKeywords: e.target.value })}
          placeholder="keyword1, keyword2, keyword3"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="status">
          Status <span className="text-destructive">*</span>
        </Label>
        <Select required value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value })}>
          <SelectTrigger>
            <SelectValue placeholder="Select status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="inactive">Inactive</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="flex gap-4">
        <Button type="submit" disabled={isLoading}>
          {isLoading ? "Creating..." : "Create Content Page"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
