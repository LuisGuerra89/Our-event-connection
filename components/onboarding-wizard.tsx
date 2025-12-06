/**
 * Onboarding Profile Wizard - Main Container
 *
 * Orchestrates the step-by-step questionnaire flow:
 * Phase 1: Basic signup (already done in auth)
 * Phase 2: Essential preferences (age, relationship type)
 * Phase 3: Physical attributes
 * Phase 4: Lifestyle attributes
 * Phase 5: Detailed preferences
 * Phase 6: Detailed physical attributes (NEW)
 * Phase 7: Personal & professional info (NEW)
 * Phase 8: Detailed matching preferences (NEW)
 */

"use client";

import React, { useState, useCallback, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import Phase2EssentialPreferences from "./onboarding-wizard/phases/phase-2-essential-preferences";
import Phase3PhysicalAttributes from "./onboarding-wizard/phases/phase-3-physical-attributes";
import Phase4LifestyleAttributes from "./onboarding-wizard/phases/phase-4-lifestyle-attributes";
import Phase5DetailedPreferences from "./onboarding-wizard/phases/phase-5-detailed-preferences";
import Phase6DetailedPhysical from "./onboarding-wizard/phases/phase-6-detailed-physical";
import Phase7PersonalInfo from "./onboarding-wizard/phases/phase-7-personal-info";
import Phase8DetailedPreferences from "./onboarding-wizard/phases/phase-8-detailed-preferences";
import MatchingSearchView from "./onboarding-wizard/phases/matching-search-view";



type Phase = 2 | 3 | 4 | 5 | 6 | 7 | 8 | "searching" | "complete";

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
  const [isLoadingData, setIsLoadingData] = useState(true);
  const [formData, setFormData] = useState<FormData>({});

  // Load existing user data on mount
  useEffect(() => {
    const loadUserData = async () => {
      try {
        setIsLoadingData(true);

        // Fetch user attributes
        const attrsResponse = await fetch("/api/user/attributes");
        const attrsData = await attrsResponse.json();

        // Fetch user preferences
        const prefsResponse = await fetch("/api/user/preferences");
        const prefsData = await prefsResponse.json();

        console.log("Loaded attributes:", attrsData);
        console.log("Loaded preferences:", prefsData);

        if (attrsData.data) {
          const attrs = attrsData.data;
          
          console.log("Mapping attrs to form data:", attrs);
          
          // Map attributes to phase data (DB uses snake_case)
          const loadedData: FormData = {
            phase2: {
              relationshipType: attrs.relationship_type_seeking || attrs.relationship_type || "",
              ageRangeMin: prefsData.data?.age_min || 18,
              ageRangeMax: prefsData.data?.age_max || 99,
              distancePreference: prefsData.data?.max_travel_distance_miles || 50,
            },
            phase3: {
              hairLength: attrs.hair_length || "",
              hairColor: attrs.hair_color || "",
              eyeColor: attrs.eye_color || "",
              bodyType: attrs.body_type || "",
              complexion: attrs.complexion || "",
              race: attrs.race || "",
              height: attrs.height?.toString() || "",
            },
            phase4: {
              religion: attrs.religion || "",
              workoutFrequency: attrs.workout_frequency || "",
              alcoholConsumption: attrs.alcohol_consumption_frequency || "",
              nightclubFrequency: attrs.nightclub_bar_frequency || "",
              likesOutdoors: attrs.likes_outdoors || false,
            },
            phase6: {
              forehead: attrs.forehead_type || attrs.forehead || "",
              cheekbones: attrs.cheekbones || "",
              nose: attrs.nose || "",
              lips: attrs.lips || "",
              handSize: attrs.hand_size || "",
              buttocks: attrs.buttocks || "",
              legs: attrs.legs || "",
              shoeSize: attrs.shoe_size || null,
              breastSize: attrs.breast_size || "",
              penisSize: attrs.penis_size || "",
              hasTattoos: attrs.has_tattoos || attrs.tattoo_status || "",
            },
            phase7: {
              maritalStatus: attrs.marital_status || "",
              hasKids: attrs.has_kids || false,
              kidsBoys: attrs.kids_boys || null,
              kidsGirls: attrs.kids_girls || null,
              occupation: attrs.occupation || "",
              ownsBusiness: attrs.owns_business_flag || false,
              businessType: attrs.business_type || "",
              housingStatus: attrs.housing_status || "",
              lookingForRoommate: attrs.looking_for_roommate || false,
              relationshipTypeSeeking: attrs.relationship_type_seeking || attrs.relationship_type || "",
              favoriteColor: attrs.favorite_color || "",
              dressCodePreference: attrs.dress_code_preference || "",
              makeupSpendingFrequency: attrs.makeup_spending_frequency || "",
              likesMassage: attrs.likes_massage || false,
              nailsDoneFrequency: attrs.nails_done_frequency || "",
              facialFrequency: attrs.facial_frequency || "",
            },
          };

          // Map preferences to phase5 and phase8
          if (prefsData.data) {
            const prefs = prefsData.data;
            
            console.log("Mapping prefs to form data:", prefs);
            
            loadedData.phase5 = {
              hairColorImportance: prefs.hair_color_importance || "open_to_all",
              hairColorPreference: prefs.hair_color_preference || [],
              bodyTypeImportance: prefs.body_type_importance || "open_to_all",
              bodyTypePreference: prefs.body_type_preference || [],
              religionImportance: prefs.religion_importance || "open_to_all",
              religionPreference: prefs.religion_preference || [],
              workoutImportance: prefs.workout_importance || "open_to_all",
              workoutPreference: prefs.workout_frequency_preference || [],
              alcoholImportance: prefs.alcohol_importance || "open_to_all",
              alcoholPreference: prefs.alcohol_preference || [],
            };

            loadedData.phase8 = {
              foreheadImportance: prefs.forehead_importance || "open_to_all",
              foreheadPreference: prefs.forehead_preference || [],
              noseImportance: prefs.nose_importance || "open_to_all",
              nosePreference: prefs.nose_preference || [],
              cheekbonesImportance: prefs.cheekbones_importance || "open_to_all",
              cheekbonesPreference: prefs.cheekbones_preference || [],
              lipsImportance: prefs.lips_importance || "open_to_all",
              lipsPreference: prefs.lips_preference || [],
              handSizeImportance: prefs.hand_size_importance || "open_to_all",
              handSizePreference: prefs.hand_size_preference || [],
              buttocksImportance: prefs.buttocks_importance || "open_to_all",
              buttocksPreference: prefs.buttocks_preference || [],
              legsImportance: prefs.legs_importance || "open_to_all",
              legsPreference: prefs.legs_preference || [],
              shoeSizeImportance: prefs.shoe_size_importance || "open_to_all",
              shoeSizeMin: prefs.shoe_size_min || null,
              shoeSizeMax: prefs.shoe_size_max || null,
              breastSizeImportance: prefs.breast_size_importance || "open_to_all",
              breastSizePreference: prefs.breast_size_preference || [],
              penisSizeImportance: prefs.penis_size_importance || "open_to_all",
              penisSizePreference: prefs.penis_size_preference || [],
              tattooImportance: prefs.tattoo_importance || "open_to_all",
              tattooPreference: prefs.tattoo_preference || [],
              maritalStatusImportance: prefs.marital_status_importance || "open_to_all",
              maritalStatusPreference: prefs.marital_status_preference || [],
              kidsImportance: prefs.kids_importance || "open_to_all",
              kidsPreference: prefs.kids_preference || [],
              housingStatusImportance: prefs.housing_status_importance || "open_to_all",
              housingStatusPreference: prefs.housing_status_preference || [],
              makeupSpendingImportance: prefs.makeup_spending_importance || "open_to_all",
              makeupSpendingPreference: prefs.makeup_spending_preference || [],
              massageImportance: prefs.massage_importance || "open_to_all",
              nailsFrequencyImportance: prefs.nails_frequency_importance || "open_to_all",
              nailsFrequencyPreference: prefs.nails_frequency_preference || [],
              facialFrequencyImportance: prefs.facial_frequency_importance || "open_to_all",
              facialFrequencyPreference: prefs.facial_frequency_preference || [],
              relationshipTypeImportance: prefs.relationship_type_importance || "open_to_all",
              relationshipTypePreference: prefs.relationship_type_preference || [],
            };
          }

          console.log("Final loaded data:", loadedData);
          setFormData(loadedData);
        }
      } catch (error) {
        console.error("Error loading user data:", error);
        // Don't show error toast, just continue with empty form
      } finally {
        setIsLoadingData(false);
      }
    };

    loadUserData();
  }, [userId]);

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
        if (currentPhase === 5) updatedData.phase5 = phaseData;
        if (currentPhase === 6) updatedData.phase6 = phaseData;
        if (currentPhase === 7) updatedData.phase7 = phaseData;

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
                maxTravelDistanceMiles: updatedData.phase2.distancePreference ?? 50, // Use ?? to allow 0
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

        if (nextPhase === 6 && updatedData.phase5) {
          // Save phase 5 preferences - map to physical and lifestyle
          console.log("Saving Phase 5 data:", updatedData.phase5);
          
          const payload = {
            physical: {
              hairColorImportance: updatedData.phase5.hairColorImportance,
              hairColorPreference: updatedData.phase5.hairColorPreference,
              bodyTypeImportance: updatedData.phase5.bodyTypeImportance,
              bodyTypePreference: updatedData.phase5.bodyTypePreference,
            },
            lifestyle: {
              religionImportance: updatedData.phase5.religionImportance,
              religionPreference: updatedData.phase5.religionPreference,
              workoutImportance: updatedData.phase5.workoutImportance,
              workoutPreference: updatedData.phase5.workoutPreference,
              alcoholImportance: updatedData.phase5.alcoholImportance,
              alcoholPreference: updatedData.phase5.alcoholPreference,
            },
          };
          
          console.log("API Payload:", payload);
          
          const response = await fetch("/api/user/preferences", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(payload),
          });

          if (!response.ok) {
            throw new Error("Failed to save preferences");
          }

          toast({
            title: "Preferences saved",
            description: "Moving to detailed physical...",
          });
        }

        if (nextPhase === 7 && updatedData.phase6) {
          // Save Phase 6 - Detailed Physical Attributes
          const response = await fetch("/api/user/attributes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              physical: {
                forehead: updatedData.phase6.forehead || null,
                cheekbones: updatedData.phase6.cheekbones || null,
                nose: updatedData.phase6.nose || null,
                lips: updatedData.phase6.lips || null,
                handSize: updatedData.phase6.handSize || null,
                buttocks: updatedData.phase6.buttocks || null,
                legs: updatedData.phase6.legs || null,
                shoeSize: updatedData.phase6.shoeSize || null,
                breastSize: updatedData.phase6.breastSize || null,
                penisSize: updatedData.phase6.penisSize || null,
                hasTattoos: updatedData.phase6.hasTattoos || null,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save detailed physical attributes");
          }

          toast({
            title: "Detailed physical saved",
            description: "Moving to personal info...",
          });
        }

        if (nextPhase === 8 && updatedData.phase7) {
          // Save Phase 7 - Personal & Professional Info
          const response = await fetch("/api/user/attributes", {
            method: "PUT",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({
              personal: {
                maritalStatus: updatedData.phase7.maritalStatus || null,
                hasKids: updatedData.phase7.hasKids || false,
                kidsBoys: updatedData.phase7.kidsBoys || null,
                kidsGirls: updatedData.phase7.kidsGirls || null,
                occupation: updatedData.phase7.occupation || null,
                ownsBusiness: updatedData.phase7.ownsBusiness || false,
                businessType: updatedData.phase7.businessType || null,
                housingStatus: updatedData.phase7.housingStatus || null,
                lookingForRoommate: updatedData.phase7.lookingForRoommate || false,
                relationshipTypeSeeking: updatedData.phase7.relationshipTypeSeeking || null,
                favoriteColor: updatedData.phase7.favoriteColor || null,
                dressCodePreference: updatedData.phase7.dressCodePreference || null,
                makeupSpendingFrequency: updatedData.phase7.makeupSpendingFrequency || null,
                likesMassage: updatedData.phase7.likesMassage || false,
                nailsDoneFrequency: updatedData.phase7.nailsDoneFrequency || null,
                facialFrequency: updatedData.phase7.facialFrequency || null,
              },
            }),
          });

          if (!response.ok) {
            throw new Error("Failed to save personal information");
          }

          toast({
            title: "Personal info saved",
            description: "Moving to detailed preferences...",
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
  const handleComplete = useCallback(async (phase8Data?: any) => {
    try {
      setIsLoading(true);

      // Save phase 8 detailed preferences if provided
      if (phase8Data) {
        const response = await fetch("/api/user/preferences", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            detailed: phase8Data,
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to save detailed preferences");
        }

        toast({
          title: "All preferences saved",
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
      setCurrentPhase(8); // Back to phase 8 on error
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
        description: "Searching for matches with your current info...",
      });

      // Move to searching state to show matching animation
      setCurrentPhase("searching");

      // Trigger match calculation based on what user has filled so far
      await fetch("/api/matches/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 50, minScore: 30 }),
      }).catch((err) => console.error("Match calculation error (non-blocking):", err));

      // MatchingSearchView will handle the redirect after animation completes
    } catch (error) {
      console.error("Error skipping questionnaire:", error);
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to skip",
        variant: "destructive",
      });
      setIsLoading(false);
    }
  }, [toast]);

  // Show loading state while fetching data
  if (isLoadingData) {
    return (
      <div className="w-full max-w-4xl mx-auto p-6">
        <div className="flex items-center justify-center py-12">
          <div className="text-center">
            <div className="inline-block h-8 w-8 animate-spin rounded-full border-4 border-solid border-current border-r-transparent align-[-0.125em] motion-reduce:animate-[spin_1.5s_linear_infinite]" />
            <p className="mt-4 text-sm text-muted-foreground">Loading your profile...</p>
          </div>
        </div>
      </div>
    );
  }

  // Show full-screen matching search view
  if (currentPhase === "searching") {
    return (
      <MatchingSearchView
        onComplete={() => router.push("/dashboard/matches")}
        autoComplete={true}
        completionTime={5000}
      />
    );
  }

  return (
    <div className="w-full max-w-4xl mx-auto p-6">
      {/* Progress Indicator - Clickable to navigate */}
      <div className="mb-8">
        <div className="flex justify-between mb-4 overflow-x-auto">
          {[
            { phase: 2, label: "Preferences" },
            { phase: 3, label: "Physical" },
            { phase: 4, label: "Lifestyle" },
            { phase: 5, label: "Detailed" },
            { phase: 6, label: "Extended Physical" },
            { phase: 7, label: "Personal Info" },
            { phase: 8, label: "Match Prefs" },
          ].map(({ phase, label }) => (
            <div
              key={phase}
              onClick={() => {
                // Allow clicking on completed phases or current phase
                if (typeof currentPhase === "number" && phase <= currentPhase) {
                  setCurrentPhase(phase as Phase);
                }
              }}
              className={`flex-1 text-center pb-2 px-2 whitespace-nowrap cursor-pointer transition-colors ${
                typeof currentPhase === "number" && currentPhase >= phase
                  ? "text-primary border-b-2 border-primary hover:opacity-80"
                  : "text-muted-foreground opacity-50 cursor-not-allowed"
              }`}
              title={typeof currentPhase === "number" && phase <= currentPhase ? `Go to ${label}` : `Complete previous steps`}
            >
              <div className="text-xs md:text-sm font-medium">{label}</div>
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
            defaultValues={formData.phase2}
          />
        )}

        {currentPhase === 3 && (
          <Phase3PhysicalAttributes
            onNext={(data: any) => handleNextPhase(data, 4)}
            isLoading={isLoading}
            onSkip={handleSkip}
            defaultValues={formData.phase3}
          />
        )}

        {currentPhase === 4 && (
          <Phase4LifestyleAttributes
            onNext={(data: any) => handleNextPhase(data, 5)}
            isLoading={isLoading}
            onSkip={handleSkip}
            defaultValues={formData.phase4}
          />
        )}

        {currentPhase === 5 && (
          <Phase5DetailedPreferences
            onComplete={(data: any) => handleNextPhase(data, 6)}
            isLoading={isLoading}
            onSkip={handleSkip}
            defaultValues={formData.phase5}
          />
        )}

        {currentPhase === 6 && (
          <Phase6DetailedPhysical
            onNext={(data: any) => handleNextPhase(data, 7)}
            isLoading={isLoading}
            onSkip={handleSkip}
            defaultValues={formData.phase6}
          />
        )}

        {currentPhase === 7 && (
          <Phase7PersonalInfo
            onNext={(data: any) => handleNextPhase(data, 8)}
            isLoading={isLoading}
            onSkip={handleSkip}
            defaultValues={formData.phase7}
          />
        )}

        {currentPhase === 8 && (
          <Phase8DetailedPreferences
            onNext={handleComplete}
            isLoading={isLoading}
            onSkip={handleSkip}
            defaultValues={formData.phase8}
          />
        )}
      </div>
    </div>
  );
}
