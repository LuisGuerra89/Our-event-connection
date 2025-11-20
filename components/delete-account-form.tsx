"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { AlertCircle, Trash2 } from "lucide-react"
import { useRouter } from "next/navigation"
import { deleteAccount } from "@/app/dashboard/profile/delete/actions"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export function DeleteAccountForm({ userEmail }: { userEmail: string }) {
  const router = useRouter()
  const [password, setPassword] = useState("")
  const [confirmText, setConfirmText] = useState("")
  const [accepted, setAccepted] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState("")

  const handleDelete = async () => {
    if (!password || confirmText !== "DELETE" || !accepted) {
      setError("Please complete all required fields and confirmations")
      return
    }

    setIsLoading(true)
    setError("")

    const formData = new FormData()
    formData.append("password", password)

    const result = await deleteAccount(formData)

    if (result.error) {
      setError(result.error)
      setIsLoading(false)
    } else {
      router.push("/")
    }
  }

  const canDelete = password && confirmText === "DELETE" && accepted

  return (
    <Card className="border-destructive">
      <CardHeader>
        <CardTitle className="flex items-center gap-2 text-destructive">
          <AlertCircle className="h-5 w-5" />
          Permanently Delete Account
        </CardTitle>
        <CardDescription>
          This action cannot be undone. All your data, including profile information, event registrations, and matches
          will be permanently deleted.
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-6">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Warning</AlertTitle>
          <AlertDescription>
            Once you delete your account, there is no going back. Please be certain before proceeding.
          </AlertDescription>
        </Alert>

        {error && (
          <Alert variant="destructive">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <div className="space-y-4">
          <div>
            <Label htmlFor="password">Confirm Your Password</Label>
            <Input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Enter your password"
              disabled={isLoading}
            />
          </div>

          <div>
            <Label htmlFor="confirm">Type DELETE to confirm</Label>
            <Input
              id="confirm"
              value={confirmText}
              onChange={(e) => setConfirmText(e.target.value)}
              placeholder='Type "DELETE" in all caps'
              disabled={isLoading}
            />
            <p className="text-sm text-muted-foreground mt-1">You must type DELETE exactly as shown</p>
          </div>

          <div className="flex items-start space-x-2">
            <Checkbox
              id="accept"
              checked={accepted}
              onCheckedChange={(checked) => setAccepted(checked === true)}
              disabled={isLoading}
            />
            <Label htmlFor="accept" className="text-sm leading-relaxed cursor-pointer">
              I understand that this action is permanent and cannot be undone. All my data will be deleted immediately
              and I will lose access to my account.
            </Label>
          </div>
        </div>

        <div className="flex gap-4 pt-4">
          <Button
            variant="outline"
            className="flex-1 bg-transparent"
            onClick={() => router.back()}
            disabled={isLoading}
          >
            Cancel
          </Button>
          <Button variant="destructive" className="flex-1" onClick={handleDelete} disabled={!canDelete || isLoading}>
            {isLoading ? (
              "Deleting..."
            ) : (
              <>
                <Trash2 className="h-4 w-4 mr-2" />
                Delete Account
              </>
            )}
          </Button>
        </div>

        <p className="text-sm text-muted-foreground text-center">
          Account logged in as: <strong>{userEmail}</strong>
        </p>
      </CardContent>
    </Card>
  )
}
