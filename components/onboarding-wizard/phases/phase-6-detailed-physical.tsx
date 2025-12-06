/**
 * Phase 6: Detailed Physical Attributes
 * Extended physical appearance questions
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const phase6Schema = z.object({
  forehead: z.string().optional().nullable(),
  cheekbones: z.string().optional().nullable(),
  nose: z.string().optional().nullable(),
  lips: z.string().optional().nullable(),
  handSize: z.string().optional().nullable(),
  buttocks: z.string().optional().nullable(),
  legs: z.string().optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  breastSize: z.string().optional().nullable(),
  penisSize: z.string().optional().nullable(),
  hasTattoos: z.string().optional().nullable(),
});

type Phase6FormData = z.infer<typeof phase6Schema>;

interface Phase6Props {
  onNext: (data: Phase6FormData) => void;
  isLoading?: boolean;
  onSkip?: () => void;
  defaultValues?: Partial<Phase6FormData>;
}

export default function Phase6DetailedPhysical({
  onNext,
  isLoading = false,
  onSkip,
  defaultValues,
}: Phase6Props) {
  const form = useForm<Phase6FormData>({
    resolver: zodResolver(phase6Schema),
    defaultValues: defaultValues || {},
  });

  // Reset form when defaultValues change
  useEffect(() => {
    if (defaultValues) {
      form.reset(defaultValues);
    }
  }, [defaultValues, form]);

  return (
    <Card>
      <CardHeader>
        <CardTitle>More About Your Appearance</CardTitle>
        <CardDescription>
          Help us match you better by sharing more details (all optional)
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-4 sm:space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 sm:gap-4 md:gap-6">
              {/* Forehead */}
              <FormField
                control={form.control}
                name="forehead"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Forehead Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="broad">Broad</SelectItem>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Nose */}
              <FormField
                control={form.control}
                name="nose"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nose Shape</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="button">Button</SelectItem>
                        <SelectItem value="snub">Snub</SelectItem>
                        <SelectItem value="roman">Roman</SelectItem>
                        <SelectItem value="grecian">Grecian</SelectItem>
                        <SelectItem value="nubian">Nubian</SelectItem>
                        <SelectItem value="hawk">Hawk</SelectItem>
                        <SelectItem value="celestial">Celestial</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Cheekbones */}
              <FormField
                control={form.control}
                name="cheekbones"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Cheekbones</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="high">High</SelectItem>
                        <SelectItem value="prominent">Prominent</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="soft">Soft</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Lips */}
              <FormField
                control={form.control}
                name="lips"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Lips Type</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="thin">Thin</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="very_full">Very Full</SelectItem>
                        <SelectItem value="heart_shaped">Heart Shaped</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Hand Size */}
              <FormField
                control={form.control}
                name="handSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Hand Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="petite">Petite</SelectItem>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="very_large">Very Large</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Buttocks */}
              <FormField
                control={form.control}
                name="buttocks"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Buttocks</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="curvy">Curvy</SelectItem>
                        <SelectItem value="full">Full</SelectItem>
                        <SelectItem value="athletic">Athletic</SelectItem>
                        <SelectItem value="other">Other</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Legs */}
              <FormField
                control={form.control}
                name="legs"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Legs</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="short">Short</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="long">Long</SelectItem>
                        <SelectItem value="athletic">Athletic</SelectItem>
                        <SelectItem value="curvy">Curvy</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Shoe Size */}
              <FormField
                control={form.control}
                name="shoeSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Shoe Size (US)</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        step="0.5"
                        placeholder="e.g., 9"
                        value={field.value ?? ""}
                        onChange={(e) => field.onChange(e.target.value ? parseFloat(e.target.value) : null)}
                      />
                    </FormControl>
                  </FormItem>
                )}
              />

              {/* Breast Size */}
              <FormField
                control={form.control}
                name="breastSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Breast Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="a">A</SelectItem>
                        <SelectItem value="b">B</SelectItem>
                        <SelectItem value="c">C</SelectItem>
                        <SelectItem value="d">D</SelectItem>
                        <SelectItem value="e">E</SelectItem>
                        <SelectItem value="f">F+</SelectItem>
                        <SelectItem value="other">Other/N/A</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Penis Size */}
              <FormField
                control={form.control}
                name="penisSize"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Penis Size</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="small">Small</SelectItem>
                        <SelectItem value="average">Average</SelectItem>
                        <SelectItem value="large">Large</SelectItem>
                        <SelectItem value="very_large">Very Large</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />

              {/* Tattoos */}
              <FormField
                control={form.control}
                name="hasTattoos"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Do you have Tattoos?</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value || ""}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select..." />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="none">No tattoos</SelectItem>
                        <SelectItem value="small_few">A few small ones</SelectItem>
                        <SelectItem value="several">Several</SelectItem>
                        <SelectItem value="extensive">Extensive</SelectItem>
                        <SelectItem value="prefer_not_to_say">Prefer not to say</SelectItem>
                      </SelectContent>
                    </Select>
                  </FormItem>
                )}
              />
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
