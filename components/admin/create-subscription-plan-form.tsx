"use client"

import { useState } from "react"
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

export function CreateSubscriptionPlanForm() {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    plan_type: "monthly",
    price: "",
    duration_days: "",
    auto_renewal: false,
    status: "active",
    features: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      // Parse features from textarea (one per line, non-empty)
      const featuresArray = formData.features
        .split('\n')
        .map(f => f.trim())
        .filter(f => f.length > 0)

      const payload = {
        name: formData.name,
        description: formData.description,
        plan_type: formData.plan_type,
        price: parseFloat(formData.price),
        duration_days: formData.duration_days ? parseInt(formData.duration_days) : null,
        auto_renewal: formData.auto_renewal,
        status: formData.status,
        features: featuresArray,
      }

      const response = await fetch("/api/admin/subscription-plans", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to create subscription plan")
      }

      toast({
        title: "Success",
        description: "Subscription plan created successfully in Stripe and database",
      })

      router.push("/admin/subscriptions")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to create subscription plan",
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
          <CardTitle>Create Subscription Plan</CardTitle>
          <CardDescription>
            Add a new subscription plan. This will create a product and price in Stripe automatically.
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
              <Label htmlFor="plan_type">Type *</Label>
              <Select
                value={formData.plan_type}
                onValueChange={(value) => setFormData({ ...formData, plan_type: value })}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="duration_days">Duration (Days) {formData.plan_type === "custom" && "*"}</Label>
              <Input
                id="duration_days"
                type="number"
                min="1"
                value={formData.duration_days}
                onChange={(e) => setFormData({ ...formData, duration_days: e.target.value })}
                placeholder={formData.plan_type === "custom" ? "e.g., 90" : "Leave empty for unlimited duration"}
                required={formData.plan_type === "custom"}
              />
              <p className="text-sm text-muted-foreground">
                {formData.plan_type === "custom" 
                  ? "Required for custom plans" 
                  : "Optional. Leave empty for plans without duration limit (e.g., free plans)"}
              </p>
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price (USD) *</Label>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                value={formData.price}
                onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                placeholder="e.g., 29.99"
                required
              />
            </div>

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
              <Label htmlFor="features">Features (One per line)</Label>
              <Textarea
                id="features"
                value={formData.features}
                onChange={(e) => setFormData({ ...formData, features: e.target.value })}
                placeholder="AI Notification Match&#10;Browse Profile&#10;Like Profile&#10;Send Messages"
                rows={6}
              />
              <p className="text-sm text-muted-foreground">
                Enter each feature on a new line. Empty lines will be ignored.
              </p>
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

            <div className="flex gap-4">
              <Button type="submit" disabled={loading}>
                {loading ? "Creating..." : "Create Plan"}
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
