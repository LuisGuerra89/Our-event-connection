/**
 * Onboarding Profile Wizard - Main Container
 *
 * Orchestrates the step-by-step questionnaire flow:
 * Phase 1: Basic signup (already done in auth)
 * Phase 2: Essential preferences (age, relationship type)
 * Phase 3: Physical attributes
 * Phase 4: Lifestyle attributes
 * Phase 5: Detailed preferences
 */

"use client";

import React, { useState, useCallback } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Phase2EssentialPreferences from "./onboarding-wizard/phases/phase-2-essential-preferences";
import Phase3PhysicalAttributes from "./onboarding-wizard/phases/phase-3-physical-attributes";
import Phase4LifestyleAttributes from "./onboarding-wizard/phases/phase-4-lifestyle-attributes";
import Phase5DetailedPreferences from "./onboarding-wizard/phases/phase-5-detailed-preferences";
import MatchingSearchView from "./onboarding-wizard/phases/matching-search-view";



type Phase = 2 | 3 | 4 | 5 | "searching" | "complete";

interface OnboardingWizardProps {
  userId: string;
}

interface FormData {
  [key: string]: any;
}

/**
 * Main Wizard Component
 */
export default function OnboardingWizard({
  userId,
}: OnboardingWizardProps) {
  const router = useRouter();
  const { toast } = useToast();
  
  const [currentPhase, setCurrentPhase] = useState<Phase>(2);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState<FormData>({});

  // Save phase data and move to next phase
  const handleNextPhase = useCallback(
    async (phaseData: any, nextPhase: Phase) => {
      try {
        setIsLoading(true);

        // Save data to appropriate phase
        const updatedData = { ...formData };
        if (currentPhase === 2) updatedData.phase2 = phaseData;
        if (currentPhase === 3) updatedData.phase3 = phaseData;
        if (currentPhase === 4) updatedData.phase4 = phaseData;

        setFormData(updatedData);

        // If moving to next logical phase, prepare data
        if (nextPhase === 3 && updatedData.phase2) {
          // Save phase 2 preferences to API
          const response = await fetch("/api/user/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              general: {
                relationshipTypeImportance: "important",
                relationshipTypePreference: [updatedData.phase2.relationshipType],
                ageImportance: "important",
                ageMin: updatedData.phase2.ageRangeMin,
                ageMax: updatedData.phase2.ageRangeMax,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save preferences");
          }

          toast({
            title: "Preferences saved",
            description: "Moving to physical attributes...",
          });
        }

        if (nextPhase === 4 && updatedData.phase3) {
          // Save physical attributes
          const response = await fetch("/api/user/attributes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              physical: {
                hairLength: updatedData.phase3.hairLength || null,
                hairColor: updatedData.phase3.hairColor || null,
                eyeColor: updatedData.phase3.eyeColor || null,
                bodyType: updatedData.phase3.bodyType || null,
                complexion: updatedData.phase3.complexion || null,
                race: updatedData.phase3.race || null,
                height: updatedData.phase3.height ? Number(updatedData.phase3.height) : null,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save attributes");
          }

          toast({
            title: "Physical attributes saved",
            description: "Moving to lifestyle...",
          });
        }

        if (nextPhase === 5 && updatedData.phase4) {
          // Save lifestyle attributes
          const response = await fetch("/api/user/attributes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              lifestyle: {
                religion: updatedData.phase4.religion || null,
                workoutFrequency: updatedData.phase4.workoutFrequency || null,
                alcoholConsumptionFrequency: updatedData.phase4.alcoholConsumption || null,
                nightclubBarFrequency: updatedData.phase4.nightclubFrequency || null,
                likesOutdoors: updatedData.phase4.likesOutdoors,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save lifestyle attributes");
          }

          toast({
            title: "Lifestyle attributes saved",
            description: "Moving to preferences...",
          });
        }

        setCurrentPhase(nextPhase);
      } catch (error) {
        console.error("Error saving phase:", error);
        toast({
          title: "Error",
          description: error instanceof Error ? error.message : "Failed to save",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    },
    [currentPhase, formData, toast]
  );

  // Handle completion
  const handleComplete = useCallback(async (phase5Data?: any) => {
    try {
      setIsLoading(true);

      // Save phase 5 preferences if provided
      if (phase5Data) {
        const response = await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            general: phase5Data,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save preferences");
        }

        toast({
          title: "Preferences saved",
          description: "Marking questionnaire complete...",
        });
      }

      setCurrentPhase("searching");

      // Mark questionnaire as complete
      const completeResponse = await fetch("/api/user/attributes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireCompleted: true,
          questionnaireCompletedAt: new Date().toISOString(),
        }),
      });

      if (!completeResponse.ok) {
        throw new Error("Failed to mark questionnaire complete");
      }

      toast({
        title: "Success!",
        description: "Your profile is complete. Calculating matches...",
      });

      // Trigger match calculation
      await fetch("/api/matches/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 50, minScore: 30 }),
      });

      // MatchingSearchView will handle the redirect after animation completes
      // No need to manually redirect or set complete state
    } catch (error) {
      console.error("Error completing questionnaire:", error);
      setCurrentPhase(5); // Back to phase 5 on error
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to complete",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  }, [toast, router]);

  const handleSkip = useCallback(async () => {
    try {
      setIsLoading(true);

      // Mark questionnaire as skipped
      const response = await fetch("/api/user/attributes", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          questionnaireSkipped: true,
          questionnaireSkippedAt: new Date().toISOString(),
        }),
      });

      if (!response.ok) {
        throw new Error("Failed to mark questionnaire as skipped");
      }

      toast({
        title: "Questionnaire Skipped",
        description: "You can complete it later to get better matches!",
      });

      // Redirect to dashboard/matches
      router.push("/dashboard/matches");
    } catch (error) {
      console.error("Error skipping questionnaire:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to skip",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast, router]);

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Progress Indicator */}
      <div className="mb-8">
        <div className="flex justify-between mb-4">
          {[
            { phase: 2, label: "Preferences" },
            { phase: 3, label: "Physical" },
            { phase: 4, label: "Lifestyle" },
            { phase: 5, label: "Detailed" },
          ].map(({ phase, label }) => (
            <div
              key={phase}
              className={`flex-1 text-center pb-2 ${
                typeof currentPhase === "number" && currentPhase >= phase
                  ? "text-primary border-b-2 border-primary"
                  : "text-muted-foreground"
              }`}
            >
              <div className="text-sm font-medium">{label}</div>
            </div>
          ))}
        </div>
      </div>

      {/* Phase Content */}
      <div className="mb-8">
        {currentPhase === 2 && (
          <Phase2EssentialPreferences
            onNext={(data: any) => handleNextPhase(data, 3)}
            isLoading={isLoading}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 3 && (
          <Phase3PhysicalAttributes
            onNext={(data: any) => handleNextPhase(data, 4)}
            isLoading={isLoading}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 4 && (
          <Phase4LifestyleAttributes
            onNext={(data: any) => handleNextPhase(data, 5)}
            isLoading={isLoading}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === 5 && (
          <Phase5DetailedPreferences
            onComplete={handleComplete}
            isLoading={isLoading}
            onSkip={handleSkip}
          />
        )}

        {currentPhase === "searching" && (
          <MatchingSearchView
            onComplete={() => router.push("/dashboard/matches")}
            autoComplete={true}
            completionTime={5000}
          />
        )}
      </div>
    </div>
  );
}
