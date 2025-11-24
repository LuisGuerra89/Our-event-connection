"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Copy, Check, Share2 } from "lucide-react"

export function ReferralCode({ code }: { code: string }) {
  const [copied, setCopied] = useState(false)
  const [referralUrl, setReferralUrl] = useState("")
  const [canShare, setCanShare] = useState(false)
  const [isClient, setIsClient] = useState(false)

  // Only run on client to avoid hydration mismatch
  useEffect(() => {
    setIsClient(true)
    setReferralUrl(`${window.location.origin}/auth/sign-up?ref=${code}`)
    setCanShare(typeof navigator !== "undefined" && !!navigator.share)
  }, [code])

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

  // Avoid rendering until client-side hydration is complete
  if (!isClient) {
    return (
      <div className="space-y-4">
        <div className="flex gap-2">
          <Input value={code} readOnly className="font-mono text-lg" />
          <Button variant="outline" size="icon" disabled>
            <Copy className="h-4 w-4" />
          </Button>
        </div>
        <div className="flex gap-2">
          <Input value="" readOnly className="text-sm" disabled />
        </div>
        <p className="text-sm text-muted-foreground">
          Share this code or URL with friends. For every 25 referrals, you earn 1 FREE After Work Activity!
        </p>
      </div>
    )
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
        {canShare && (
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
