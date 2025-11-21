"use client"

import { useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Users, MapPin, Award } from "lucide-react"
import Link from "next/link"

interface AffiliatesListProps {
  initialAffiliates: any[]
}

export function AffiliatesList({ initialAffiliates }: AffiliatesListProps) {
  const [affiliates, setAffiliates] = useState(initialAffiliates)
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadAllAffiliates = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from("affiliates")
      .select("*")
      .eq("approval_status", "approved")
      .order("created_at", { ascending: false })

    if (data) {
      setAffiliates(data)
      setShowAll(true)
    }
    setIsLoading(false)
  }

  const displayedAffiliates = showAll ? affiliates : affiliates.slice(0, 9)

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div id="affiliates" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Our Affiliate Partners</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Discover and support the businesses that partner with us
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedAffiliates.map((affiliate) => (
          <Card key={affiliate.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start gap-4">
                <Avatar className="h-16 w-16">
                  <AvatarImage 
                    src={affiliate.image_url} 
                    alt={affiliate.name} 
                  />
                  <AvatarFallback className="text-lg">
                    {getInitials(affiliate.name)}
                  </AvatarFallback>
                </Avatar>
                <div className="flex-1">
                  <CardTitle className="text-xl">
                    {affiliate.name}
                  </CardTitle>
                  {affiliate.approval_status === "approved" && (
                    <Badge variant="secondary" className="mt-2 bg-green-100 text-green-900 dark:bg-green-900 dark:text-green-100">
                      <Award className="h-3 w-3 mr-1" />
                      Verified Partner
                    </Badge>
                  )}
                </div>
              </div>
            </CardHeader>

            <CardContent className="flex-1 space-y-4">
              {affiliate.description && (
                <p className="text-sm text-muted-foreground line-clamp-3">
                  {affiliate.description}
                </p>
              )}

              {(affiliate.city || affiliate.state || affiliate.country) && (
                <div className="flex items-start gap-2 text-sm text-muted-foreground">
                  <MapPin className="h-4 w-4 flex-shrink-0 mt-0.5" />
                  <span>
                    {[affiliate.city, affiliate.state, affiliate.country]
                      .filter(Boolean)
                      .join(", ")}
                  </span>
                </div>
              )}
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full" variant="outline">
                <Link href={`/affiliates/${affiliate.id}`}>
                  View Details
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!showAll && affiliates.length > 9 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadAllAffiliates}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "View All Affiliates"}
          </Button>
        </div>
      )}

      {displayedAffiliates.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-16 w-16 text-muted-foreground mx-auto mb-4" />
          <h3 className="text-xl font-semibold mb-2">No Partners Yet</h3>
          <p className="text-muted-foreground mb-6">
            Be the first to become our partner!
          </p>
          <Button asChild size="lg">
            <Link href="/affiliates/apply">Become a Partner</Link>
          </Button>
        </div>
      )}
    </div>
  )
}
