/**
 * Phase 8: Detailed Matching Preferences
 * What you're looking for in a partner with importance levels and "Open to All" option
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
  FormDescription,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { X } from "lucide-react";

const phase8Schema = z.object({
  // Physical Preferences
  foreheadImportance: z.string().default("open_to_all"),
  foreheadPreference: z.array(z.string()).default([]),
  
  noseImportance: z.string().default("open_to_all"),
  nosePreference: z.array(z.string()).default([]),
  
  cheekbonesImportance: z.string().default("open_to_all"),
  cheekbonesPreference: z.array(z.string()).default([]),
  
  lipsImportance: z.string().default("open_to_all"),
  lipsPreference: z.array(z.string()).default([]),
  
  handSizeImportance: z.string().default("open_to_all"),
  handSizePreference: z.array(z.string()).default([]),
  
  buttocksImportance: z.string().default("open_to_all"),
  buttocksPreference: z.array(z.string()).default([]),
  
  legsImportance: z.string().default("open_to_all"),
  legsPreference: z.array(z.string()).default([]),
  
  shoeSizeImportance: z.string().default("open_to_all"),
  shoeSizeMin: z.number().optional().nullable(),
  shoeSizeMax: z.number().optional().nullable(),
  
  breastSizeImportance: z.string().default("open_to_all"),
  breastSizePreference: z.array(z.string()).default([]),
  
  penisSizeImportance: z.string().default("open_to_all"),
  penisSizePreference: z.array(z.string()).default([]),
  
  tattooImportance: z.string().default("open_to_all"),
  tattooPreference: z.array(z.string()).default([]),

  // Lifestyle & Personal Preferences
  maritalStatusImportance: z.string().default("open_to_all"),
  maritalStatusPreference: z.array(z.string()).default([]),
  
  kidsImportance: z.string().default("open_to_all"),
  kidsPreference: z.array(z.string()).default([]),
  
  occupationImportance: z.string().default("open_to_all"),
  
  housingStatusImportance: z.string().default("open_to_all"),
  housingStatusPreference: z.array(z.string()).default([]),
  
  makeupSpendingImportance: z.string().default("open_to_all"),
  makeupSpendingPreference: z.array(z.string()).default([]),
  
  massageImportance: z.string().default("open_to_all"),
  
  nailsFrequencyImportance: z.string().default("open_to_all"),
  nailsFrequencyPreference: z.array(z.string()).default([]),
  
  facialFrequencyImportance: z.string().default("open_to_all"),
  facialFrequencyPreference: z.array(z.string()).default([]),
  
  relationshipTypeImportance: z.string().default("open_to_all"),
  relationshipTypePreference: z.array(z.string()).default([]),
});

type Phase8FormData = z.infer<typeof phase8Schema>;

interface Phase8Props {
  onNext: (data: Phase8FormData) => void;
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

interface PreferenceSettingProps {
  title: string;
  description?: string;
  importanceValue: string;
  onImportanceChange: (value: string) => void;
  selectedValues: string[];
  onValuesChange: (values: string[]) => void;
  options: { value: string; label: string }[];
  allowMultiple?: boolean;
  isDisabled?: boolean;
}

function PreferenceSetting({
  title,
  description,
  importanceValue,
  onImportanceChange,
  selectedValues,
  onValuesChange,
  options,
  allowMultiple = true,
  isDisabled = false,
}: PreferenceSettingProps) {
  const isOpenToAll = importanceValue === "open_to_all";

  const handleValueToggle = (value: string) => {
    if (!allowMultiple) {
      onValuesChange([value]);
    } else {
      if (selectedValues.includes(value)) {
        onValuesChange(selectedValues.filter((v) => v !== value));
      } else {
        onValuesChange([...selectedValues, value]);
      }
    }
  };

  return (
    <div className="space-y-3 rounded-lg border p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={importanceValue} onValueChange={onImportanceChange} disabled={isDisabled}>
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

interface RangePreferenceProps {
  title: string;
  description?: string;
  importanceValue: string;
  onImportanceChange: (value: string) => void;
  minValue: number | null | undefined;
  maxValue: number | null | undefined;
  onMinChange: (value: number | null) => void;
  onMaxChange: (value: number | null) => void;
  step?: number;
  unit?: string;
}

function RangePreference({
  title,
  description,
  importanceValue,
  onImportanceChange,
  minValue,
  maxValue,
  onMinChange,
  onMaxChange,
  step = 1,
  unit,
}: RangePreferenceProps) {
  const isOpenToAll = importanceValue === "open_to_all";

  return (
    <div className="space-y-3 rounded-lg border p-3 sm:p-4">
      <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-2 sm:gap-4">
        <div className="flex-1">
          <h4 className="text-sm font-medium">{title}</h4>
          {description && (
            <p className="text-xs text-muted-foreground mt-1">{description}</p>
          )}
        </div>
        <div className="w-full sm:w-[180px]">
          <Select value={importanceValue} onValueChange={onImportanceChange}>
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
        <div className="grid grid-cols-2 gap-2 sm:gap-3 pt-2">
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Min {unit}</label>
            <input
              type="number"
              step={step}
              value={minValue || ""}
              onChange={(e) => onMinChange(e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full rounded-md border px-2 sm:px-3 py-1.5 text-sm"
              placeholder="Min"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground block mb-1">Max {unit}</label>
            <input
              type="number"
              step={step}
              value={maxValue || ""}
              onChange={(e) => onMaxChange(e.target.value ? parseFloat(e.target.value) : null)}
              className="w-full rounded-md border px-2 sm:px-3 py-1.5 text-sm"
              placeholder="Max"
            />
          </div>
        </div>
      )}
    </div>
  );
}

export default function Phase8DetailedPreferences({
  onNext,
  isLoading = false,
  onSkip,
}: Phase8Props) {
  const form = useForm<Phase8FormData>({
    resolver: zodResolver(phase8Schema),
    defaultValues: {
      foreheadImportance: "open_to_all",
      foreheadPreference: [],
      noseImportance: "open_to_all",
      nosePreference: [],
      cheekbonesImportance: "open_to_all",
      cheekbonesPreference: [],
      lipsImportance: "open_to_all",
      lipsPreference: [],
      handSizeImportance: "open_to_all",
      handSizePreference: [],
      buttocksImportance: "open_to_all",
      buttocksPreference: [],
      legsImportance: "open_to_all",
      legsPreference: [],
      shoeSizeImportance: "open_to_all",
      breastSizeImportance: "open_to_all",
      breastSizePreference: [],
      penisSizeImportance: "open_to_all",
      penisSizePreference: [],
      tattooImportance: "open_to_all",
      tattooPreference: [],
      maritalStatusImportance: "open_to_all",
      maritalStatusPreference: [],
      kidsImportance: "open_to_all",
      kidsPreference: [],
      occupationImportance: "open_to_all",
      housingStatusImportance: "open_to_all",
      housingStatusPreference: [],
      makeupSpendingImportance: "open_to_all",
      makeupSpendingPreference: [],
      massageImportance: "open_to_all",
      nailsFrequencyImportance: "open_to_all",
      nailsFrequencyPreference: [],
      facialFrequencyImportance: "open_to_all",
      facialFrequencyPreference: [],
      relationshipTypeImportance: "open_to_all",
      relationshipTypePreference: [],
    },
  });

  return (
    <Card>
      <CardHeader>
        <CardTitle>Your Matching Preferences</CardTitle>
        <CardDescription>
          What matters to you in a partner? Set importance levels and select preferences.
          <br />
          <strong>"OPEN TO ALL"</strong> means this attribute won't affect matching.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onNext)} className="space-y-6">
            {/* Physical Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Physical Attributes Preferences</h3>

              <PreferenceSetting
                title="Forehead Type"
                importanceValue={form.watch("foreheadImportance")}
                onImportanceChange={(v) => form.setValue("foreheadImportance", v)}
                selectedValues={form.watch("foreheadPreference")}
                onValuesChange={(v) => form.setValue("foreheadPreference", v)}
                options={[
                  { value: "small", label: "Small" },
                  { value: "average", label: "Average" },
                  { value: "broad", label: "Broad" },
                  { value: "high", label: "High" },
                  { value: "other", label: "Other" },
                ]}
              />

              <PreferenceSetting
                title="Nose Shape"
                importanceValue={form.watch("noseImportance")}
                onImportanceChange={(v) => form.setValue("noseImportance", v)}
                selectedValues={form.watch("nosePreference")}
                onValuesChange={(v) => form.setValue("nosePreference", v)}
                options={[
                  { value: "button", label: "Button" },
                  { value: "snub", label: "Snub" },
                  { value: "roman", label: "Roman" },
                  { value: "grecian", label: "Grecian" },
                  { value: "nubian", label: "Nubian" },
                  { value: "hawk", label: "Hawk" },
                  { value: "celestial", label: "Celestial" },
                  { value: "other", label: "Other" },
                ]}
              />

              <PreferenceSetting
                title="Cheekbones"
                importanceValue={form.watch("cheekbonesImportance")}
                onImportanceChange={(v) => form.setValue("cheekbonesImportance", v)}
                selectedValues={form.watch("cheekbonesPreference")}
                onValuesChange={(v) => form.setValue("cheekbonesPreference", v)}
                options={[
                  { value: "high", label: "High" },
                  { value: "prominent", label: "Prominent" },
                  { value: "average", label: "Average" },
                  { value: "soft", label: "Soft" },
                  { value: "other", label: "Other" },
                ]}
              />

              <PreferenceSetting
                title="Lips Type"
                importanceValue={form.watch("lipsImportance")}
                onImportanceChange={(v) => form.setValue("lipsImportance", v)}
                selectedValues={form.watch("lipsPreference")}
                onValuesChange={(v) => form.setValue("lipsPreference", v)}
                options={[
                  { value: "thin", label: "Thin" },
                  { value: "average", label: "Average" },
                  { value: "full", label: "Full" },
                  { value: "very_full", label: "Very Full" },
                  { value: "heart_shaped", label: "Heart Shaped" },
                  { value: "other", label: "Other" },
                ]}
              />

              <PreferenceSetting
                title="Hand Size"
                importanceValue={form.watch("handSizeImportance")}
                onImportanceChange={(v) => form.setValue("handSizeImportance", v)}
                selectedValues={form.watch("handSizePreference")}
                onValuesChange={(v) => form.setValue("handSizePreference", v)}
                options={[
                  { value: "petite", label: "Petite" },
                  { value: "small", label: "Small" },
                  { value: "average", label: "Average" },
                  { value: "large", label: "Large" },
                  { value: "very_large", label: "Very Large" },
                ]}
              />

              <PreferenceSetting
                title="Buttocks"
                importanceValue={form.watch("buttocksImportance")}
                onImportanceChange={(v) => form.setValue("buttocksImportance", v)}
                selectedValues={form.watch("buttocksPreference")}
                onValuesChange={(v) => form.setValue("buttocksPreference", v)}
                options={[
                  { value: "small", label: "Small" },
                  { value: "average", label: "Average" },
                  { value: "curvy", label: "Curvy" },
                  { value: "full", label: "Full" },
                  { value: "athletic", label: "Athletic" },
                  { value: "other", label: "Other" },
                ]}
              />

              <PreferenceSetting
                title="Legs"
                importanceValue={form.watch("legsImportance")}
                onImportanceChange={(v) => form.setValue("legsImportance", v)}
                selectedValues={form.watch("legsPreference")}
                onValuesChange={(v) => form.setValue("legsPreference", v)}
                options={[
                  { value: "short", label: "Short" },
                  { value: "average", label: "Average" },
                  { value: "long", label: "Long" },
                  { value: "athletic", label: "Athletic" },
                  { value: "curvy", label: "Curvy" },
                ]}
              />

              <RangePreference
                title="Shoe Size (US)"
                importanceValue={form.watch("shoeSizeImportance")}
                onImportanceChange={(v) => form.setValue("shoeSizeImportance", v)}
                minValue={form.watch("shoeSizeMin")}
                maxValue={form.watch("shoeSizeMax")}
                onMinChange={(v) => form.setValue("shoeSizeMin", v)}
                onMaxChange={(v) => form.setValue("shoeSizeMax", v)}
                step={0.5}
              />

              <PreferenceSetting
                title="Breast Size"
                importanceValue={form.watch("breastSizeImportance")}
                onImportanceChange={(v) => form.setValue("breastSizeImportance", v)}
                selectedValues={form.watch("breastSizePreference")}
                onValuesChange={(v) => form.setValue("breastSizePreference", v)}
                options={[
                  { value: "a", label: "A" },
                  { value: "b", label: "B" },
                  { value: "c", label: "C" },
                  { value: "d", label: "D" },
                  { value: "e", label: "E" },
                  { value: "f", label: "F+" },
                  { value: "other", label: "Other/N/A" },
                ]}
              />

              <PreferenceSetting
                title="Penis Size"
                importanceValue={form.watch("penisSizeImportance")}
                onImportanceChange={(v) => form.setValue("penisSizeImportance", v)}
                selectedValues={form.watch("penisSizePreference")}
                onValuesChange={(v) => form.setValue("penisSizePreference", v)}
                options={[
                  { value: "small", label: "Small" },
                  { value: "average", label: "Average" },
                  { value: "large", label: "Large" },
                  { value: "very_large", label: "Very Large" },
                ]}
              />

              <PreferenceSetting
                title="Tattoos"
                importanceValue={form.watch("tattooImportance")}
                onImportanceChange={(v) => form.setValue("tattooImportance", v)}
                selectedValues={form.watch("tattooPreference")}
                onValuesChange={(v) => form.setValue("tattooPreference", v)}
                options={[
                  { value: "none", label: "No tattoos" },
                  { value: "small_few", label: "A few small ones" },
                  { value: "several", label: "Several" },
                  { value: "extensive", label: "Extensive" },
                ]}
              />
            </div>

            {/* Lifestyle & Personal Preferences */}
            <div className="space-y-4">
              <h3 className="text-lg font-semibold border-b pb-2">Lifestyle & Personal Preferences</h3>

              <PreferenceSetting
                title="Marital Status"
                importanceValue={form.watch("maritalStatusImportance")}
                onImportanceChange={(v) => form.setValue("maritalStatusImportance", v)}
                selectedValues={form.watch("maritalStatusPreference")}
                onValuesChange={(v) => form.setValue("maritalStatusPreference", v)}
                options={[
                  { value: "single", label: "Single" },
                  { value: "married", label: "Married" },
                  { value: "divorced", label: "Divorced" },
                  { value: "widowed", label: "Widowed" },
                  { value: "separated", label: "Separated" },
                  { value: "domestic_partnership", label: "Domestic Partnership" },
                ]}
              />

              <PreferenceSetting
                title="Kids"
                description="Do you prefer partners with or without kids?"
                importanceValue={form.watch("kidsImportance")}
                onImportanceChange={(v) => form.setValue("kidsImportance", v)}
                selectedValues={form.watch("kidsPreference")}
                onValuesChange={(v) => form.setValue("kidsPreference", v)}
                options={[
                  { value: "no_kids", label: "No Kids" },
                  { value: "has_kids", label: "Has Kids" },
                  { value: "wants_kids", label: "Wants Kids" },
                ]}
              />

              <PreferenceSetting
                title="Housing Status"
                importanceValue={form.watch("housingStatusImportance")}
                onImportanceChange={(v) => form.setValue("housingStatusImportance", v)}
                selectedValues={form.watch("housingStatusPreference")}
                onValuesChange={(v) => form.setValue("housingStatusPreference", v)}
                options={[
                  { value: "renting", label: "Renting" },
                  { value: "owns_home", label: "Owns Home" },
                  { value: "with_family", label: "Living with Family" },
                  { value: "other", label: "Other" },
                ]}
              />

              <PreferenceSetting
                title="Makeup Spending"
                importanceValue={form.watch("makeupSpendingImportance")}
                onImportanceChange={(v) => form.setValue("makeupSpendingImportance", v)}
                selectedValues={form.watch("makeupSpendingPreference")}
                onValuesChange={(v) => form.setValue("makeupSpendingPreference", v)}
                options={[
                  { value: "never", label: "Never" },
                  { value: "rarely", label: "Rarely" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "often", label: "Often" },
                  { value: "very_often", label: "Very Often" },
                ]}
              />

              <PreferenceSetting
                title="Nails Done Frequency"
                importanceValue={form.watch("nailsFrequencyImportance")}
                onImportanceChange={(v) => form.setValue("nailsFrequencyImportance", v)}
                selectedValues={form.watch("nailsFrequencyPreference")}
                onValuesChange={(v) => form.setValue("nailsFrequencyPreference", v)}
                options={[
                  { value: "never", label: "Never" },
                  { value: "rarely", label: "Rarely" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "often", label: "Often" },
                  { value: "very_often", label: "Very Often" },
                ]}
              />

              <PreferenceSetting
                title="Facial Frequency"
                importanceValue={form.watch("facialFrequencyImportance")}
                onImportanceChange={(v) => form.setValue("facialFrequencyImportance", v)}
                selectedValues={form.watch("facialFrequencyPreference")}
                onValuesChange={(v) => form.setValue("facialFrequencyPreference", v)}
                options={[
                  { value: "never", label: "Never" },
                  { value: "rarely", label: "Rarely" },
                  { value: "sometimes", label: "Sometimes" },
                  { value: "often", label: "Often" },
                  { value: "very_often", label: "Very Often" },
                ]}
              />

              <PreferenceSetting
                title="Relationship Type Seeking"
                importanceValue={form.watch("relationshipTypeImportance")}
                onImportanceChange={(v) => form.setValue("relationshipTypeImportance", v)}
                selectedValues={form.watch("relationshipTypePreference")}
                onValuesChange={(v) => form.setValue("relationshipTypePreference", v)}
                options={[
                  { value: "monogamous", label: "Monogamous" },
                  { value: "open_relationship", label: "Open Relationship" },
                  { value: "polyamorous", label: "Polyamorous" },
                  { value: "casual_dating", label: "Casual Dating" },
                  { value: "serious_long_term", label: "Serious Long-term" },
                  { value: "friendship_first", label: "Friendship First" },
                ]}
              />
            </div>

            <div className="flex flex-col sm:flex-row gap-3 sm:gap-4 pt-4">
              {onSkip && (
                <Button type="button" variant="ghost" onClick={onSkip} className="w-full sm:w-auto">
                  Skip
                </Button>
              )}
              <Button type="submit" disabled={isLoading} className="w-full sm:flex-1">
                {isLoading ? "Completing..." : "Complete Profile"}
              </Button>
            </div>
          </form>
        </Form>
      </CardContent>
    </Card>
  );
}
