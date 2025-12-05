/**
 * Phase 7: Personal & Professional Information
 * Family, career, housing, and lifestyle details
 */

"use client";

import React, { useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const phase7Schema = z.object({
  maritalStatus: z.string().optional().nullable(),
  hasKids: z.boolean().optional(),
  kidsBoys: z.number().optional().nullable(),
  kidsGirls: z.number().optional().nullable(),
  occupation: z.string().optional().nullable(),
  ownsBusiness: z.boolean().optional(),
  businessType: z.string().optional().nullable(),
  housingStatus: z.string().optional().nullable(),
  lookingForRoommate: z.boolean().optional(),
  relationshipTypeSeeking: z.string().optional().nullable(),
  favoriteColor: z.string().optional().nullable(),
  dressCodePreference: z.string().optional().nullable(),
  
  // Beauty & wellness
  makeupSpendingFrequency: z.string().optional().nullable(),
  likesMassage: z.boolean().optional(),
  nailsDoneFrequency: z.string().optional().nullable(),
  facialFrequency: z.string().optional().nullable(),
});

type Phase7FormData = z.infer<typeof phase7Schema>;

interface Phase7Props {
  onNext: (data: Phase7FormData) => void;
  isLoading?: boolean;
  onSkip?: () => void;
  defaultValues?: Partial<Phase7FormData>;
}

export default function Phase7PersonalInfo({
  onNext,
  isLoading = false,
  onSkip,
  defaultValues,
}: Phase7Props) {
  const form = useForm<Phase7FormData>({
    resolver: zodResolver(phase7Schema),
    defaultValues: defaultValues || {},
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  const hasKids = form.watch("hasKids");
  const ownsBusiness = form.watch("ownsBusiness");

  return (
    <Card>
      <CardHeader>
        <CardTitle>Personal & Professional Life</CardTitle>
        <CardDescription>
          Tell us about your life situation and preferences
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-4 sm:space-y-6">
            {/* Family & Personal */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold">Family & Status</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="maritalStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Marital Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="single">Single</SelectItem>
                          <SelectItem value="married">Married</SelectItem>
                          <SelectItem value="divorced">Divorced</SelectItem>
                          <SelectItem value="widowed">Widowed</SelectItem>
                          <SelectItem value="separated">Separated</SelectItem>
                          <SelectItem value="domestic_partnership">Domestic Partnership</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="hasKids"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Do you have kids?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {hasKids && (
                  <>
                    <FormField
                      control={form.control}
                      name="kidsBoys"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many boys?</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={form.control}
                      name="kidsGirls"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>How many girls?</FormLabel>
                          <FormControl>
                            <Input
                              type="number"
                              placeholder="0"
                              value={field.value ?? ""}
                              onChange={(e) => field.onChange(e.target.value ? parseInt(e.target.value) : null)}
                            />
                          </FormControl>
                        </FormItem>
                      )}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Professional */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold">Career & Business</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="occupation"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Occupation</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Software Engineer" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="ownsBusiness"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Do you own a business?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                {ownsBusiness && (
                  <FormField
                    control={form.control}
                    name="businessType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Type of business</FormLabel>
                        <FormControl>
                          <Input placeholder="e.g., Restaurant, Tech Startup" {...field} value={field.value || ""} />
                        </FormControl>
                      </FormItem>
                    )}
                  />
                )}
              </div>
            </div>

            {/* Housing */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold">Housing</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="housingStatus"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Housing Status</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="renting">Renting</SelectItem>
                          <SelectItem value="owns_home">Own Home</SelectItem>
                          <SelectItem value="with_family">Living with Family</SelectItem>
                          <SelectItem value="other">Other</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="lookingForRoommate"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Looking for a roommate?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            {/* Beauty & Wellness */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold">Beauty & Wellness</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="makeupSpendingFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How often do you spend money on makeup?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="likesMassage"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0 rounded-md border p-3 sm:p-4">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>Do you like getting massages?</FormLabel>
                      </div>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="nailsDoneFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How often do you get your nails done?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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
                  name="facialFrequency"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>How often do you get facials?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
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

            {/* Preferences */}
            <div className="space-y-3 sm:space-y-4">
              <h3 className="text-sm font-semibold">Personal Preferences</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4">
                <FormField
                  control={form.control}
                  name="relationshipTypeSeeking"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>What type of relationship are you looking for?</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="monogamous">Monogamous</SelectItem>
                          <SelectItem value="open_relationship">Open Relationship</SelectItem>
                          <SelectItem value="polyamorous">Polyamorous</SelectItem>
                          <SelectItem value="casual_dating">Casual Dating</SelectItem>
                          <SelectItem value="serious_long_term">Serious Long-term</SelectItem>
                          <SelectItem value="friendship_first">Friendship First</SelectItem>
                          <SelectItem value="not_sure">Not Sure Yet</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="favoriteColor"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Favorite Color</FormLabel>
                      <FormControl>
                        <Input placeholder="e.g., Blue" {...field} value={field.value || ""} />
                      </FormControl>
                    </FormItem>
                  )}
                />

                <FormField
                  control={form.control}
                  name="dressCodePreference"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Dress Code Preference</FormLabel>
                      <Select onValueChange={field.onChange} value={field.value || ""}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Select..." />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="casual">Casual</SelectItem>
                          <SelectItem value="business_casual">Business Casual</SelectItem>
                          <SelectItem value="business">Business</SelectItem>
                          <SelectItem value="formal">Formal</SelectItem>
                          <SelectItem value="athletic">Athletic</SelectItem>
                          <SelectItem value="mixed">Mixed</SelectItem>
                        </SelectContent>
                      </Select>
                    </FormItem>
                  )}
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              {onSkip && (
                <Button type="button" variant="ghost" onClick={onSkip} className="w-full sm:w-auto">
                  Skip
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="w-full sm:flex-1">
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
