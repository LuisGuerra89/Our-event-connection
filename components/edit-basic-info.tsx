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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Edit } from "lucide-react"

const skinTones = [
  { value: "fair", label: "Very Fair / Fair" },
  { value: "medium", label: "Light / Medium" },
  { value: "olive", label: "Olive" },
  { value: "dark", label: "Tan / Dark" },
  { value: "very_dark", label: "Deep Tan / Very Dark" },
  { value: "other", label: "Other" },
]

const occupations = [
  "Student",
  "Software Developer",
  "Designer",
  "Marketing",
  "Sales",
  "Business Owner",
  "Entrepreneur",
  "Finance",
  "Healthcare",
  "Education",
  "Construction",
  "Hospitality",
  "Entertainment",
  "Sports",
  "Retired",
  "Other",
]

const editBasicInfoSchema = z.object({
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().min(1, "Last name is required"),
  contactNumber: z.string().min(10, "Contact number must be at least 10 digits"),
  weight: z.coerce.number().min(30).max(300),
  skinTone: z.string(),
  occupation: z.string(),
  hobbies: z.string(),
})

type EditBasicInfoData = z.infer<typeof editBasicInfoSchema>

interface EditBasicInfoProps {
  profile: any
  attributes: any
}

export function EditBasicInfo({ profile, attributes }: EditBasicInfoProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<EditBasicInfoData>({
    resolver: zodResolver(editBasicInfoSchema),
    defaultValues: {
      firstName: profile?.first_name || "",
      lastName: profile?.last_name || "",
      contactNumber: profile?.phone || "",
      weight: profile?.weight || 70,
      skinTone: attributes?.skin_tone || "",
      occupation: attributes?.occupation || "",
      hobbies: attributes?.hobbies?.join(", ") || "",
    },
  })

  const onSubmit = async (data: EditBasicInfoData) => {
    try {
      setIsLoading(true)

      const response = await fetch("/api/user/basic-info", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          firstName: data.firstName,
          lastName: data.lastName,
          contactNumber: data.contactNumber,
          weight: data.weight,
          skinTone: data.skinTone,
          occupation: data.occupation,
          hobbies: data.hobbies.split(",").map((h) => h.trim()),
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update information")
      }

      toast({
        title: "Success!",
        description: "Your information has been updated.",
      })

      setIsEditing(false)
      // Refresh page to show updated data
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
            <div>
              <CardTitle>Basic Information</CardTitle>
              <CardDescription>Your personal details</CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              <Edit className="h-4 w-4 mr-2" />
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2">
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Full Name</p>
              <p className="text-base">
                {profile?.first_name} {profile?.last_name}
              </p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Contact</p>
              <p className="text-base">{profile?.phone || "Not specified"}</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Weight</p>
              <p className="text-base">{profile?.weight} kg</p>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Skin Tone</p>
              <Badge variant="outline">{attributes?.skin_tone || "Not specified"}</Badge>
            </div>
            <div>
              <p className="text-sm font-semibold text-muted-foreground mb-2">Occupation</p>
              <Badge variant="secondary">{attributes?.occupation || "Not specified"}</Badge>
            </div>
            {attributes?.hobbies && attributes.hobbies.length > 0 && (
              <div>
                <p className="text-sm font-semibold text-muted-foreground mb-2">Hobbies</p>
                <div className="flex flex-wrap gap-1">
                  {attributes.hobbies.map((hobby: string) => (
                    <Badge key={hobby} variant="outline" className="text-xs">
                      {hobby}
                    </Badge>
                  ))}
                </div>
              </div>
            )}
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Edit Basic Information</CardTitle>
        <CardDescription>Update your personal details</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="firstName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>First Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="lastName"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Last Name</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="contactNumber"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Contact Number</FormLabel>
                    <FormControl>
                      <Input {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="weight"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Weight (kg)</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="skinTone"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Skin Tone</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select skin tone" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {skinTones.map((tone) => (
                          <SelectItem key={tone.value} value={tone.value}>
                            {tone.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="occupation"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Occupation</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select occupation" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {occupations.map((occ) => (
                          <SelectItem key={occ} value={occ}>
                            {occ}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="hobbies"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hobbies (comma separated)</FormLabel>
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
