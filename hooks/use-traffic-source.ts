import { useEffect, useState } from 'react'
import { useSearchParams } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

interface TrafficSource {
  utm_source?: string
  utm_medium?: string
  utm_campaign?: string
  utm_content?: string
  utm_term?: string
  referrer?: string
  referrer_domain?: string
  landing_page?: string
  ip_address?: string
}

/**
 * Hook para capturar y guardar información de fuentes de tráfico
 * Captura: UTM params, referrer, landing page, y device info
 */
export function useTrafficSource() {
  const [sessionId, setSessionId] = useState<string | null>(null)
  const searchParams = useSearchParams()

  useEffect(() => {
    // Generate or retrieve session ID
    let currentSessionId = sessionStorage.getItem('session_id')
    if (!currentSessionId) {
      currentSessionId = `session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
      sessionStorage.setItem('session_id', currentSessionId)
    }
    setSessionId(currentSessionId)

    // Only track once per session
    if (!sessionStorage.getItem('traffic_tracked')) {
      trackTrafficSource(currentSessionId)
      sessionStorage.setItem('traffic_tracked', 'true')
    }
  }, [])

  async function trackTrafficSource(sessionId: string) {
    try {
      const supabase = createClient()

      // Get current user (if logged in)
      const { data: { user } } = await supabase.auth.getUser()

      // Extract UTM parameters from URL
      const utmSource = searchParams?.get('utm_source')
      const utmMedium = searchParams?.get('utm_medium')
      const utmCampaign = searchParams?.get('utm_campaign')
      const utmContent = searchParams?.get('utm_content')
      const utmTerm = searchParams?.get('utm_term')

      // Get referrer
      const referrer = document.referrer
      const referrerUrl = new URL(referrer || 'https://direct')
      const referrerDomain = referrerUrl.hostname

      // Get landing page (full URL)
      const landingPage = window.location.href

      // Get user agent
      const userAgent = navigator.userAgent

      // Prepare data for insertion
      const trafficData = {
        session_id: sessionId,
        user_id: user?.id || null,
        utm_source: utmSource,
        utm_medium: utmMedium,
        utm_campaign: utmCampaign,
        utm_content: utmContent,
        utm_term: utmTerm,
        referrer: referrer || null,
        referrer_domain: referrerDomain !== 'localhost' ? referrerDomain : null,
        landing_page: landingPage,
        user_agent: userAgent,
      }

      // Save to database
      const { error } = await supabase
        .from('traffic_sources')
        .insert([trafficData])

      if (error) {
        console.error('Error tracking traffic source:', error)
      }
    } catch (error) {
      console.error('Traffic tracking error:', error)
    }
  }

  return { sessionId }
}
