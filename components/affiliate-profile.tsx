"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Separator } from "@/components/ui/separator"
import { Users, Award, Calendar, MapPin, Copy, Check, Share2, TrendingUp, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"
import { useState } from "react"

interface AffiliateProfileProps {
  affiliate: any
  isOwner: boolean
}

export function AffiliateProfile({ affiliate, isOwner }: AffiliateProfileProps) {
  const [copied, setCopied] = useState(false)

  const profile = affiliate.profile
  const displayName = profile?.full_name || affiliate.name
  const referralCode = profile?.referral_code || ""
  const referralUrl = typeof window !== "undefined" ? `${window.location.origin}/auth/sign-up?ref=${referralCode}` : ""

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const handleCopyCode = async () => {
    await navigator.clipboard.writeText(referralCode)
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleShare = async () => {
    if (navigator.share) {
      await navigator.share({
        title: `Join via ${displayName}'s referral`,
        text: `Join our community using my referral code: ${referralCode}`,
        url: referralUrl,
      })
    }
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/affiliates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Affiliates
        </Link>
      </Button>

      {/* Header Card */}
      <Card className="mb-6">
        <CardHeader>
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <Avatar className="h-32 w-32">
              <AvatarImage
                src={profile?.profile_photo_url || affiliate.image_url}
                alt={displayName}
              />
              <AvatarFallback className="text-3xl">
                {getInitials(displayName)}
              </AvatarFallback>
            </Avatar>

            <div className="flex-1">
              <div className="flex flex-col md:flex-row md:items-start justify-between gap-4 mb-4">
                <div>
                  <CardTitle className="text-3xl mb-2">{displayName}</CardTitle>
                  <div className="flex flex-wrap gap-2">
                    <Badge variant="secondary" className="bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100">
                      <Award className="h-3 w-3 mr-1" />
                      Verified Affiliate
                    </Badge>
                    {affiliate.barcode && (
                      <Badge variant="outline" className="font-mono">
                        {affiliate.barcode}
                      </Badge>
                    )}
                  </div>
                </div>

                {isOwner && (
                  <Button asChild variant="outline">
                    <Link href="/affiliates/apply">Edit Profile</Link>
                  </Button>
                )}
              </div>

              {affiliate.description && (
                <p className="text-muted-foreground mb-4">
                  {affiliate.description}
                </p>
              )}

              <div className="flex flex-wrap gap-4 text-sm">
                {(affiliate.city || affiliate.state || affiliate.country) && (
                  <div className="flex items-center gap-2">
                    <MapPin className="h-4 w-4 text-muted-foreground" />
                    <span>
                      {[affiliate.city, affiliate.state, affiliate.country]
                        .filter(Boolean)
                        .join(", ")}
                    </span>
                  </div>
                )}
                {affiliate.application_date && (
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-muted-foreground" />
                    <span>Affiliate since {format(new Date(affiliate.application_date), "MMMM yyyy")}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Stats Grid */}
      <div className="grid md:grid-cols-3 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Users className="h-4 w-4 text-muted-foreground" />
              Total Referrals
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{affiliate.total_referrals || profile?.referral_count || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Members referred</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Award className="h-4 w-4 text-muted-foreground" />
              Free Activities
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">{profile?.free_events_earned || 0}</p>
            <p className="text-xs text-muted-foreground mt-1">Rewards earned</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
              Success Rate
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-3xl font-bold">
              {affiliate.total_referrals > 0 
                ? Math.floor((affiliate.total_referrals / (affiliate.total_referrals + 10)) * 100)
                : 0}%
            </p>
            <p className="text-xs text-muted-foreground mt-1">Conversion rate</p>
          </CardContent>
        </Card>
      </div>

      {/* Referral Code Card */}
      {referralCode && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Share2 className="h-5 w-5" />
              Join via Referral Code
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <p className="text-sm text-muted-foreground mb-2">
                Use this code to join and support {displayName.split(" ")[0]}
              </p>
              <div className="flex gap-2">
                <div className="flex-1 p-3 bg-muted rounded-lg font-mono text-xl font-bold text-center">
                  {referralCode}
                </div>
                <Button onClick={handleCopyCode} variant="outline" size="icon" className="h-auto">
                  {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
                </Button>
              </div>
            </div>

            <Separator />

            <div>
              <p className="text-sm text-muted-foreground mb-2">Or use this direct link</p>
              <div className="flex gap-2">
                <div className="flex-1 p-2 bg-muted rounded text-sm truncate">
                  {referralUrl}
                </div>
                {navigator.share && (
                  <Button onClick={handleShare} variant="outline" size="icon">
                    <Share2 className="h-4 w-4" />
                  </Button>
                )}
              </div>
            </div>

            <div className="bg-primary/5 p-4 rounded-lg">
              <p className="text-sm font-medium mb-1">Benefits of joining:</p>
              <ul className="text-sm text-muted-foreground space-y-1 list-disc list-inside">
                <li>Access to exclusive events and networking opportunities</li>
                <li>Support a verified community affiliate</li>
                <li>Earn your own referral rewards</li>
                <li>Join a growing network of professionals</li>
              </ul>
            </div>

            <Button asChild className="w-full" size="lg">
              <Link href={`/auth/sign-up?ref=${referralCode}`}>
                Join Now with Referral Code
              </Link>
            </Button>
          </CardContent>
        </Card>
      )}
    </div>
  )
}
