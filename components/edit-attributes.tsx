"use client"

import React, { useState } from "react"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { z } from "zod"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"

const attributesSchema = z.object({
  hairLength: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  bodyType: z.string().optional(),
  complexion: z.string().optional(),
  race: z.string().optional(),
  height: z.number().optional(),
  religion: z.string().optional(),
  workoutFrequency: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  nightclubFrequency: z.string().optional(),
})

type AttributesFormData = z.infer<typeof attributesSchema>

interface EditAttributesProps {
  currentAttributes: any
}

export function EditAttributes({ currentAttributes }: EditAttributesProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()

  const form = useForm<AttributesFormData>({
    resolver: zodResolver(attributesSchema),
    defaultValues: {
      hairLength: currentAttributes?.hair_length || "not_specified",
      hairColor: currentAttributes?.hair_color || "not_specified",
      eyeColor: currentAttributes?.eye_color || "not_specified",
      bodyType: currentAttributes?.body_type || "not_specified",
      complexion: currentAttributes?.complexion || "not_specified",
      race: currentAttributes?.race || "not_specified",
      height: currentAttributes?.height || undefined,
      religion: currentAttributes?.religion || "not_specified",
      workoutFrequency: currentAttributes?.workout_frequency || "not_specified",
      alcoholConsumption: currentAttributes?.alcohol_consumption_frequency || "not_specified",
      nightclubFrequency: currentAttributes?.nightclub_bar_frequency || "not_specified",
    },
  })

  const onSubmit = async (data: AttributesFormData) => {
    try {
      setIsLoading(true)
      const response = await fetch("/api/user/attributes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          physical: {
            hairLength: data.hairLength,
            hairColor: data.hairColor,
            eyeColor: data.eyeColor,
            bodyType: data.bodyType,
            complexion: data.complexion,
            race: data.race,
            height: data.height,
          },
          lifestyle: {
            religion: data.religion,
            workoutFrequency: data.workoutFrequency,
            alcoholConsumption: data.alcoholConsumption,
            nightclubFrequency: data.nightclubFrequency,
          },
        }),
      })

      if (!response.ok) {
        throw new Error("Failed to update attributes")
      }

      toast({
        title: "Success!",
        description: "Your attributes have been updated.",
      })
      setIsEditing(false)
    } catch (error) {
      console.error("Error:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to update attributes",
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
              <CardTitle>Physical & Lifestyle Attributes</CardTitle>
              <CardDescription>Your personal characteristics and preferences</CardDescription>
            </div>
            <Button onClick={() => setIsEditing(true)} variant="outline" size="sm">
              Edit
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6">
            {/* Physical Attributes */}
            <div>
              <h3 className="font-semibold mb-3">Physical</h3>
              <div className="flex flex-wrap gap-2">
                {currentAttributes?.hair_color && (
                  <Badge variant="secondary">{currentAttributes.hair_color} hair</Badge>
                )}
                {currentAttributes?.hair_length && (
                  <Badge variant="secondary">{currentAttributes.hair_length}</Badge>
                )}
                {currentAttributes?.eye_color && (
                  <Badge variant="secondary">{currentAttributes.eye_color} eyes</Badge>
                )}
                {currentAttributes?.body_type && (
                  <Badge variant="secondary">{currentAttributes.body_type}</Badge>
                )}
                {currentAttributes?.complexion && (
                  <Badge variant="secondary">{currentAttributes.complexion}</Badge>
                )}
                {currentAttributes?.height && (
                  <Badge variant="secondary">{currentAttributes.height} cm</Badge>
                )}
                {currentAttributes?.race && (
                  <Badge variant="secondary">{currentAttributes.race}</Badge>
                )}
                {!currentAttributes && <span className="text-muted-foreground">No attributes set</span>}
              </div>
            </div>

            {/* Lifestyle Attributes */}
            <div>
              <h3 className="font-semibold mb-3">Lifestyle</h3>
              <div className="flex flex-wrap gap-2">
                {currentAttributes?.religion && (
                  <Badge variant="secondary">{currentAttributes.religion}</Badge>
                )}
                {currentAttributes?.workout_frequency && (
                  <Badge variant="secondary">Workout: {currentAttributes.workout_frequency}</Badge>
                )}
                {currentAttributes?.alcohol_consumption_frequency && (
                  <Badge variant="secondary">Alcohol: {currentAttributes.alcohol_consumption_frequency}</Badge>
                )}
                {currentAttributes?.nightclub_bar_frequency && (
                  <Badge variant="secondary">Nightlife: {currentAttributes.nightclub_bar_frequency}</Badge>
                )}
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
        <CardTitle>Edit Attributes</CardTitle>
        <CardDescription>Update your physical and lifestyle attributes</CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
            <div>
              <h3 className="font-semibold mb-4">Physical Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="hairLength"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hair Length</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="very_short">Very Short</SelectItem>
                          <SelectItem value="short">Short</SelectItem>
                          <SelectItem value="shoulder_length">Shoulder Length</SelectItem>
                          <SelectItem value="long">Long</SelectItem>
                          <SelectItem value="very_long">Very Long</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hairColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Hair Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="black">Black</SelectItem>
                          <SelectItem value="dark_brown">Dark Brown</SelectItem>
                          <SelectItem value="light_brown">Light Brown</SelectItem>
                          <SelectItem value="blonde">Blonde</SelectItem>
                          <SelectItem value="red">Red</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="eyeColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Eye Color</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="blue">Blue</SelectItem>
                          <SelectItem value="green">Green</SelectItem>
                          <SelectItem value="brown">Brown</SelectItem>
                          <SelectItem value="amber">Amber</SelectItem>
                          <SelectItem value="gray">Gray</SelectItem>
                          <SelectItem value="hazel">Hazel</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="bodyType"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Body Type</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="slim">Slim</SelectItem>
                          <SelectItem value="athletic">Athletic</SelectItem>
                          <SelectItem value="average">Average</SelectItem>
                          <SelectItem value="curvy">Curvy</SelectItem>
                          <SelectItem value="muscular">Muscular</SelectItem>
                          <SelectItem value="plus_size">Plus Size</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="complexion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Complexion</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="fair">Very Fair / Fair</SelectItem>
                          <SelectItem value="medium">Light / Medium</SelectItem>
                          <SelectItem value="olive">Olive</SelectItem>
                          <SelectItem value="dark">Tan / Dark</SelectItem>
                          <SelectItem value="very_dark">Deep Tan / Very Dark</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="race"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Race/Ethnicity</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="white">White</SelectItem>
                          <SelectItem value="black_african_american">Black / African American</SelectItem>
                          <SelectItem value="hispanic_latino">Hispanic / Latino</SelectItem>
                          <SelectItem value="asian">Asian</SelectItem>
                          <SelectItem value="middle_eastern">Middle Eastern</SelectItem>
                          <SelectItem value="native_american">Native American</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="height"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Height (cm)</FormLabel>
                      <FormControl>
                        <Input
                          type="number"
                          placeholder="170"
                          value={field.value || ""}
                          onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        />
                      </FormControl>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div>
              <h3 className="font-semibold mb-4">Lifestyle Attributes</h3>
              <div className="grid grid-cols-2 gap-4">
                <FormField
                  control={form.control}
                  name="religion"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Religion</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="agnostic">Agnostic</SelectItem>
                          <SelectItem value="atheist">Atheist</SelectItem>
                          <SelectItem value="buddhist">Buddhist</SelectItem>
                          <SelectItem value="christian">Christian</SelectItem>
                          <SelectItem value="hindu">Hindu</SelectItem>
                          <SelectItem value="jewish">Jewish</SelectItem>
                          <SelectItem value="muslim">Muslim</SelectItem>
                          <SelectItem value="spiritual_not_religious">Spiritual (not religious)</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="workoutFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Workout Frequency</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="sometimes">Sometimes</SelectItem>
                          <SelectItem value="often">Often</SelectItem>
                          <SelectItem value="very_often">Very Often</SelectItem>
                          <SelectItem value="daily">Daily</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="alcoholConsumption"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Alcohol Consumption</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="sometimes">Sometimes</SelectItem>
                          <SelectItem value="often">Often</SelectItem>
                          <SelectItem value="very_often">Very Often</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nightclubFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nightclub / Bar Visits</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value || "not_specified"}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="not_specified">Not specified</SelectItem>
                          <SelectItem value="never">Never</SelectItem>
                          <SelectItem value="rarely">Rarely</SelectItem>
                          <SelectItem value="sometimes">Sometimes</SelectItem>
                          <SelectItem value="often">Often</SelectItem>
                          <SelectItem value="very_often">Very Often</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-4">
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
