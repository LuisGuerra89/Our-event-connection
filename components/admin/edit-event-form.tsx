"use client"

import type React from "react"

import { useState } from "react"
import { createBrowserClient } from "@/lib/supabase/client"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"

type Event = {
  id: string
  title: string
  description: string
  event_type: string
  start_date: string
  end_date: string
  location_name: string
  location_address: string
  location_city: string
  location_state: string
  location_country: string
  capacity: number
  price: number
  status: string
}

export function EditEventForm({ event }: { event: Event }) {
  const [loading, setLoading] = useState(false)
  const router = useRouter()
  const supabase = createBrowserClient()

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    const eventData = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      event_type: formData.get("event_type") as string,
      start_date: formData.get("start_date") as string,
      end_date: formData.get("end_date") as string,
      location_name: formData.get("location_name") as string,
      location_address: formData.get("location_address") as string,
      location_city: formData.get("location_city") as string,
      location_state: formData.get("location_state") as string,
      location_country: formData.get("location_country") as string,
      capacity: Number.parseInt(formData.get("capacity") as string),
      price: Number.parseFloat(formData.get("price") as string),
      status: formData.get("status") as string,
      updated_at: new Date().toISOString(),
    }

    try {
      const { error } = await supabase.from("events").update(eventData).eq("id", event.id)

      if (error) throw error

      router.push("/admin/events")
      router.refresh()
    } catch (error) {
      console.error("Error updating event:", error)
      alert("Failed to update event")
    } finally {
      setLoading(false)
    }
  }

  // Format datetime for input (remove timezone info)
  const formatDateTimeLocal = (dateString: string) => {
    const date = new Date(dateString)
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, "0")
    const day = String(date.getDate()).padStart(2, "0")
    const hours = String(date.getHours()).padStart(2, "0")
    const minutes = String(date.getMinutes()).padStart(2, "0")
    return `${year}-${month}-${day}T${hours}:${minutes}`
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Event Details</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="title">Event Title</Label>
            <Input id="title" name="title" defaultValue={event.title} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea id="description" name="description" defaultValue={event.description} rows={4} required />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="event_type">Event Type</Label>
              <Select name="event_type" defaultValue={event.event_type} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mixer">Mixer</SelectItem>
                  <SelectItem value="speed_dating">Speed Dating</SelectItem>
                  <SelectItem value="activity">Activity</SelectItem>
                  <SelectItem value="dinner">Dinner</SelectItem>
                  <SelectItem value="party">Party</SelectItem>
                  <SelectItem value="other">Other</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="status">Status</Label>
              <Select name="status" defaultValue={event.status} required>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="upcoming">Upcoming</SelectItem>
                  <SelectItem value="ongoing">Ongoing</SelectItem>
                  <SelectItem value="completed">Completed</SelectItem>
                  <SelectItem value="cancelled">Cancelled</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="start_date">Start Date & Time</Label>
              <Input
                id="start_date"
                name="start_date"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(event.start_date)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="end_date">End Date & Time</Label>
              <Input
                id="end_date"
                name="end_date"
                type="datetime-local"
                defaultValue={formatDateTimeLocal(event.end_date)}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_name">Venue Name</Label>
            <Input id="location_name" name="location_name" defaultValue={event.location_name} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="location_address">Address</Label>
            <Input id="location_address" name="location_address" defaultValue={event.location_address} required />
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="space-y-2">
              <Label htmlFor="location_city">City</Label>
              <Input id="location_city" name="location_city" defaultValue={event.location_city} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_state">State</Label>
              <Input id="location_state" name="location_state" defaultValue={event.location_state} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="location_country">Country</Label>
              <Input id="location_country" name="location_country" defaultValue={event.location_country} required />
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-2">
              <Label htmlFor="capacity">Capacity</Label>
              <Input id="capacity" name="capacity" type="number" min="1" defaultValue={event.capacity} required />
            </div>

            <div className="space-y-2">
              <Label htmlFor="price">Price ($)</Label>
              <Input id="price" name="price" type="number" min="0" step="0.01" defaultValue={event.price} required />
            </div>
          </div>

          <div className="flex gap-4">
            <Button type="submit" disabled={loading}>
              {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Update Event
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
