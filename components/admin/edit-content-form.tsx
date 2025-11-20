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

interface ContentPage {
  id: string
  page_key: string
  title: string
  content: string
  subtitle?: string | null
  banner_image?: string | null
  secondary_content?: string | null
  meta_description?: string | null
  meta_keywords?: string | null
  status: string
}

export function EditContentForm({ contentPage }: { contentPage: ContentPage }) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [formData, setFormData] = useState({
    title: contentPage.title,
    subtitle: contentPage.subtitle || "",
    bannerImage: contentPage.banner_image || "",
    content: contentPage.content,
    secondaryContent: contentPage.secondary_content || "",
    status: contentPage.status,
    metaDescription: contentPage.meta_description || "",
    metaKeywords: contentPage.meta_keywords || "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    try {
      const supabase = createBrowserClient()

      const { error } = await supabase
        .from("cms_content")
        .update({
          title: formData.title,
          subtitle: formData.subtitle || null,
          banner_image: formData.bannerImage || null,
          content: formData.content,
          secondary_content: formData.secondaryContent || null,
          status: formData.status,
          meta_description: formData.metaDescription || null,
          meta_keywords: formData.metaKeywords || null,
          updated_at: new Date().toISOString(),
        })
        .eq("id", contentPage.id)

      if (error) throw error

      toast({
        title: "Success",
        description: "Content page updated successfully",
      })

      router.push("/admin/content")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update content page",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="pageKey">Page Key (Read-only)</Label>
        <Input id="pageKey" value={contentPage.page_key} disabled className="bg-muted" />
      </div>

      <div className="space-y-2">
        <Label htmlFor="title">
          Title <span className="text-destructive">*</span>
        </Label>
        <Input
          id="title"
          required
          value={formData.title}
          onChange={(e) => setFormData({ ...formData, title: e.target.value })}
          placeholder="Enter page title (shown in hero banner)"
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="subtitle">Subtitle (Optional)</Label>
        <Input
          id="subtitle"
          value={formData.subtitle}
          onChange={(e) => setFormData({ ...formData, subtitle: e.target.value })}
          placeholder="Enter subtitle for hero banner"
        />
        <p className="text-xs text-muted-foreground">Displayed below the title in the hero section</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="bannerImage">Banner Image URL (Optional)</Label>
        <Input
          id="bannerImage"
          type="url"
          value={formData.bannerImage}
          onChange={(e) => setFormData({ ...formData, bannerImage: e.target.value })}
          placeholder="https://example.com/banner.jpg"
        />
        <p className="text-xs text-muted-foreground">Background image for the hero banner</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="content">
          Main Content (HTML) <span className="text-destructive">*</span>
        </Label>
        <Textarea
          id="content"
          required
          value={formData.content}
          onChange={(e) => setFormData({ ...formData, content: e.target.value })}
          placeholder="Enter HTML content with full formatting support"
          rows={12}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Full HTML support: Use tags like &lt;h2&gt;, &lt;p&gt;, &lt;ul&gt;, &lt;div&gt;, &lt;img&gt;, etc.
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="secondaryContent">Secondary Content (HTML - Optional)</Label>
        <Textarea
          id="secondaryContent"
          value={formData.secondaryContent}
          onChange={(e) => setFormData({ ...formData, secondaryContent: e.target.value })}
          placeholder="Optional additional HTML content section"
          rows={8}
          className="font-mono text-sm"
        />
        <p className="text-xs text-muted-foreground">
          Optional section with different background - supports full HTML
        </p>
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
          {isLoading ? "Updating..." : "Update Content"}
        </Button>
        <Button type="button" variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </form>
  )
}
