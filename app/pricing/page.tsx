import { createServerClient } from "@/lib/supabase/server"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Check } from "lucide-react"
import { PublicPageLayout } from "@/components/public-page-layout"

export default async function PricingPage() {
  const supabase = await createServerClient()

  const { data: plans } = await supabase
    .from("subscription_plans")
    .select("*")
    .eq("status", "active")
    .order("price", { ascending: true })

  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">{"Choose Your Plan"}</h1>
          <p className="text-xl text-muted-foreground">{"Select the perfect subscription for your needs"}</p>
        </div>

        <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
          {plans?.map((plan) => (
            <Card key={plan.id} className={plan.is_featured ? "border-primary shadow-lg" : ""}>
              <CardHeader>
                <CardTitle className="text-2xl">{plan.name}</CardTitle>
                <CardDescription>{plan.description}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="text-4xl font-bold">
                  ${plan.price}
                  <span className="text-lg font-normal text-muted-foreground">/{plan.billing_period}</span>
                </div>
                <ul className="space-y-2">
                  {plan.features &&
                    JSON.parse(plan.features).map((feature: string, index: number) => (
                      <li key={index} className="flex items-start gap-2">
                        <Check className="h-5 w-5 text-primary flex-shrink-0 mt-0.5" />
                        <span>{feature}</span>
                      </li>
                    ))}
                </ul>
              </CardContent>
              <CardFooter>
                <Button className="w-full" variant={plan.is_featured ? "default" : "outline"}>
                  {plan.is_featured ? "Get Started" : "Choose Plan"}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      </div>
    </PublicPageLayout>
  )
}
