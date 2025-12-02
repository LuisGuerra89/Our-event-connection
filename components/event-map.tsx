"use client"

import { useEffect, useState, useCallback } from "react"
import { GoogleMap, useJsApiLoader, Marker, InfoWindow } from "@react-google-maps/api"

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
  image_url?: string
}

interface UserInfo {
  profileImageUrl?: string | null
  fullName?: string
  initials?: string
}

interface EventMapProps {
  events: EventLocation[]
  center?: { lat: number; lng: number }
  zoom?: number
  height?: string
  showInfoWindows?: boolean
  userLocation?: { lat: number; lng: number } | null
  userInfo?: UserInfo | null
  selectedEventId?: string | null
  onEventSelect?: (eventId: string) => void
}

const containerStyle = {
  width: "100%",
  height: "400px",
}

// Create SVG marker icon for user (with initials or generic user icon)
function createUserMarkerIcon(userInfo?: UserInfo | null): string {
  // If user has info, show initials
  if (userInfo && (userInfo.initials || userInfo.fullName)) {
    const initials = userInfo.initials || userInfo.fullName
      ?.split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2) || "U"

    return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
      <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
        <ellipse cx="24" cy="52" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
        <path d="M24 56 L16 40 L32 40 Z" fill="#7c3aed"/>
        <circle cx="24" cy="22" r="20" fill="#7c3aed"/>
        <circle cx="24" cy="22" r="18" fill="white"/>
        <text x="24" y="28" text-anchor="middle" fill="#7c3aed" font-family="Arial, sans-serif" font-size="14" font-weight="bold">${initials}</text>
      </svg>
    `)}`
  }

  // Generic user icon (person silhouette) for non-logged users
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="48" height="56" viewBox="0 0 48 56">
      <ellipse cx="24" cy="52" rx="8" ry="3" fill="rgba(0,0,0,0.2)"/>
      <path d="M24 56 L16 40 L32 40 Z" fill="#3b82f6"/>
      <circle cx="24" cy="22" r="20" fill="#3b82f6"/>
      <circle cx="24" cy="22" r="18" fill="white"/>
      <!-- User icon -->
      <circle cx="24" cy="18" r="6" fill="#3b82f6"/>
      <path d="M14 32 C14 26 19 23 24 23 C29 23 34 26 34 32" fill="#3b82f6"/>
    </svg>
  `)}`
}

