import { useState, useEffect } from "react"

interface SubscriptionStatus {
  isActive: boolean
  subscription: any | null
  expiresAt: string | null
  isLoading: boolean
  error: string | null
}

/**
 * Hook to check if current user has active subscription
 * 
 * Usage:
 * const { isActive, expiresAt, isLoading } = useSubscriptionStatus()
 * 
 * if (!isActive) return <UpgradePrompt />
 */
export function useSubscriptionStatus(): SubscriptionStatus {
  const [status, setStatus] = useState<SubscriptionStatus>({
    isActive: false,
    subscription: null,
    expiresAt: null,
    isLoading: true,
    error: null
  })

  useEffect(() => {
    const checkSubscription = async () => {
      try {
        const response = await fetch("/api/subscriptions/check-active")
        const data = await response.json()
        
        setStatus({
          isActive: data.isActive,
          subscription: data.subscription,
          expiresAt: data.expiresAt,
          isLoading: false,
          error: data.error || null
        })
      } catch (error) {
        setStatus(prev => ({
          ...prev,
          isLoading: false,
          error: error instanceof Error ? error.message : "Unknown error"
        }))
      }
    }

    checkSubscription()
  }, [])

  return status
}

/**
 * Hook to get free events earned by current user
 * 
 * Usage:
 * const freeEvents = useFreeEventsEarned()
 */
export function useFreeEventsEarned(): number | null {
  const [freeEvents, setFreeEvents] = useState<number | null>(null)

  useEffect(() => {
    const fetchFreeEvents = async () => {
      try {
        const response = await fetch("/api/user/profile")
        const data = await response.json()
        setFreeEvents(data.free_events_earned || 0)
      } catch (error) {
        console.error("Error fetching free events:", error)
      }
    }

    fetchFreeEvents()
  }, [])

  return freeEvents
}

/**
 * Hook to get user's referral code and referral count
 * 
 * Usage:
 * const { referralCode, referralCount } = useReferralInfo()
 */
export function useReferralInfo(): { referralCode: string | null; referralCount: number; isLoading: boolean } {
  const [data, setData] = useState({
    referralCode: null as string | null,
    referralCount: 0,
    isLoading: true
  })

  useEffect(() => {
    const fetchReferralInfo = async () => {
      try {
        const response = await fetch("/api/user/referral-code")
        const result = await response.json()
        setData({
          referralCode: result.referral_code || null,
          referralCount: result.referral_count || 0,
          isLoading: false
        })
      } catch (error) {
        console.error("Error fetching referral info:", error)
        setData(prev => ({ ...prev, isLoading: false }))
      }
    }

    fetchReferralInfo()
  }, [])

  return data
}
