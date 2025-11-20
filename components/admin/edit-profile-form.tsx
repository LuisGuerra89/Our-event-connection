"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { updateAdminProfile } from "@/app/admin/profile/actions"

interface EditProfileFormProps {
  userId: string
  profile: any
  adminUser: any
  userEmail: string
}

export function EditProfileForm({ userId, profile, adminUser, userEmail }: EditProfileFormProps) {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await updateAdminProfile(formData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Profile updated successfully" })
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <input type="hidden" name="userId" value={userId} />

      <div className="grid gap-4 md:grid-cols-2">
        <div className="space-y-2">
          <Label htmlFor="username">Username</Label>
          <Input
            id="username"
            name="username"
            defaultValue={adminUser?.username || ""}
            readOnly
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">Username cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="email">Email *</Label>
          <Input id="email" name="email" type="email" required defaultValue={userEmail} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="firstName">First Name</Label>
          <Input
            id="firstName"
            name="firstName"
            defaultValue={adminUser?.first_name || profile?.first_name || ""}
            readOnly
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">First name cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="lastName">Last Name</Label>
          <Input
            id="lastName"
            name="lastName"
            defaultValue={adminUser?.last_name || profile?.last_name || ""}
            readOnly
            disabled
            className="bg-muted"
          />
          <p className="text-sm text-muted-foreground">Last name cannot be changed</p>
        </div>

        <div className="space-y-2">
          <Label htmlFor="mobile">Mobile *</Label>
          <Input
            id="mobile"
            name="mobile"
            type="tel"
            required
            defaultValue={adminUser?.mobile || profile?.phone || ""}
          />
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>{message.text}</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Saving..." : "Save Changes"}
      </Button>
    </form>
  )
}
