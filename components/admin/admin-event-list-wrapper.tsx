'use client'

import { Suspense } from 'react'
import { AdminEventList } from './admin-event-list'

type Event = {
  id: string
  title: string
  start_date: string
  end_date: string
  location_city: string
  location_state: string
  capacity: number
  current_attendees: number
  status: string
  price: number
  profiles: {
    full_name: string
    email: string
  }
}

function AdminEventListContent({ events }: { events: Event[] }) {
  return <AdminEventList events={events} />
}

export function AdminEventListWrapper({ events }: { events: Event[] }) {
  return (
    <Suspense fallback={<div className="text-center py-8">Loading...</div>}>
      <AdminEventListContent events={events} />
    </Suspense>
  )
}
