"use client"

import { Check, X } from "lucide-react"
import { Badge } from "@/components/ui/badge"

interface PricingComparisonTableProps {
  plans: any[]
}

export function PricingComparisonTable({ plans }: PricingComparisonTableProps) {
  // Collect all unique features across all plans
  const allFeatures = Array.from(
    new Set(
      plans.flatMap((plan) => plan.features || [])
    )
  ) as string[]

  // Sort plans by price
  const sortedPlans = [...plans].sort((a, b) => a.price - b.price)

  if (!sortedPlans.length || !allFeatures.length) {
    return null
  }

  return (
    <div className="container mx-auto px-4 py-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-4">
          Compare Membership Plans
        </h2>
        <p className="text-muted-foreground max-w-2xl mx-auto text-lg">
          Choose the features you need. All plans include basic matching and profile browsing.
        </p>
      </div>

      {/* Desktop Table */}
      <div className="hidden lg:block overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="border-b-2 border-border">
              <th className="text-left py-4 px-6 font-semibold">Features</th>
              {sortedPlans.map((plan) => (
                <th key={plan.id} className="text-center py-4 px-6 font-semibold min-w-[200px]">
                  <div className="text-lg font-bold">{plan.name}</div>
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {allFeatures.map((feature, featureIndex) => (
              <tr
                key={feature}
                className={`border-b border-border ${
                  featureIndex % 2 === 0 ? "bg-background" : "bg-slate-50/50"
                } hover:bg-slate-100/50 transition-colors`}
              >
                <td className="py-4 px-6 font-medium text-sm">{feature}</td>
                {sortedPlans.map((plan) => {
                  const hasFeature = plan.features && plan.features.includes(feature)
                  return (
                    <td key={`${plan.id}-${feature}`} className="py-4 px-6 text-center">
                      {hasFeature ? (
                        <div className="flex justify-center">
                          <div className="w-5 h-5 bg-primary/10 rounded-full flex items-center justify-center">
                            <Check className="w-4 h-4 text-primary" />
                          </div>
                        </div>
                      ) : (
                        <div className="flex justify-center">
                          <div className="w-5 h-5 text-muted-foreground/30">
                            <X className="w-4 h-4" />
                          </div>
                        </div>
                      )}
                    </td>
                  )
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Mobile Cards */}
      <div className="lg:hidden space-y-6">
        {sortedPlans.map((plan) => (
          <div
            key={plan.id}
            className="border border-border rounded-lg overflow-hidden"
          >
            <div className="bg-gradient-to-r from-slate-50 to-slate-100 p-6 border-b border-border">
              <div className="flex items-center justify-between mb-2">
                <h3 className="text-xl font-bold">{plan.name}</h3>
                {plan.price === 0 && <Badge>Free</Badge>}
              </div>
              {plan.price > 0 && (
                <div className="space-y-1">
                  <div className="text-2xl font-bold">${Number(plan.price).toFixed(2)}</div>
                  <div className="text-sm text-muted-foreground">/month</div>
                </div>
              )}
              {plan.description && (
                <p className="text-sm text-muted-foreground mt-2">{plan.description}</p>
              )}
            </div>

            <div className="p-6 space-y-4">
              {allFeatures.map((feature) => {
                const hasFeature = plan.features && plan.features.includes(feature)
                return (
                  <div key={feature} className="flex items-start gap-3">
                    {hasFeature ? (
                      <div className="w-5 h-5 rounded-full bg-primary/10 flex items-center justify-center flex-shrink-0 mt-0.5">
                        <Check className="w-4 h-4 text-primary" />
                      </div>
                    ) : (
                      <div className="w-5 h-5 rounded-full bg-muted flex items-center justify-center flex-shrink-0 mt-0.5">
                        <X className="w-4 h-4 text-muted-foreground/30" />
                      </div>
                    )}
                    <span className={`text-sm ${hasFeature ? "text-foreground" : "text-muted-foreground"}`}>
                      {feature}
                    </span>
                  </div>
                )
              })}
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}
