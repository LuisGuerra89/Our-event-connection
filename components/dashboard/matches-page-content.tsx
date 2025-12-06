"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { MatchList } from "@/components/match-list";
import MatchingSearchView from "@/components/onboarding-wizard/phases/matching-search-view";
import { RefreshCw } from "lucide-react";

interface MatchesPageContentProps {
  initialMatches: any[];
  preferences: any;
  userId: string;
}

export function MatchesPageContent({
  initialMatches,
  preferences,
  userId,
}: MatchesPageContentProps) {
  const [matches, setMatches] = useState(initialMatches);
  const [isSearching, setIsSearching] = useState(false);

  const handleSearchMatches = async () => {
    setIsSearching(true);

    try {
      // Trigger match calculation
      const response = await fetch("/api/matches/calculate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId }),
      });

      if (!response.ok) {
        console.error("Failed to calculate matches");
      }

      // Re-fetch matches after calculation
      const supabaseResponse = await fetch("/api/matches", {
        method: "GET",
        headers: { "Content-Type": "application/json" },
      });

      if (supabaseResponse.ok) {
        const { matches: updatedMatches } = await supabaseResponse.json();
        setMatches(updatedMatches || []);
      }
    } catch (error) {
      console.error("Error searching for matches:", error);
    }
  };

  const handleSearchComplete = () => {
    setIsSearching(false);
  };

  if (isSearching) {
    return (
      <MatchingSearchView
        onComplete={handleSearchComplete}
        autoComplete={true}
        completionTime={8000}
      />
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-xl font-semibold text-foreground">
          {matches.length > 0
            ? `Found ${matches.length} match${matches.length !== 1 ? "es" : ""}`
            : "No matches found yet"}
        </h2>
        <Button
          onClick={handleSearchMatches}
          className="gap-2"
          variant="default"
        >
          <RefreshCw className="w-4 h-4" />
          Search for New Matches
        </Button>
      </div>
      <MatchList users={matches} preferences={preferences} />
    </div>
  );
}
