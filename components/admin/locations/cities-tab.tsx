"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Plus, Edit, Trash2 } from "lucide-react"
import { addCity, updateCity, deleteCity } from "@/app/admin/locations/actions"
import { useRouter } from "next/navigation"

interface City {
  id: string
  name: string
  status: string
  state_id: string
  states?: {
    name: string
    countries?: { name: string }
  }
}

interface State {
  id: string
  name: string
  countries?: { name: string }
}

export function CitiesTab({ cities, states }: { cities: City[]; states: State[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingCity, setEditingCity] = useState<City | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedState, setSelectedState] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingCity) {
      await updateCity(editingCity.id, formData)
    } else {
      await addCity(formData)
    }

    setLoading(false)
    setOpen(false)
    setEditingCity(null)
    setSelectedState("")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this city?")) {
      await deleteCity(id)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Cities</CardTitle>
          <CardDescription>Manage cities for different states</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCity(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add City
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCity ? "Edit City" : "Add City"}</DialogTitle>
              <DialogDescription>{editingCity ? "Update" : "Create a new"} city entry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="state_id">State *</Label>
                <Select
                  name="state_id"
                  defaultValue={editingCity?.state_id}
                  value={selectedState}
                  onValueChange={setSelectedState}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a state" />
                  </SelectTrigger>
                  <SelectContent>
                    {states.map((state) => (
                      <SelectItem key={state.id} value={state.id}>
                        {state.name} ({state.countries?.name || "Unknown"})
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">City Name *</Label>
                <Input id="name" name="name" defaultValue={editingCity?.name} required />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  defaultChecked={editingCity?.status === "active"}
                  className="h-4 w-4"
                />
                <Label htmlFor="status">Active</Label>
              </div>
              <div className="flex gap-2">
                <Button type="submit" disabled={loading}>
                  {loading ? "Saving..." : "Save"}
                </Button>
                <Button type="button" variant="outline" onClick={() => setOpen(false)}>
                  Cancel
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>City</TableHead>
              <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {cities.map((city) => (
              <TableRow key={city.id}>
                <TableCell className="font-medium">{city.name}</TableCell>
                <TableCell>{city.states?.name || "—"}</TableCell>
                <TableCell>{city.states?.countries?.name || "—"}</TableCell>
                <TableCell>
                  <Badge variant={city.status === "active" ? "default" : "secondary"}>{city.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCity(city)
                        setSelectedState(city.state_id)
                        setOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(city.id)}>
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  )
}
