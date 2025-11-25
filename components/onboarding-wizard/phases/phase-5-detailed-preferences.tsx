/**
 * Phase 5: Detailed Preferences
 * What are you looking for in a partner?
 */

"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
} from "@/components/ui/form";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const phase5Schema = z.record(z.any()).optional();

type Phase5FormData = Record<string, any>;

interface Phase5Props {
  onComplete: () => void;
  isLoading?: boolean;
  onSkip?: () => void;
}

/**
 * Mini Component: Preference Setting
 * User can set: importance level + what they want
 */
function PreferenceSetting({
  label,
  attributeName,
  form,
  options,
}: {
  label: string;
  attributeName: string;
  form: any;
  options: { value: string; label: string }[];
}) {
  return (
    <Card className="mb-4 p-4">
      <div className="grid grid-cols-12 gap-4 items-end">
        {/* Label */}
        <div className="col-span-3">
          <FormLabel className="text-base font-semibold">{label}</FormLabel>
        </div>

        {/* Importance Level */}
        <div className="col-span-3">
          <FormLabel className="text-sm">How important?</FormLabel>
          <Select
            defaultValue="open_to_all"
            onValueChange={(val) =>
              form.setValue(`${attributeName}Importance`, val)
            }
          >
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="open_to_all">
                🔓 Open to all
              </SelectItem>
              <SelectItem value="not_important">
                Not important
              </SelectItem>
              <SelectItem value="somewhat_important">
                Somewhat important
              </SelectItem>
              <SelectItem value="important">
                Important
              </SelectItem>
              <SelectItem value="very_important">
                ⭐ Very important
              </SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Preferences */}
        <div className="col-span-6">
          <FormLabel className="text-sm">What you're looking for</FormLabel>
          <Select
            onValueChange={(val) =>
              form.setValue(`${attributeName}Preference`, [val])
            }
          >
            <SelectTrigger>
              <SelectValue placeholder="Select..." />
            </SelectTrigger>
            <SelectContent>
              {options.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>
    </Card>
  );
}

export default function Phase5DetailedPreferences({
  onComplete,
  isLoading = false,
  onSkip,
}: Phase5Props) {
  const form = useForm<Phase5FormData>({
    resolver: zodResolver(phase5Schema),
    defaultValues: {
      hairColorImportance: "open_to_all",
      bodyTypeImportance: "open_to_all",
      religionImportance: "open_to_all",
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fine-tune Your Preferences</CardTitle>
        <CardDescription>
          For each attribute, select how important it is to you and what you're looking for.
          Select "🔓 Open to all" if you're flexible.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onComplete)} className="space-y-6">
            <div className="space-y-4">
              {/* Hair Color */}
              <PreferenceSetting
                label="Hair Color"
                attributeName="hairColor"
                form={form}
                options={[
                  { value: "black", label: "Black" },
                  { value: "blonde", label: "Blonde" },
                  { value: "red", label: "Red" },
                  { value: "brown", label: "Brown" },
                  { value: "other", label: "Other" },
                ]}
              />

              {/* Body Type */}
              <PreferenceSetting
                label="Body Type"
                attributeName="bodyType"
                form={form}
                options={[
                  { value: "slim", label: "Slim" },
                  { value: "athletic", label: "Athletic" },
                  { value: "average", label: "Average" },
                  { value: "curvy", label: "Curvy" },
                  { value: "muscular", label: "Muscular" },
                  { value: "plus_size", label: "Plus Size" },
                ]}
              />

              {/* Religion */}
              <PreferenceSetting
                label="Religion"
                attributeName="religion"
                form={form}
                options={[
                  { value: "christian", label: "Christian" },
                  { value: "muslim", label: "Muslim" },
                  { value: "jewish", label: "Jewish" },
                  { value: "atheist", label: "Atheist" },
                  { value: "agnostic", label: "Agnostic" },
                  { value: "spiritual_not_religious", label: "Spiritual (not religious)" },
                  { value: "other", label: "Other" },
                ]}
              />

              {/* Workout Frequency */}
              <PreferenceSetting
                label="Workout Frequency"
                attributeName="workout"
                form={form}
                options={[
                  { value: "daily", label: "Daily" },
                  { value: "very_often", label: "Very often" },
                  { value: "often", label: "Often" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "rarely", label: "Rarely" },
                  { value: "never", label: "Never" },
                ]}
              />

              {/* Alcohol */}
              <PreferenceSetting
                label="Alcohol Consumption"
                attributeName="alcohol"
                form={form}
                options={[
                  { value: "never", label: "Never" },
                  { value: "rarely", label: "Rarely" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "often", label: "Often" },
                  { value: "very_often", label: "Very often" },
                  { value: "daily", label: "Daily" },
                ]}
              />
            </div>

            {/* Info Box */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 my-6">
              <p className="text-sm text-blue-900">
                💡 <strong>Pro Tip:</strong> Setting preferences to "🔓 Open to all" will increase your match pool significantly. You can always adjust later!
              </p>
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
                  Skip preferences
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="flex-1"
              >
                {isLoading ? "Completing..." : "Complete Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
