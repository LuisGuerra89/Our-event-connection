"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { User, Upload, Loader2 } from "lucide-react"

interface ProfileImageUploadProps {
  userName: string
  currentImageUrl?: string | null
  onUploadSuccess?: (imageUrl: string) => void
}

export function ProfileImageUpload({ userName, currentImageUrl, onUploadSuccess }: ProfileImageUploadProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [imageUrl, setImageUrl] = useState(currentImageUrl)
  const router = useRouter()

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0]
    if (!file) return

    setIsLoading(true)
    setError(null)

    try {
      const formData = new FormData()
      formData.append("file", file)

      const response = await fetch("/api/upload/profile-image", {
        method: "POST",
        body: formData,
      })

      if (!response.ok) {
        const data = await response.json()
        throw new Error(data.error || "Failed to upload image")
      }

      const data = await response.json()
      setImageUrl(data.url)
      onUploadSuccess?.(data.url)
      
      // Revalidate and refresh the page to update header
      router.refresh()
      
      // Small delay to ensure image is visible
      setTimeout(() => {
        window.location.reload()
      }, 500)
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : "Failed to upload image"
      setError(errorMessage)
      console.error("Upload error:", err)
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="flex flex-col items-center gap-4">
      <div className="relative">
        <Avatar className="h-24 w-24">
          {imageUrl ? (
            <AvatarImage src={imageUrl} alt={userName} />
          ) : (
            <AvatarFallback className="bg-primary/10 text-lg font-semibold">
              {getInitials(userName)}
            </AvatarFallback>
          )}
        </Avatar>
        <label
          htmlFor="profile-image-input"
          className="absolute bottom-0 right-0 bg-primary text-primary-foreground rounded-full p-2 cursor-pointer hover:bg-primary/90 transition-colors"
        >
          {isLoading ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Upload className="h-4 w-4" />
          )}
        </label>
        <input
          id="profile-image-input"
          type="file"
          accept="image/*"
          onChange={handleFileSelect}
          disabled={isLoading}
          className="hidden"
        />
      </div>

      {error && <p className="text-sm text-red-500 text-center">{error}</p>}

      <div className="text-center">
        <p className="text-sm text-muted-foreground">
          Click the camera icon to change your profile picture
        </p>
        <p className="text-xs text-muted-foreground mt-1">
          JPG, PNG up to 5MB
        </p>
      </div>
    </div>
  )
}
