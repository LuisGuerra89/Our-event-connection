"use client"

import type React from "react"

import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useState } from "react"
import { changePassword } from "@/app/admin/profile/actions"
import { useRouter } from "next/navigation"

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false)
  const [message, setMessage] = useState<{ type: "success" | "error"; text: string } | null>(null)
  const router = useRouter()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setIsLoading(true)
    setMessage(null)

    const formData = new FormData(e.currentTarget)
    const result = await changePassword(formData)

    if (result.error) {
      setMessage({ type: "error", text: result.error })
    } else {
      setMessage({ type: "success", text: "Password changed successfully. Redirecting to login..." })
      e.currentTarget.reset()
      
      // Wait a moment then sign out and redirect
      setTimeout(async () => {
        try {
          await fetch("/api/auth/logout", {
            method: "POST",
          })
        } catch (err) {
          console.error("Logout error:", err)
        }
        router.push("/auth/login")
      }, 1500)
    }

    setIsLoading(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-4">
        <div className="space-y-2">
          <Label htmlFor="oldPassword">Old Password *</Label>
          <Input id="oldPassword" name="oldPassword" type="password" required minLength={6} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="newPassword">New Password *</Label>
          <Input id="newPassword" name="newPassword" type="password" required minLength={6} />
        </div>

        <div className="space-y-2">
          <Label htmlFor="confirmPassword">Confirm New Password *</Label>
          <Input id="confirmPassword" name="confirmPassword" type="password" required minLength={6} />
        </div>
      </div>

      {message && (
        <p className={`text-sm ${message.type === "error" ? "text-red-500" : "text-green-600"}`}>{message.text}</p>
      )}

      <Button type="submit" disabled={isLoading}>
        {isLoading ? "Changing..." : "Change Password"}
      </Button>
    </form>
  )
}
