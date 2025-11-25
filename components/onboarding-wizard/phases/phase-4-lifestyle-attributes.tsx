/**
 * Phase 4: Lifestyle Attributes
 * Hobbies, habits, preferences
 */

"use client";

import React from "react";
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
import { Checkbox } from "@/components/ui/checkbox";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const phase4Schema = z.object({
  religion: z.string().optional(),
  workoutFrequency: z.string().optional(),
  alcoholConsumption: z.string().optional(),
  nightclubFrequency: z.string().optional(),
  likesOutdoors: z.boolean().optional(),
});

type Phase4FormData = z.infer<typeof phase4Schema>;

interface Phase4Props {
  onNext: (data: Phase4FormData) => void;
  isLoading?: boolean;
  onSkip?: () => void;
}

export default function Phase4LifestyleAttributes({
  onNext,
  isLoading = false,
  onSkip,
}: Phase4Props) {
  const form = useForm<Phase4FormData>({
    resolver: zodResolver(phase4Schema),
    defaultValues: {
      religion: "not_specified",
      workoutFrequency: "not_specified",
      alcoholConsumption: "not_specified",
      nightclubFrequency: "not_specified",
      likesOutdoors: false,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Lifestyle & Habits</CardTitle>
        <CardDescription>
          Help us understand your lifestyle better
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Religion */}
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
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Workout Frequency */}
              <FormField
                control={form.control}
                name="workoutFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>How often do you work out?</FormLabel>
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

              {/* Alcohol Consumption */}
              <FormField
                control={form.control}
                name="alcoholConsumption"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Alcohol consumption</FormLabel>
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

              {/* Nightclub Frequency */}
              <FormField
                control={form.control}
                name="nightclubFrequency"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nightclub / Bar visits</FormLabel>
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

            {/* Likes Outdoors */}
            <FormField
              control={form.control}
              name="likesOutdoors"
              render={({ field }) => (
                <FormItem className="flex items-center space-x-2">
                  <FormControl>
                    <Checkbox
                      checked={!!field.value}
                      onCheckedChange={field.onChange}
                    />
                  </FormControl>
                  <FormLabel className="!mt-0">I like outdoor activities</FormLabel>
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
