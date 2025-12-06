"use client"

import { useState } from "react"
import { MatchesGrid } from "@/components/matches-grid"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight } from "lucide-react"

interface MatchUser {
  id: string
  display_name: string
  first_name?: string
  last_name?: string
  profile_image_url: string | null
  location_city: string | null
  location_state: string | null
  gender: string | null
  bio: string | null
  matchScore?: number
  user_attributes?: any
  matchId?: string
}

interface PaginatedMatchesGridProps {
  matches: MatchUser[]
  currentUserId?: string
  itemsPerPage?: number
}

export function PaginatedMatchesGrid({ 
  matches, 
  currentUserId, 
  itemsPerPage = 4 
}: PaginatedMatchesGridProps) {
  const [currentPage, setCurrentPage] = useState(1)
  
  const totalPages = Math.ceil(matches.length / itemsPerPage)
  const startIndex = (currentPage - 1) * itemsPerPage
  const endIndex = startIndex + itemsPerPage
  const currentMatches = matches.slice(startIndex, endIndex)

  const goToNextPage = () => {
    if (currentPage < totalPages) {
      setCurrentPage(currentPage + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPreviousPage = () => {
    if (currentPage > 1) {
      setCurrentPage(currentPage - 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const goToPage = (page: number) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div>
      <MatchesGrid matches={currentMatches} currentUserId={currentUserId} />

      {totalPages > 1 && (
        <div className="mt-8 flex items-center justify-center gap-2">
          <Button
            variant="outline"
            size="icon"
            onClick={goToPreviousPage}
            disabled={currentPage === 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex gap-1">
            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <Button
                key={page}
                variant={currentPage === page ? "default" : "outline"}
                size="icon"
                onClick={() => goToPage(page)}
                className={currentPage === page ? "bg-gradient-to-r from-pink-500 via-purple-600 to-rose-600" : ""}
              >
                {page}
              </Button>
            ))}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={goToNextPage}
            disabled={currentPage === totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}

      {totalPages > 1 && (
        <div className="mt-4 text-center text-sm text-muted-foreground">
          Showing {startIndex + 1}-{Math.min(endIndex, matches.length)} of {matches.length} matches
        </div>
      )}
    </div>
  )
}
