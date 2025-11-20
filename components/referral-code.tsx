"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2 } from "lucide-react"

export function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)

  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/sign-up?ref=${code}` : ""

  const handleCopy = async () => {
    await navigator.clipboard.writeText(code)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: "Join EventMatch",
        text: `Join EventMatch using my referral code: ${code}`,
        url: referralUrl,
      })
    }
  }

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Input value={code} readOnly className="font-mono text-lg" />
        <Button onClick={handleCopy} variant="outline" size="icon">
          {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
        </Button>
      </div>

      <div className="flex gap-2">
        <Input value={referralUrl} readOnly className="text-sm" />
        {navigator.share && (
          <Button onClick={handleShare} variant="outline" size="icon">
            <Share2 className="h-4 w-4" />
          </Button>
        )}
      </div>

      <p className="text-sm text-muted-foreground">
        Share this code or URL with friends. For every 25 referrals, you earn 1 FREE After Work Activity!
      </p>
    </div>
  )
}