// Create SVG marker icon for event
function createEventMarkerIcon(event: EventLocation, isSelected: boolean): string {
  const initial = event.title.charAt(0).toUpperCase()
  const borderColor = isSelected ? "#7c3aed" : "#9ca3af"
  const fillColor = isSelected ? "#7c3aed" : "#6b7280"
  const size = isSelected ? 52 : 44
  const circleRadius = isSelected ? 18 : 16
  const fontSize = isSelected ? 14 : 12
  const centerX = size / 2
  const centerY = size / 2 - 2

  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(`
    <svg xmlns="http://www.w3.org/2000/svg" width="${size}" height="${size + 12}" viewBox="0 0 ${size} ${size + 12}">
      <ellipse cx="${centerX}" cy="${size + 8}" rx="6" ry="2" fill="rgba(0,0,0,0.2)"/>
      <path d="M${centerX} ${size + 12} L${centerX - 6} ${size - 4} L${centerX + 6} ${size - 4} Z" fill="${borderColor}"/>
      <circle cx="${centerX}" cy="${centerY}" r="${circleRadius + 2}" fill="${borderColor}"/>
      <circle cx="${centerX}" cy="${centerY}" r="${circleRadius}" fill="${fillColor}"/>
      <text x="${centerX}" y="${centerY + 5}" text-anchor="middle" fill="white" font-family="Arial, sans-serif" font-size="${fontSize}" font-weight="bold">${initial}</text>
    </svg>
  `)}`
}

export function EventMap({ 
  events, 
  center, 
  zoom = 10, 
  height = "400px",
  showInfoWindows = true,
  userLocation,
  userInfo,
  selectedEventId,
  onEventSelect
}: EventMapProps) {
  const [selectedEvent, setSelectedEvent] = useState<EventLocation | null>(null)
  const [mapCenter, setMapCenter] = useState(center)
  const [map, setMap] = useState<google.maps.Map | null>(null)
  const [currentZoom, setCurrentZoom] = useState(zoom)

  const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY || ""

  const { isLoaded, loadError } = useJsApiLoader({
    googleMapsApiKey: apiKey,
  })

  const onLoad = useCallback((map: google.maps.Map) => {
    setMap(map)
  }, [])

  const onUnmount = useCallback(() => {
    setMap(null)
  }, [])

  useEffect(() => {
    if (!center && events.length > 0) {
      setMapCenter({
        lat: events[0].latitude,
        lng: events[0].longitude,
      })
    } else if (center) {
      setMapCenter(center)
    }
  }, [center, events])

  // Center map on selected event when selectedEventId changes
  useEffect(() => {
    if (selectedEventId && map) {
      const event = events.find(e => e.id === selectedEventId)
      if (event && event.latitude && event.longitude) {
        map.panTo({ lat: event.latitude, lng: event.longitude })
        setTimeout(() => {
          map.setZoom(14)
          setCurrentZoom(14)
        }, 300)
        setSelectedEvent(event)
      }
    } else if (!selectedEventId) {
      setSelectedEvent(null)
    }
  }, [selectedEventId, events, map])

  const handleEventClick = (event: EventLocation) => {
    setSelectedEvent(event)
    if (onEventSelect) {
      onEventSelect(event.id)
    }
    if (map && event.latitude && event.longitude) {
      map.panTo({ lat: event.latitude, lng: event.longitude })
      setTimeout(() => {
        map.setZoom(14)
        setCurrentZoom(14)
      }, 300)
    }
  }

  const defaultCenter = {
    lat: 40.7128,
    lng: -74.0060,
  }

  if (!apiKey) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-muted-foreground">Google Maps API key not configured</p>
      </div>
    )
  }

  if (loadError) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-muted-foreground">Error loading maps</p>
      </div>
    )
  }

  if (!isLoaded) {
    return (
      <div className="w-full bg-muted rounded-lg flex items-center justify-center" style={{ height }}>
        <p className="text-muted-foreground">Loading map...</p>
      </div>
    )
  }

  return (
    <GoogleMap
      mapContainerStyle={{ ...containerStyle, height }}
      center={mapCenter || defaultCenter}
      zoom={currentZoom}
      onLoad={onLoad}
      onUnmount={onUnmount}
      options={{
        disableDefaultUI: false,
        zoomControl: true,
        streetViewControl: false,
        mapTypeControl: false,
        fullscreenControl: true,
      }}
    >
      {/* User location marker - shows even without login */}
      {userLocation && (
        <Marker
          position={userLocation}
          icon={{
            url: createUserMarkerIcon(userInfo),
            scaledSize: new window.google.maps.Size(48, 56),
            anchor: new window.google.maps.Point(24, 56),
          }}
          zIndex={1000}
        />
      )}

      {/* Event markers */}
      {events.map((event) => {
        const isSelected = selectedEventId === event.id
        return (
          <Marker
            key={event.id}
            position={{ lat: event.latitude, lng: event.longitude }}
            icon={{
              url: createEventMarkerIcon(event, isSelected),
              scaledSize: new window.google.maps.Size(isSelected ? 52 : 44, isSelected ? 64 : 56),
              anchor: new window.google.maps.Point(isSelected ? 26 : 22, isSelected ? 64 : 56),
            }}
            onClick={() => handleEventClick(event)}
            zIndex={isSelected ? 999 : 1}
          />
        )
      })}

      {showInfoWindows && selectedEvent && (
        <InfoWindow
          position={{
            lat: selectedEvent.latitude,
            lng: selectedEvent.longitude,
          }}
          onCloseClick={() => {
            setSelectedEvent(null)
            if (onEventSelect) {
              onEventSelect("")
            }
          }}
          options={{
            pixelOffset: new window.google.maps.Size(0, -60)
          }}
        >
          <div className="p-2 max-w-[220px]">
            {selectedEvent.image_url && (
              <div className="w-full h-24 mb-2 rounded-lg overflow-hidden">
                <img
                  src={selectedEvent.image_url}
                  alt={selectedEvent.title}
                  className="w-full h-full object-cover"
                />
              </div>
            )}
            <h3 className="font-semibold text-sm text-gray-900">{selectedEvent.title}</h3>
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
  )
}
