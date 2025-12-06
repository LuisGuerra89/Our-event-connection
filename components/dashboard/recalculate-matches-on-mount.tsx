/**
 * Component that recalculates matches when mounted
 * Ensures fresh matches every time user visits dashboard
 * Placed in layout to catch every dashboard visit (including direct navigation)
 */

"use client"

import { useEffect, useRef } from "react"

export default function RecalculateMatchesOnMount() {
  const hasRunRef = useRef(false)

  useEffect(() => {
    // Only run once per mount
    if (hasRunRef.current) return
    hasRunRef.current = true

    const triggerMatchCalculation = async () => {
      try {
        console.log("🔄 Recalculating matches on dashboard mount...")
        const response = await fetch("/api/matches/calculate", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ limit: 50, minScore: 0 }),
        })

        if (!response.ok) {
          console.error("Failed to recalculate matches:", response.statusText)
          return
        }

        const data = await response.json()
        console.log(`✅ Matches recalculated: ${data.totalMatches} found`)
      } catch (error) {
        console.error("Error recalculating matches:", error)
      }
    }

    // Trigger calculation
    triggerMatchCalculation()
  }, [])

  // This component doesn't render anything
  return null
}
