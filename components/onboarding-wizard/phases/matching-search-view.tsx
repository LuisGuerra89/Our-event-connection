/**
 * Matching Search View
 * Displayed while searching for matches after profile completion
 * Shows animated progress bar with heart icon
 */

"use client";

import React, { useEffect, useState } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Heart } from "lucide-react";

interface MatchingSearchViewProps {
  onComplete?: () => void;
  autoComplete?: boolean;
  completionTime?: number; // milliseconds
}

export default function MatchingSearchView({
  onComplete,
  autoComplete = true,
  completionTime = 8000, // 8 seconds default
}: MatchingSearchViewProps) {
  const [progress, setProgress] = useState(0);
  const [isComplete, setIsComplete] = useState(false);
  const [heartScale, setHeartScale] = useState(1);

  // Animate heart pulse
  useEffect(() => {
    const heartInterval = setInterval(() => {
      setHeartScale((s) => (s === 1 ? 1.2 : 1));
    }, 600);
    return () => clearInterval(heartInterval);
  }, []);

  // Animate progress
  useEffect(() => {
    if (isComplete) return;

    const startTime = Date.now();
    const interval = setInterval(() => {
      const elapsed = Date.now() - startTime;
      const newProgress = Math.min((elapsed / completionTime) * 100, 100);

      setProgress(newProgress);

      if (newProgress >= 100) {
        setIsComplete(true);
        clearInterval(interval);
        if (autoComplete && onComplete) {
          setTimeout(onComplete, 500);
        }
      }
    }, 50);

    return () => clearInterval(interval);
  }, [isComplete, autoComplete, completionTime, onComplete]);

  return (
    <div className="w-full min-h-screen flex items-center justify-center bg-gradient-to-br from-rose-50 to-pink-50 p-6">
      <Card className="w-full max-w-md shadow-2xl border-0">
        <CardContent className="pt-12 pb-12">
          {/* Heart Icon */}
          <div className="flex justify-center mb-8">
            <div
              style={{
                transform: `scale(${heartScale})`,
                transition: "transform 0.3s ease-in-out",
              }}
            >
              <Heart
                size={80}
                className="text-rose-500 fill-rose-500 drop-shadow-lg"
              />
            </div>
          </div>

          {/* Title */}
          <h1 className="text-3xl font-bold text-center mb-2 text-gray-800">
            Finding Matches
          </h1>
          <p className="text-center text-gray-500 mb-8">
            Analyzing compatible profiles...
          </p>

          {/* Progress Bar */}
          <div className="mb-8">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-rose-400 to-rose-600 transition-all duration-300 ease-out"
                style={{ width: `${progress}%` }}
              />
            </div>
            <div className="text-center mt-3">
              <span className="text-sm font-medium text-gray-600">
                {Math.floor(progress)}%
              </span>
            </div>
          </div>

          {/* Status Messages */}
          <div className="space-y-4 text-center mb-6">
            <div className={`transition-opacity duration-500 ${progress > 20 ? "opacity-100" : "opacity-40"}`}>
              <p className="text-sm text-gray-600">✓ Profile analyzed</p>
            </div>
            <div className={`transition-opacity duration-500 ${progress > 50 ? "opacity-100" : "opacity-40"}`}>
              <p className="text-sm text-gray-600">✓ Search started</p>
            </div>
            <div className={`transition-opacity duration-500 ${progress > 80 ? "opacity-100" : "opacity-40"}`}>
              <p className="text-sm text-gray-600">✓ Matches found</p>
            </div>
          </div>

          {/* Animated Dots */}
          <div className="flex justify-center gap-2 mb-8">
            <div
              className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}
            />
            <div
              className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}
            />
            <div
              className="w-2 h-2 bg-rose-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}
            />
          </div>

          {/* Bottom Message */}
          {isComplete && (
            <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
              <p className="text-center text-sm font-medium text-rose-600">
                Done! Redirecting...
              </p>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
