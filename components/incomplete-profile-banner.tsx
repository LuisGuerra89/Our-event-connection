"use client";

import React from "react";
import { AlertCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

interface IncompleteProfileBannerProps {
  userId: string;
}

export function IncompleteProfileBanner({ userId }: IncompleteProfileBannerProps) {
  const router = useRouter();

  const handleStartWizard = () => {
    router.push("/onboarding/complete-profile");
  };

  return (
    <div className="mb-6 rounded-lg border border-amber-200 bg-amber-50 dark:border-amber-900 dark:bg-amber-950 p-4">
      <div className="flex gap-4">
        <AlertCircle className="h-5 w-5 text-amber-600 dark:text-amber-400 flex-shrink-0 mt-0.5" />
        <div className="flex-1">
          <h3 className="font-semibold text-amber-900 dark:text-amber-100 mb-1">
            Complete Your Profile for Better Matches
          </h3>
          <p className="text-sm text-amber-800 dark:text-amber-200 mb-3">
            Your profile isn't fully complete yet. By answering a few quick questions about your preferences, 
            physical attributes, and lifestyle, we can find you much better matches!
          </p>
          <Button
            onClick={handleStartWizard}
            size="sm"
            className="bg-amber-600 hover:bg-amber-700 dark:bg-amber-700 dark:hover:bg-amber-600"
          >
            Complete Profile
            <ArrowRight className="h-4 w-4 ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
