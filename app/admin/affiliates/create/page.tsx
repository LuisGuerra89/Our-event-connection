"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertDescription } from "@/components/ui/alert"
import Link from "next/link"
import { ArrowLeft, AlertCircle } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

export default function CreateAffiliatePage() {
  const [isLoading, setIsLoading] = useState(false)
  const router = useRouter()
  const supabase = createClient()

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setIsLoading(true)

    try {
      const formData = new FormData(e.currentTarget)
      const name = formData.get("name") as string
      const description = formData.get("description") as string
      const address = formData.get("address") as string
      const city = formData.get("city") as string
      const state = formData.get("state") as string
      const country = formData.get("country") as string

      const { data: userData } = await supabase.auth.getUser()

      if (!userData.user) {
        alert("You must be logged in")
        return
      }

      const { error } = await supabase.from("affiliates").insert({
        user_id: userData.user.id,
        name,
        description,
        address,
        city,
        state,
        country,
        approval_status: "pending",
        application_date: new Date().toISOString(),
      })

      if (error) {
        alert("Error creating partner: " + error.message)
        return
      }

      router.push("/admin/affiliates?success=created")
    } catch (err) {
      console.error(err)
      alert("Error creating partner")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="container mx-auto py-8 max-w-2xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/affiliates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Add New Partner</CardTitle>
          <CardDescription>Create a new affiliate partner manually</CardDescription>
        </CardHeader>

        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Business Information */}
            <div>
              <Label htmlFor="name">Business Name *</Label>
              <Input
                id="name"
                name="name"
                placeholder="Business or Company Name"
                required
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            {/* Description */}
            <div>
              <Label htmlFor="description">Description *</Label>
              <Textarea
                id="description"
                name="description"
                placeholder="Describe the business..."
                required
                disabled={isLoading}
                rows={4}
                className="mt-2"
              />
            </div>

            {/* Address */}
            <div>
              <Label htmlFor="address">Address *</Label>
              <Input
                id="address"
                name="address"
                placeholder="Street address"
                required
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            {/* Location */}
            <div className="grid md:grid-cols-2 gap-4">
              <div>
                <Label htmlFor="city">City</Label>
                <Input
                  id="city"
                  name="city"
                  placeholder="City"
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>
              <div>
                <Label htmlFor="state">State/Province</Label>
                <Input
                  id="state"
                  name="state"
                  placeholder="State"
                  disabled={isLoading}
                  className="mt-2"
                />
              </div>
            </div>

            <div>
              <Label htmlFor="country">Country</Label>
              <Input
                id="country"
                name="country"
                placeholder="Country"
                disabled={isLoading}
                className="mt-2"
              />
            </div>

            <Alert>
              <AlertCircle className="h-4 w-4" />
              <AlertDescription>
                This affiliate will be created with "Pending Review" status. You can approve or reject it from the details page.
              </AlertDescription>
            </Alert>

            <div className="flex gap-3">
              <Button type="submit" className="flex-1" size="lg" disabled={isLoading}>
                {isLoading ? "Creating..." : "Create Partner"}
              </Button>
              <Button type="button" variant="outline" asChild disabled={isLoading}>
                <Link href="/admin/affiliates">Cancel</Link>
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  )
}
