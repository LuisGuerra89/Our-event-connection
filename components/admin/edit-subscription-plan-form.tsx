"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Switch } from "@/components/ui/switch"
import { useToast } from "@/hooks/use-toast"
import { ArrowLeft } from "lucide-react"
import Link from "next/link"

interface SubscriptionPlan {
  id: string
  name: string
  description: string | null
  plan_type: string
  price: number
  duration_days: number | null
  auto_renewal: boolean
  status: string
  stripe_product_id: string | null
  stripe_price_id: string | null
}

interface EditSubscriptionPlanFormProps {
  plan: SubscriptionPlan
}

export function EditSubscriptionPlanForm({ plan }: EditSubscriptionPlanFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: plan.name,
    description: plan.description || "",
    auto_renewal: plan.auto_renewal,
    status: plan.status,
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const response = await fetch(`/api/admin/subscription-plans/${plan.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to update subscription plan")
      }

      toast({
        title: "Success",
        description: "Subscription plan updated successfully in Stripe and database",
      })

      router.push("/admin/subscriptions")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update subscription plan",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <div className="mb-6">
        <Button variant="ghost" asChild>
          <Link href="/admin/subscriptions">
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to Subscription Plans
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Edit Subscription Plan</CardTitle>
          <CardDescription>
            Update subscription plan details. Changes will be synced with Stripe.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="name">Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="e.g., Premium Monthly"
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                placeholder="Describe the features and benefits of this plan"
                rows={4}
              />
            </div>

            <div className="space-y-2">
              <Label>Type</Label>
              <Input value={plan.plan_type} disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground">
                Plan type cannot be changed after creation
              </p>
            </div>

            <div className="space-y-2">
              <Label>Price (USD)</Label>
              <Input value={`$${plan.price.toFixed(2)}`} disabled className="bg-muted" />
              <p className="text-sm text-muted-foreground">
                Price cannot be changed. Create a new plan for different pricing.
              </p>
            </div>

            {plan.duration_days && (
              <div className="space-y-2">
                <Label>Duration (Days)</Label>
                <Input value={plan.duration_days} disabled className="bg-muted" />
              </div>
            )}

            <div className="flex items-center justify-between rounded-lg border p-4">
              <div className="space-y-0.5">
                <Label htmlFor="auto_renewal">Auto Renewal</Label>
                <p className="text-sm text-muted-foreground">
                  Automatically renew subscription at the end of the period
                </p>
              </div>
              <Switch
                id="auto_renewal"
                checked={formData.auto_renewal}
                onCheckedChange={(checked) => setFormData({ ...formData, auto_renewal: checked })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status *</Label>
              <Select
                value={formData.status}
                onValueChange={(value) => setFormData({ ...formData, status: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="active">Active</SelectItem>
                  <SelectItem value="inactive">Inactive</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {plan.stripe_product_id && (
              <div className="rounded-lg bg-muted p-4 space-y-2">
                <p className="text-sm font-medium">Stripe Integration</p>
                <p className="text-xs text-muted-foreground">
                  Product ID: {plan.stripe_product_id}
                </p>
                <p className="text-xs text-muted-foreground">
                  Price ID: {plan.stripe_price_id}
                </p>
              </div>
            )}

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Updating..." : "Update Plan"}
              </Button>
              <Button type="button" variant="outline" onClick={() => router.back()} disabled={loading}>
                Cancel
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
