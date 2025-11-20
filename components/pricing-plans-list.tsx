"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Check } from "lucide-react"
import Link from "next/link"

interface PricingPlansListProps {
  initialPlans: any[]
}

export function PricingPlansList({ initialPlans }: PricingPlansListProps) {
  const [plans, setPlans] = useState(initialPlans)
  const [userSubscriptions, setUserSubscriptions] = useState<any[]>([])
  const [userId, setUserId] = useState<string | null>(null)

  useEffect(() => {
    const fetchUserSubscriptions = async () => {
      const supabase = createClient()
      
      // Get current user
      const { data: { user }, error } = await supabase.auth.getUser()
      
      console.log("Current user:", user?.id, "Error:", error)
      
      if (user) {
        setUserId(user.id)
        
        // Get user's active subscriptions
        const { data: subscriptions, error: subError } = await supabase
          .from("user_subscriptions")
          .select("plan_id, status")
          .eq("user_id", user.id)
          .eq("status", "active")
        
        console.log("User subscriptions loaded:", { userId: user.id, subscriptions, subError })
        setUserSubscriptions(subscriptions || [])
      } else {
        // No user logged in
        console.log("No user logged in, clearing subscriptions")
        setUserId(null)
        setUserSubscriptions([])
      }
    }
    
    fetchUserSubscriptions()
    
    // Subscribe to auth changes to refresh when user logs in/out
    const supabase = createClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log("Auth state changed:", event, "Session user:", session?.user?.id)
      await fetchUserSubscriptions()
    })
    
    return () => {
      subscription?.unsubscribe()
    }
  }, [])

  // Check if user has an active subscription for a plan
  const hasActivePlan = (planId: string) => {
    return userSubscriptions.some(sub => sub.plan_id === planId && sub.status === "active")
  }

  return (
    <div className="container mx-auto px-4 py-12">
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold mb-4">{"Choose Your Plan"}</h1>
        <p className="text-xl text-muted-foreground">{"Select the perfect subscription for your needs"}</p>
      </div>

      <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
        {plans?.map((plan) => {
          const isCurrentPlan = hasActivePlan(plan.id)
          
          return (
            <Card key={plan.id} className={`flex flex-col relative ${plan.is_featured ? "border-primary shadow-lg" : ""} ${isCurrentPlan ? "border-green-500 border-2" : ""}`}>
              {isCurrentPlan && (
                <Badge className="absolute top-4 right-4 bg-green-500 text-white">Current Plan</Badge>
              )}
              <CardHeader className="pb-3">
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="flex-1 space-y-4">
                <div className="flex items-baseline gap-2">
                  <span className="text-4xl font-bold">${plan.price}</span>
                  {plan.plan_type && (
                    <span className="text-muted-foreground">/{plan.plan_type}</span>
                  )}
                </div>
                <div className="h-6">
                  {plan.duration_days && (
                    <div className="text-sm text-muted-foreground">
                      Duration: {plan.duration_days} {plan.duration_days === 1 ? 'day' : 'days'}
                    </div>
                  )}
                </div>
                <ul className="space-y-2">
                  {plan.features &&
                    (() => {
                      try {
                        const features = JSON.parse(plan.features)
                        return Array.isArray(features) ? features : []
                      } catch {
                        return []
                      }
                    })().map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
              <CardFooter className="pt-4">
                <Button 
                  className="w-full" 
                  variant={plan.is_featured ? "default" : "outline"}
                  disabled={isCurrentPlan}
                  asChild={!isCurrentPlan}
                >
                  {isCurrentPlan ? (
                    <span>Current Plan</span>
                  ) : (
                    <Link href="/membership">
                      {plan.is_featured ? "Get Started" : "Choose Plan"}
                    </Link>
                  )}
                </Button>
              </CardFooter>
            </Card>
          )
        })}
      </div>
    </div>
  )
}
