/**
 * Phase 5: Detailed Preferences
 * What are you looking for in a partner?
 */

"use client";

import React from "react";
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
import { Form } from "@/components/ui/form";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";

const phase5Schema = z.record(z.any()).optional();

type Phase5FormData = Record<string, any>;

interface Phase5Props {
  onComplete: (data?: Phase5FormData) => void;
  isLoading?: boolean;
  onSkip?: () => void;
}

const importanceOptions = [
  { value: "open_to_all", label: "OPEN TO ALL", weight: "0x" },
  { value: "not_important", label: "Not Important", weight: "1x" },
  { value: "somewhat_important", label: "Somewhat Important", weight: "2x" },
  { value: "important", label: "Important", weight: "3x" },
  { value: "very_important", label: "Very Important", weight: "5x" },
];

/**
 * Mini Component: Preference Setting
 * User can set: importance level + what they want (with badges)
 */
function PreferenceSetting({
  label,
  attributeName,
  form,
  options,
  allowMultiple = true,
}: {
  label: string;
  attributeName: string;
  form: any;
  options: { value: string; label: string }[];
  allowMultiple?: boolean;
}) {
  const importanceValue = form.watch(`${attributeName}Importance`) || "open_to_all";
  const selectedValues = form.watch(`${attributeName}Preference`) || [];
  const isOpenToAll = importanceValue === "open_to_all";

  const handleValueToggle = (value: string) => {
    if (!allowMultiple) {
      form.setValue(`${attributeName}Preference`, [value]);
    } else {
      if (selectedValues.includes(value)) {
        form.setValue(`${attributeName}Preference`, selectedValues.filter((v: string) => v !== value));
      } else {
        form.setValue(`${attributeName}Preference`, [...selectedValues, value]);
      }
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{label}</h4>
        </div>
        <div className="w-full sm:w-[180px]">
          <Select 
            value={importanceValue}
            onValueChange={(val) => form.setValue(`${attributeName}Importance`, val)}
          >
            <SelectTrigger className="h-9 text-xs sm:text-sm">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {importanceOptions.map((opt) => (
                <SelectItem key={opt.value} value={opt.value}>
                  {opt.label} <span className="text-xs text-muted-foreground">({opt.weight})</span>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {!isOpenToAll && (
        <div className="flex flex-wrap gap-1.5 sm:gap-2 pt-2">
          {options.map((option) => {
            const isSelected = selectedValues.includes(option.value);
            return (
              <Badge
                key={option.value}
                variant={isSelected ? "default" : "outline"}
                className="cursor-pointer text-xs"
                onClick={() => handleValueToggle(option.value)}
              >
                {option.label}
                {isSelected && <X className="ml-1 h-3 w-3" />}
              </Badge>
            );
          })}
        </div>
      )}
    </div>
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
      hairColorPreference: [],
      bodyTypeImportance: "open_to_all",
      bodyTypePreference: [],
      religionImportance: "open_to_all",
      religionPreference: [],
      workoutImportance: "open_to_all",
      workoutPreference: [],
      alcoholImportance: "open_to_all",
      alcoholPreference: [],
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Fine-tune Your Preferences</CardTitle>
        <CardDescription>
          For each attribute, select how important it is to you and what you're looking for.
          Select "OPEN TO ALL" if you're flexible - this will show you more potential matches!
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onComplete)} className="space-y-4">
            <div className="space-y-3">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mt-6">
              <p className="text-sm text-blue-900">
                💡 <strong>Pro Tip:</strong> Setting preferences to "OPEN TO ALL" will show you more matches. Click on the badges to select multiple options when you specify preferences!
              </p>
            </div>

            {/* Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 pt-4">
              {onSkip && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={onSkip}
                  disabled={isLoading}
                  className="w-full sm:w-auto"
                >
                  Skip preferences
                </Button>
              )}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full sm:flex-1"
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
