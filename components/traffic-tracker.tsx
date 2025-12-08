'use client'

import { Suspense } from 'react'
import { useTrafficSource } from '@/hooks/use-traffic-source'
import { ReactNode } from 'react'

function TrafficTrackerContent() {
  useTrafficSource()
  return null
}

export function TrafficTracker({ children }: { children: ReactNode }) {
  return (
    <>
      <Suspense fallback={null}>
        <TrafficTrackerContent />
      </Suspense>
      {children}
    </>
  )
}
