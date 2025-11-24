"use client"

import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2 } from "lucide-react"

interface MembershipRequiredChatModalProps {
  isOpen: boolean
  onClose: () => void
  userName: string
  onUpgrade: () => void
  isLoading?: boolean
}

export function MembershipRequiredChatModal({
  isOpen,
  onClose,
  userName,
  onUpgrade,
  isLoading = false,
}: MembershipRequiredChatModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Premium Membership Required</DialogTitle>
              <DialogDescription>
                Unlock messaging to connect
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* User Name */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">Connect with</p>
            <p className="font-semibold text-base">{userName}</p>
          </div>

          {/* Why Membership is Required */}
          <div className="space-y-3 text-sm">
            <p className="font-medium">To message this user, you need an active membership.</p>
            
            <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Unlimited messaging with matches</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Connect with like-minded members</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Build meaningful relationships</span>
              </div>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
              className="flex-1"
            >
              Cancel
            </Button>
            <Button
              onClick={onUpgrade}
              disabled={isLoading}
              className="flex-1 bg-red-600 hover:bg-red-700"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Redirecting...
                </>
              ) : (
                "Upgrade to Premium"
              )}
            </Button>
          </div>

          {/* Help Text */}
          <p className="text-xs text-center text-muted-foreground">
            You'll be redirected to the membership page to upgrade your account
          </p>
        </div>
      </DialogContent>
    </Dialog>
  )
}
