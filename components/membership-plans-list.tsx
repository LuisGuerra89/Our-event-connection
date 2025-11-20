"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check, CreditCard } from "lucide-react"
import Link from "next/link"

interface MembershipPlansListProps {
  initialPlans: any[]
}

export function MembershipPlansList({ initialPlans }: MembershipPlansListProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [showAll, setShowAll] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const loadAllPlans = async () => {
    setIsLoading(true)
    const supabase = createClient()

    const { data } = await supabase
      .from("subscription_plans")
      .select("*")
      .eq("status", "active")
      .order("price", { ascending: true })

    if (data) {
      setPlans(data)
      setShowAll(true)
    }
    setIsLoading(false)
  }

  const displayedPlans = showAll ? plans : plans.slice(0, 6)

  const getPlanTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      daily: "Daily",
      weekly: "Weekly",
      monthly: "Monthly",
      custom: "Custom"
    }
    return labels[type] || type
  }

  return (
    <div id="plans" className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl font-bold mb-4">Choose Your Membership Plan</h2>
        <p className="text-muted-foreground max-w-2xl mx-auto">
          Select the perfect plan for your lifestyle. All plans include auto-renewal and can be cancelled anytime.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
        {displayedPlans.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <div className="flex items-start justify-between mb-2">
                <Badge variant="secondary">{getPlanTypeLabel(plan.plan_type)}</Badge>
                {plan.auto_renewal && (
                  <Badge variant="outline" className="text-xs">Auto-Renew</Badge>
                )}
              </div>
              <CardTitle className="text-2xl">{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>

            <CardContent className="flex-1">
              <div className="mb-6">
                <span className="text-4xl font-bold">${Number(plan.price).toFixed(2)}</span>
                {plan.duration_days && (
                  <span className="text-muted-foreground ml-2">
                    / {plan.duration_days} {plan.duration_days === 1 ? 'day' : 'days'}
                  </span>
                )}
              </div>

              {plan.features && Array.isArray(plan.features) && plan.features.length > 0 && (
                <ul className="space-y-2">
                  {plan.features.map((feature: string, index: number) => (
                    <li key={index} className="flex items-start gap-2 text-sm">
                      <Check className="h-4 w-4 text-primary mt-0.5 flex-shrink-0" />
                      <span>{feature}</span>
                    </li>
                  ))}
                </ul>
              )}
            </CardContent>

            <CardFooter>
              <Button asChild className="w-full" size="lg">
                <Link href={`/membership/${plan.id}`}>
                  <CreditCard className="h-4 w-4 mr-2" />
                  Subscribe Now
                </Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>

      {!showAll && plans.length > 6 && (
        <div className="text-center">
          <Button
            variant="outline"
            size="lg"
            onClick={loadAllPlans}
            disabled={isLoading}
          >
            {isLoading ? "Loading..." : "View All Plans"}
          </Button>
        </div>
      )}
    </div>
  )
}
