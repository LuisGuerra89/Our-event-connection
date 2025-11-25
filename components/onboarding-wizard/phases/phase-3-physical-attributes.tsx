/**
 * Phase 3: Physical Attributes
 * What does the user look like?
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
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
const phase3Schema = z.object({
  hairLength: z.string().optional(),
  hairColor: z.string().optional(),
  eyeColor: z.string().optional(),
  bodyType: z.string().optional(),
  complexion: z.string().optional(),
  race: z.string().optional(),
  height: z.number().optional(),
});

type Phase3FormData = z.infer<typeof phase3Schema>;

interface Phase3Props {
  onNext: (data: Phase3FormData) => void;
  isLoading?: boolean;
  onSkip?: () => void;
}

export default function Phase3PhysicalAttributes({
  onNext,
  isLoading = false,
  onSkip,
}: Phase3Props) {
  const form = useForm<Phase3FormData>({
    resolver: zodResolver(phase3Schema),
    defaultValues: {
      hairLength: "not_specified",
      hairColor: "not_specified",
      eyeColor: "not_specified",
      bodyType: "not_specified",
      complexion: "not_specified",
      race: "not_specified",
      height: undefined,
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Physical Attributes</CardTitle>
        <CardDescription>
          Tell us about your physical appearance. You can select "Open to all" for any attribute you're flexible about.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            <div className="grid grid-cols-2 gap-4">
              {/* Hair Length */}
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

              {/* Hair Color */}
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
                        <SelectItem value="white">White</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Eye Color */}
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
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Body Type */}
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

              {/* Complexion */}
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
                        <SelectItem value="black">Black</SelectItem>
                        <SelectItem value="brown">Brown</SelectItem>
                        <SelectItem value="blonde">Blonde</SelectItem>
                        <SelectItem value="red">Red</SelectItem>
                        <SelectItem value="gray">Gray</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Race */}
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
                        <SelectItem value="pacific_islander">Pacific Islander</SelectItem>
                        <SelectItem value="mixed">Mixed</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Height */}
              <FormField
                control={form.control}
                name="height"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Height (cm)</FormLabel>
                    <FormControl>
                      <input
                        type="number"
                        placeholder="170"
                        value={field.value || ""}
                        onChange={(e) => field.onChange(e.target.value ? Number(e.target.value) : undefined)}
                        className="w-full px-3 py-2 border rounded-md"
                      />
                    </FormControl>
                  </FormItem>
                )}
              />
            </div>

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
