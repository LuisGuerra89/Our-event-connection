'use client'

import { useTrafficSource } from '@/hooks/use-traffic-source'
import { ReactNode } from 'react'

export function TrafficTracker({ children }: { children: ReactNode }) {
  useTrafficSource()
  return <>{children}</>
}
