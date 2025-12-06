/**
 * Phase 2: Essential Preferences
 * Quick setup: Relationship type, age range, optional distance
 */

"use client";

import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { RelationshipTypeEnum } from "@/lib/types/detailed-profile";

const phase2Schema = z.object({
  relationshipType: z.enum([
    "monogamous",
    "open_relationship",
    "polyamorous",
    "casual_dating",
    "serious_long_term",
    "friendship_first",
    "not_sure",
  ]),
  ageRangeMin: z.number().min(18).max(100),
  ageRangeMax: z.number().min(18).max(100),
  distancePreference: z.number().min(0).optional().or(z.literal(0)), // Allow 0 and above
});

type Phase2FormData = z.infer<typeof phase2Schema>;

interface Phase2Props {
  onNext: (data: Phase2FormData) => void;
  isLoading?: boolean;
  onSkip?: () => void;
  defaultValues?: Partial<Phase2FormData>;
}

export default function Phase2EssentialPreferences({
  onNext,
  isLoading = false,
  onSkip,
  defaultValues,
}: Phase2Props) {
  const [ageRange, setAgeRange] = useState([
    defaultValues?.ageRangeMin || 25,
    defaultValues?.ageRangeMax || 40
  ]);

  const form = useForm<Phase2FormData>({
    resolver: zodResolver(phase2Schema),
    defaultValues: {
      relationshipType: defaultValues?.relationshipType || "serious_long_term",
      ageRangeMin: defaultValues?.ageRangeMin || 25,
      ageRangeMax: defaultValues?.ageRangeMax || 40,
      distancePreference: defaultValues?.distancePreference ?? 50, // Use ?? to allow 0
    },
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset({
        relationshipType: defaultValues.relationshipType || "serious_long_term",
        ageRangeMin: defaultValues.ageRangeMin || 25,
        ageRangeMax: defaultValues.ageRangeMax || 40,
        distancePreference: defaultValues.distancePreference ?? 50, // Use ?? to allow 0
      });
      setAgeRange([
        defaultValues.ageRangeMin || 25,
        defaultValues.ageRangeMax || 40
      ]);
    }
  }, [defaultValues, form]);

  const handleAgeChange = (values: number[]) => {
    setAgeRange(values);
    form.setValue("ageRangeMin", values[0]);
    form.setValue("ageRangeMax", values[1]);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Essential Preferences</CardTitle>
        <CardDescription>
          Let's start with the basics. You can update these anytime.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            {/* Relationship Type */}
            <FormField
              control={form.control}
              name="relationshipType"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>What are you looking for?</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select relationship type" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="monogamous">Monogamous relationship</SelectItem>
                      <SelectItem value="open_relationship">Open relationship</SelectItem>
                      <SelectItem value="polyamorous">Polyamorous</SelectItem>
                      <SelectItem value="casual_dating">Casual dating</SelectItem>
                      <SelectItem value="serious_long_term">Serious long-term</SelectItem>
                      <SelectItem value="friendship_first">Friendship first</SelectItem>
                      <SelectItem value="not_sure">Not sure yet</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>
                    This helps us suggest better matches
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Age Range */}
            <FormItem>
              <FormLabel>Age Range: {ageRange[0]} - {ageRange[1]} years</FormLabel>
              <div className="space-y-4 mt-4">
                <div>
                  <label className="text-sm text-gray-600">Minimum Age</label>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={ageRange[0]}
                    onChange={(e) => {
                      const newMin = Number(e.target.value);
                      if (newMin <= ageRange[1]) {
                        handleAgeChange([newMin, ageRange[1]]);
                      }
                    }}
                    className="w-full"
                  />
                </div>
                <div>
                  <label className="text-sm text-gray-600">Maximum Age</label>
                  <input
                    type="range"
                    min="18"
                    max="100"
                    value={ageRange[1]}
                    onChange={(e) => {
                      const newMax = Number(e.target.value);
                      if (newMax >= ageRange[0]) {
                        handleAgeChange([ageRange[0], newMax]);
                      }
                    }}
                    className="w-full"
                  />
                </div>
              </div>
              <FormDescription className="mt-4">
                We'll show you people within this age range
              </FormDescription>
            </FormItem>

            {/* Distance Preference */}
            <FormField
              control={form.control}
              name="distancePreference"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Distance Preference (km) - Optional</FormLabel>
                  <FormControl>
                    <input
                      type="number"
                      placeholder="e.g., 50"
                      min="0"
                      step="1"
                      {...field}
                      value={field.value === undefined ? "" : field.value}
                      onChange={(e) => {
                        const val = e.target.value;
                        field.onChange(val === "" ? undefined : Number(val));
                      }}
                      className="w-full px-3 py-2 border rounded-md"
                    />
                  </FormControl>
                  <FormDescription>
                    {field.value === 0 ? "0 = See everyone" : "Leave empty or set to 0 to see everyone"}
                  </FormDescription>
                </FormItem>
              )}
            />

            {/* Buttons */}
            <div className="flex gap-4 pt-6">
              {onSkip && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSkip}
                  disabled={isLoading}
                >
                  Skip for now
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Saving..." : "Continue"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
