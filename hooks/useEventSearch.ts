import { useState, useEffect } from "react"

export interface SearchHistory {
  keyword?: string
  location?: string
  date?: string
  timestamp: number
}

export function useEventSearch() {
  const [searchHistory, setSearchHistory] = useState<SearchHistory[]>([])

  // Load search history from localStorage
  useEffect(() => {
    const saved = localStorage.getItem("eventSearchHistory")
    if (saved) {
      try {
        const history = JSON.parse(saved) as SearchHistory[]
        setSearchHistory(history.slice(0, 5))
      } catch (e) {
        console.error("Failed to parse search history:", e)
      }
    }
  }, [])

  const addToHistory = (keyword?: string, location?: string, date?: string) => {
    if (!keyword && !location && !date) return

    const newSearch: SearchHistory = {
      ...(keyword && { keyword }),
      ...(location && { location }),
      ...(date && { date }),
      timestamp: Date.now(),
    }

    const updated = [newSearch, ...searchHistory].slice(0, 5)
    setSearchHistory(updated)
    localStorage.setItem("eventSearchHistory", JSON.stringify(updated))
  }

  const clearHistory = () => {
    setSearchHistory([])
    localStorage.removeItem("eventSearchHistory")
  }

  return { searchHistory, addToHistory, clearHistory }
}
