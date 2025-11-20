"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PlusCircle, Trash2, Video, Loader2, X } from "lucide-react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"
import Image from "next/image"

interface Photo {
  id: string
  photo_url: string
  photo_type: string
  caption: string | null
  display_order: number
}

export function EventPhotosManager({ eventId, photos }: { eventId: string; photos: Photo[] }) {
  const [isOpen, setIsOpen] = useState(false)
  const [isUploading, setIsUploading] = useState(false)
  const [uploadedFiles, setUploadedFiles] = useState<string[]>([])
  const [formData, setFormData] = useState({
    photo_url: "",
    photo_type: "photo",
    caption: "",
    display_order: photos.length,
  })

  const supabase = createBrowserClient()
  const { toast } = useToast()
  const router = useRouter()

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files
    if (!files || files.length === 0) return

    setIsUploading(true)
    const uploadedUrls: string[] = []

    for (let i = 0; i < files.length; i++) {
      const file = files[i]
      
      // Validate file type
      const isImage = file.type.startsWith("image/")
      const isVideo = file.type.startsWith("video/")
      
      if (!isImage && !isVideo) {
        toast({
          title: "Invalid file",
          description: `${file.name} is not a valid image or video`,
          variant: "destructive",
        })
        continue
      }

      try {
        const fileExt = file.name.split(".").pop()
        const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`
        const folder = isImage ? "event-photos" : "event-videos"
        const filePath = `${folder}/${fileName}`

        const { error: uploadError } = await supabase.storage.from("events").upload(filePath, file)

        if (uploadError) throw uploadError

        const {
          data: { publicUrl },
        } = supabase.storage.from("events").getPublicUrl(filePath)

        uploadedUrls.push(publicUrl)
        
        // Save to database immediately
        await supabase.from("event_photos").insert({
          event_id: eventId,
          photo_url: publicUrl,
          photo_type: isImage ? "photo" : "video",
          display_order: photos.length + uploadedUrls.length,
        })

      } catch (error) {
        toast({
          title: "Upload failed",
          description: `Failed to upload ${file.name}`,
          variant: "destructive",
        })
      }
    }

    setUploadedFiles([...uploadedFiles, ...uploadedUrls])
    setIsUploading(false)
    
    toast({
      title: "Upload complete",
      description: `${uploadedUrls.length} file(s) uploaded successfully`,
    })
    
    router.refresh()
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()

    try {
      const response = await fetch(`/api/admin/events/${eventId}/photos`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      })

      if (!response.ok) {
        throw new Error("Failed to add photo")
      }

      toast({
        title: "Success",
        description: "Photo/video added successfully",
      })

      setIsOpen(false)
      setFormData({ photo_url: "", photo_type: "photo", caption: "", display_order: photos.length })
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to add photo",
        variant: "destructive",
      })
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm("Are you sure you want to delete this photo?")) return

    try {
      const response = await fetch(`/api/admin/events/${eventId}/photos/${id}`, {
        method: "DELETE",
      })

      if (!response.ok) {
        throw new Error("Failed to delete photo")
      }

      toast({
        title: "Success",
        description: "Photo deleted successfully",
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to delete photo",
        variant: "destructive",
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex justify-end">
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
          <DialogTrigger asChild>
            <Button
              onClick={() =>
                setFormData({ photo_url: "", photo_type: "photo", caption: "", display_order: photos.length })
              }
            >
              <PlusCircle className="mr-2 h-4 w-4" />
              Add Photo/Video
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Add Photo/Video</DialogTitle>
            </DialogHeader>
            <Tabs defaultValue="upload">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="upload">Upload Files</TabsTrigger>
                <TabsTrigger value="url">Add URL</TabsTrigger>
              </TabsList>
              
              <TabsContent value="upload" className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="file_upload">Upload Photos/Videos *</Label>
                  <Input
                    id="file_upload"
                    type="file"
                    accept="image/*,video/*"
                    multiple
                    onChange={handleFileUpload}
                    disabled={isUploading}
                  />
                  <p className="text-xs text-muted-foreground">
                    Upload multiple photos or videos at once
                  </p>
                  {isUploading && (
                    <div className="flex items-center gap-2 text-sm">
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Uploading...
                    </div>
                  )}
                </div>
              </TabsContent>
              
              <TabsContent value="url">
                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="photo_type">Type *</Label>
                    <Select
                      value={formData.photo_type}
                      onValueChange={(value) => setFormData({ ...formData, photo_type: value })}
                    >
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="photo">Photo</SelectItem>
                        <SelectItem value="video">Video</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="photo_url">URL *</Label>
                    <Input
                      id="photo_url"
                      type="url"
                      value={formData.photo_url}
                      onChange={(e) => setFormData({ ...formData, photo_url: e.target.value })}
                      placeholder="https://example.com/image.jpg"
                      required
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="caption">Caption</Label>
                    <Textarea
                      id="caption"
                      value={formData.caption}
                      onChange={(e) => setFormData({ ...formData, caption: e.target.value })}
                      placeholder="Optional caption"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="display_order">Display Order</Label>
                    <Input
                      id="display_order"
                      type="number"
                      value={formData.display_order}
                      onChange={(e) => setFormData({ ...formData, display_order: Number.parseInt(e.target.value) })}
                    />
                  </div>

                  <div className="flex justify-end gap-2">
                    <Button type="button" variant="outline" onClick={() => setIsOpen(false)}>
                      Cancel
                    </Button>
                    <Button type="submit">Add</Button>
                  </div>
                </form>
              </TabsContent>
            </Tabs>
          </DialogContent>
        </Dialog>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {photos.map((photo) => (
          <Card key={photo.id}>
            <CardContent className="p-4">
              <div className="aspect-video bg-muted rounded-md mb-3 flex items-center justify-center overflow-hidden relative">
                {photo.photo_type === "photo" ? (
                  <Image
                    src={photo.photo_url || "/placeholder.svg"}
                    alt={photo.caption || ""}
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center gap-2">
                    <Video className="h-12 w-12 text-muted-foreground" />
                    <p className="text-xs text-muted-foreground">Video</p>
                  </div>
                )}
              </div>
              {photo.caption && <p className="text-sm text-muted-foreground mb-2">{photo.caption}</p>}
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground">Order: {photo.display_order}</span>
                <Button variant="ghost" size="sm" onClick={() => handleDelete(photo.id)}>
                  <Trash2 className="h-4 w-4 text-destructive" />
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
