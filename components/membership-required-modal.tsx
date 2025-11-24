"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { AlertCircle, CheckCircle2, Info } from "lucide-react"
import Link from "next/link"

interface MembershipRequiredModalProps {
  isOpen: boolean
  onClose: () => void
  eventTitle: string
  onUpgrade: () => void
  isLoading?: boolean
}

export function MembershipRequiredModal({
  isOpen,
  onClose,
  eventTitle,
  onUpgrade,
  isLoading = false,
}: MembershipRequiredModalProps) {
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <div className="flex items-center gap-3">
            <div className="flex items-center justify-center w-12 h-12 rounded-full bg-amber-100">
              <AlertCircle className="w-6 h-6 text-amber-600" />
            </div>
            <div>
              <DialogTitle>Active Membership Required</DialogTitle>
              <DialogDescription>
                This event requires an active membership
              </DialogDescription>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4">
          {/* Event Title */}
          <div className="bg-muted p-4 rounded-lg">
            <p className="text-sm font-medium text-muted-foreground mb-1">Event</p>
            <p className="font-semibold text-base">{eventTitle}</p>
          </div>

          {/* Why Membership is Required */}
          <div className="space-y-3 text-sm">
            <p className="font-medium">To register for this event, you need an active membership.</p>
            
            <div className="space-y-2 bg-primary/5 p-3 rounded-lg border border-primary/10">
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Get exclusive access to premium events</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Connect with like-minded members</span>
              </div>
              <div className="flex items-start gap-2">
                <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 flex-shrink-0" />
                <span className="text-xs">Enjoy priority registration</span>
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
              className="flex-1"
            >
              {isLoading ? (
                <>
                  <span className="animate-spin mr-2">⏳</span>
                  Redirecting...
                </>
              ) : (
                "Upgrade to Member"
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
