"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

interface PricingCardsProps {
  initialPlans: any[]
}

export function PricingCards({ initialPlans }: PricingCardsProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      const supabase = createClient()

      const { data: { user } } = await supabase.auth.getUser()

      if (user) {
        setUserId(user.id)

        const { data: subscriptions } = await supabase
          .from("user_subscriptions")
          .select("plan_id, status")
          .eq("user_id", user.id)
          .eq("status", "active")

        setUserSubscriptions(subscriptions || [])
      } else {
        setUserId(null)
        setUserSubscriptions([])
      }
    }

    fetchUserSubscriptions()

    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      await fetchUserSubscriptions()
    })

    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  const hasActivePlan = (planId: string) => {
    return userSubscriptions.some(sub => sub.plan_id === planId && sub.status === "active")
  }

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  // Find the middle plan (for Popular badge)
  const middlePlanIndex = Math.floor(sortedPlans.length / 2)

  if (!sortedPlans.length) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-4xl md:text-5xl font-bold mb-4">
          Simple, Transparent Pricing
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose the perfect plan for your lifestyle. Cancel anytime.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 max-w-7xl mx-auto">
        {sortedPlans.map((plan, index) => {
          const isCurrentPlan = hasActivePlan(plan.id)
          const isPopular = index === middlePlanIndex && sortedPlans.length > 1

          return (
            <div
              key={plan.id}
              className={`relative rounded-2xl border transition-all duration-300 ${
                isPopular
                  ? "border-primary lg:scale-105 lg:shadow-2xl lg:shadow-primary/20 bg-gradient-to-br from-background via-background to-primary/5"
                  : "border-border bg-background hover:border-primary/50"
              }`}
            >
              {/* Popular Badge */}
              {isPopular && (
                <div className="absolute -top-4 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-4 py-1">
                    Popular
                  </Badge>
                </div>
              )}

              <div className="p-8 space-y-8 flex flex-col h-full">
                {/* Header */}
                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">{plan.name}</h3>
                  {plan.description && (
                    <p className="text-muted-foreground text-sm leading-relaxed">
                      {plan.description}
                    </p>
                  )}
                </div>

                {/* Price */}
                <div className="space-y-2">
                  {plan.price === 0 ? (
                    <div className="flex items-baseline gap-2">
                      <span className="text-4xl font-bold">Free</span>
                      <span className="text-muted-foreground">forever</span>
                    </div>
                  ) : (
                    <div className="flex items-baseline gap-1">
                      <span className="text-5xl font-bold">${Number(plan.price).toFixed(2)}</span>
                      <span className="text-muted-foreground text-sm">/month</span>
                    </div>
                  )}
                </div>

                {/* CTA Button */}
                {plan.price > 0 && (
                  <div className="pt-2">
                    {isCurrentPlan ? (
                      <Button disabled className="w-full h-10 bg-secondary text-secondary-foreground hover:bg-secondary/90">
                        Current Plan
                      </Button>
                    ) : (
                      <Button asChild className={`w-full h-10 ${isPopular ? "bg-primary hover:bg-primary/90" : ""}`}>
                        <Link href={`/membership/${plan.id}`}>
                          Subscribe Now
                        </Link>
                      </Button>
                    )}
                  </div>
                )}

                {/* Features */}
                <div className="space-y-4 flex-1">
                  <p className="text-sm font-semibold text-foreground">What's included:</p>
                  <ul className="space-y-3">
                    {plan.features && Array.isArray(plan.features) && plan.features.length > 0 ? (
                      plan.features.map((feature: string, idx: number) => (
                        <li key={idx} className="flex items-start gap-3">
                          <Check className="w-5 h-5 text-primary flex-shrink-0 mt-0.5" />
                          <span className="text-sm text-muted-foreground leading-relaxed">
                            {feature}
                          </span>
                        </li>
                      ))
                    ) : (
                      <li className="text-sm text-muted-foreground italic">
                        No features listed
                      </li>
                    )}
                  </ul>
                </div>
              </div>
            </div>
          )
        })}
      </div>
    </div>
  )
}
