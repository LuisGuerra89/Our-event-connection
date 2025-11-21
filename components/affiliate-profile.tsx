"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Award, Calendar, MapPin, ArrowLeft } from "lucide-react"
import { format } from "date-fns"
import Link from "next/link"

interface AffiliateProfileProps {
  affiliate: any
  isOwner: boolean
}

export function AffiliateProfile({ affiliate, isOwner }: AffiliateProfileProps) {
  const displayName = affiliate.name
  const displayImage = affiliate.image_url

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
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
                src={displayImage}
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
                      Verified Partner
                    </Badge>
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
      <div className="grid md:grid-cols-2 gap-4 mb-6">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Location
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {[affiliate.city, affiliate.state, affiliate.country]
                .filter(Boolean)
                .join(", ") || "Not specified"}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Service area</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              Partner Since
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-lg font-semibold">
              {affiliate.application_date 
                ? format(new Date(affiliate.application_date), "MMMM yyyy")
                : "Recently"
              }
            </p>
            <p className="text-xs text-muted-foreground mt-1">Joining date</p>
          </CardContent>
        </Card>
      </div>

    </div>
  )
}
