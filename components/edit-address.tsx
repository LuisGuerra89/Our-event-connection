"use client"

import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Edit, MapPin } from "lucide-react"
import AddressAutocompleteWithLocation from "@/components/address-autocomplete-with-location"

const editAddressSchema = z.object({
  address1: z.string().min(1, "Address is required"),
  address2: z.string().optional(),
  city: z.string().min(1, "City is required"),
  state: z.string().min(1, "State is required"),
  country: z.string().min(1, "Country is required"),
  zipCode: z.string().min(1, "Zip code is required"),
})

type EditAddressData = z.infer<typeof editAddressSchema>

interface EditAddressProps {
  profile: any
}

export function EditAddress({ profile }: EditAddressProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  const [countriesData, setCountriesData] = useState<any[]>([])

  const form = useForm<EditAddressData>({
    resolver: zodResolver(editAddressSchema),
    defaultValues: {
      address1: profile?.address_1 || "",
      address2: profile?.address_2 || "",
      city: profile?.location_city || "",
      state: profile?.location_state || "",
      country: profile?.location_country || "",
      zipCode: profile?.zip_code || "",
    },
  })

  const onSubmit = async (data: EditAddressData) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/user/address", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        throw new Error("Failed to update address")
      }

      toast({
        title: "Success!",
        description: "Your address has been updated.",
      })

      setIsEditing(false)
      window.location.reload()
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  if (!isEditing) {
    return (
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <MapPin className="h-5 w-5" />
              <div>
                <CardTitle>Address</CardTitle>
                <CardDescription>Your location information</CardDescription>
              </div>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-1">Street Address</p>
              <p className="text-base">{profile?.address_1 || "Not specified"}</p>
              {profile?.address_2 && <p className="text-sm text-muted-foreground">{profile.address_2}</p>}
            </div>
            <div className="grid gap-4 md:grid-cols-2">
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">City</p>
                <p className="text-base">{profile?.location_city || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">State</p>
                <p className="text-base">{profile?.location_state || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Country</p>
                <p className="text-base">{profile?.location_country || "Not specified"}</p>
              </div>
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-1">Zip Code</p>
                <p className="text-base">{profile?.zip_code || "Not specified"}</p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Address</CardTitle>
        <CardDescription>Update your location information</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="address1"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Street Address</FormLabel>
                  <FormControl>
                    <AddressAutocompleteWithLocation
                      label=""
                      placeholder="Street address"
                      onAddressSelect={(data) => {
                        field.onChange(data.address)
                        form.setValue("country", data.country || form.getValues("country"))
                        form.setValue("state", data.state || form.getValues("state"))
                        form.setValue("city", data.city || form.getValues("city"))
                      }}
                      countries={countriesData}
                      states={[]}
                      cities={[]}
                      initialAddress={field.value}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="address2"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Address 2 (Optional)</FormLabel>
                  <FormControl>
                    <Input {...field} />
                  </FormControl>
                </FormItem>
              )}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="city"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="state"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>State</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="country"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Country</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="zipCode"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex gap-2 justify-end pt-4 border-t">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsEditing(false)}
                disabled={isLoading}
              >
                Cancel
              </Button>
              <Button type="submit" disabled={isLoading}>
                {isLoading ? "Saving..." : "Save Changes"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  )
}
