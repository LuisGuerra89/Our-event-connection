"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Loader2, AlertTriangle } from "lucide-react"

interface DeleteAccountDialogProps {
    hasActiveSubscription?: boolean
}

export function DeleteAccountDialog({ hasActiveSubscription }: DeleteAccountDialogProps) {
    const [open, setOpen] = useState(false)
    const [confirmText, setConfirmText] = useState("")
    const [confirmed, setConfirmed] = useState(false)
    const [isDeleting, setIsDeleting] = useState(false)
    const router = useRouter()

    const handleDelete = async () => {
        if (confirmText !== "DELETE" || !confirmed) {
            return
        }

        setIsDeleting(true)

        try {
            const response = await fetch("/api/account/delete", {
                method: "POST",
            })

            if (!response.ok) {
                const error = await response.json()
                throw new Error(error.message || "Failed to delete account")
            }

            // Redirect to home page
            router.push("/")
        } catch (error) {
            console.error("Error deleting account:", error)
            alert(error instanceof Error ? error.message : "Failed to delete account. Please try again.")
            setIsDeleting(false)
        }
    }

    const resetDialog = () => {
        setConfirmText("")
        setConfirmed(false)
        setIsDeleting(false)
    }

    const canDelete = confirmText === "DELETE" && confirmed && !isDeleting

    return (
        <AlertDialog open={open} onOpenChange={(isOpen) => {
            setOpen(isOpen)
            if (!isOpen) resetDialog()
        }}>
            <AlertDialogTrigger asChild>
                <Button variant="destructive" size="lg">
                    Delete Account
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent className="max-w-2xl">
                <AlertDialogHeader>
                    <AlertDialogTitle className="flex items-center gap-2 text-destructive">
                        <AlertTriangle className="h-5 w-5" />
                        Delete Account Permanently
                    </AlertDialogTitle>
                    <AlertDialogDescription asChild>
                        <div className="space-y-4 text-left text-sm text-muted-foreground">
                            <p className="font-semibold text-foreground">
                                This action cannot be undone. This will permanently delete your account and remove all your data from our servers.
                            </p>

                            <div className="bg-destructive/10 border border-destructive/20 rounded-lg p-4">
                                <p className="font-semibold text-sm mb-2">The following data will be permanently deleted:</p>
                                <ul className="text-sm space-y-1 list-disc list-inside">
                                    <li>Your profile and personal information</li>
                                    <li>All your event registrations and attendance history</li>
                                    <li>Your matches and connections</li>
                                    <li>All chat conversations and messages</li>
                                    <li>Your referrals and rewards</li>
                                    <li>Payment history and transaction records</li>
                                    <li>All notifications and preferences</li>
                                    {hasActiveSubscription && (
                                        <li className="font-semibold text-destructive">
                                            Your active subscription will be cancelled
                                        </li>
                                    )}
                                </ul>
                            </div>

                            {hasActiveSubscription && (
                                <div className="bg-yellow-50 dark:bg-yellow-900/20 border border-yellow-200 dark:border-yellow-800 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-yellow-800 dark:text-yellow-200">
                                        ⚠️ You have an active subscription
                                    </p>
                                    <p className="text-sm text-yellow-700 dark:text-yellow-300 mt-1">
                                        Your subscription will be cancelled immediately and you will not be refunded for any remaining time.
                                    </p>
                                </div>
                            )}

                            <div className="space-y-3 pt-2">
                                <div>
                                    <Label htmlFor="confirm-delete" className="text-sm font-semibold">
                                        Type <span className="font-mono bg-muted px-1 rounded">DELETE</span> to confirm
                                    </Label>
                                    <Input
                                        id="confirm-delete"
                                        value={confirmText}
                                        onChange={(e) => setConfirmText(e.target.value.toUpperCase())}
                                        placeholder="Type DELETE"
                                        className="mt-1"
                                        disabled={isDeleting}
                                    />
                                </div>

                                <div className="flex items-start space-x-2">
                                    <Checkbox
                                        id="confirm-checkbox"
                                        checked={confirmed}
                                        onCheckedChange={(checked) => setConfirmed(checked as boolean)}
                                        disabled={isDeleting}
                                    />
                                    <label
                                        htmlFor="confirm-checkbox"
                                        className="text-sm leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                                    >
                                        I understand that this action is permanent and cannot be undone
                                    </label>
                                </div>
                            </div>
                        </div>
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel disabled={isDeleting}>Cancel</AlertDialogCancel>
                    <Button
                        variant="destructive"
                        onClick={handleDelete}
                        disabled={!canDelete}
                    >
                        {isDeleting ? (
                            <>
                                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                                Deleting Account...
                            </>
                        ) : (
                            "Delete My Account"
                        )}
                    </Button>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    )
}
