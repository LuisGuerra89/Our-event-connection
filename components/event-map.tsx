"use client"

import { useEffect, useState } from "react"
import { GoogleMap, LoadScript, Marker, InfoWindow } from "@react-google-maps/api"

interface EventLocation {
  id: string
  title: string
  latitude: number
  longitude: number
  location_name?: string
  location_address?: string
  location_city?: string
  location_state?: string
  start_date?: string
}

interface EventMapProps {
  events: EventLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  showInfoWindows?: boolean
}

const containerStyle = {
  width: "100%",
  height: "400px",
}

export function EventMap({ 
  events, 
  center, 
  zoom = 10, 
  height = "400px",
  showInfoWindows = true 
}: EventMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null)
  const [mapCenter, setMapCenter] = useState(center)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  useEffect(() => {
    // If no center is provided, use the first event's location or default
    if (!center && events.length > 0) {
      setMapCenter({
        lat: events[0].latitude,
        lng: events[0].longitude,
      })
    }
  }, [center, events])

  const defaultCenter = {
    lat: 40.7128, // New York
    lng: -74.0060,
  }

  if (!apiKey) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-muted-foreground">Google Maps API key not configured</p>
      </div>
    )
  }

  return (
    <LoadScript googleMapsApiKey={apiKey}>
      <GoogleMap
        mapContainerStyle={{ ...containerStyle, height }}
        center={mapCenter || defaultCenter}
        zoom={zoom}
      >
        {events.map((event) => (
          <Marker
            key={event.id}
            position={{
              lat: event.latitude,
              lng: event.longitude,
            }}
            onClick={() => setSelectedEvent(event)}
          />
        ))}

        {showInfoWindows && selectedEvent && (
          <InfoWindow
            position={{
              lat: selectedEvent.latitude,
              lng: selectedEvent.longitude,
            }}
            onCloseClick={() => setSelectedEvent(null)}
          >
            <div className="p-2">
              <h3 className="font-semibold text-sm">{selectedEvent.title}</h3>
              {selectedEvent.location_name && (
                <p className="text-xs text-gray-600">{selectedEvent.location_name}</p>
              )}
              {selectedEvent.location_address && (
                <p className="text-xs text-gray-600">{selectedEvent.location_address}</p>
              )}
              {selectedEvent.location_city && selectedEvent.location_state && (
                <p className="text-xs text-gray-600">
                  {selectedEvent.location_city}, {selectedEvent.location_state}
                </p>
              )}
              {selectedEvent.start_date && (
                <p className="text-xs text-gray-500 mt-1">
                  {new Date(selectedEvent.start_date).toLocaleDateString()}
                </p>
              )}
            </div>
          </InfoWindow>
        )}
      </GoogleMap>
    </LoadScript>
  )
}
