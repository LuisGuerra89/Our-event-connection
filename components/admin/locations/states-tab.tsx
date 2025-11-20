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
import { addState, updateState, deleteState } from "@/app/admin/locations/actions"
import { useRouter } from "next/navigation"

interface State {
  id: string
  name: string
  code: string | null
  status: string
  country_id: string
  countries?: { name: string }
}

interface Country {
  id: string
  name: string
}

export function StatesTab({ states, countries }: { states: State[]; countries: Country[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingState, setEditingState] = useState<State | null>(null)
  const [loading, setLoading] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState("")

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingState) {
      await updateState(editingState.id, formData)
    } else {
      await addState(formData)
    }

    setLoading(false)
    setOpen(false)
    setEditingState(null)
    setSelectedCountry("")
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this state?")) {
      await deleteState(id)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>States</CardTitle>
          <CardDescription>Manage states for different countries</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingState(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add State
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingState ? "Edit State" : "Add State"}</DialogTitle>
              <DialogDescription>{editingState ? "Update" : "Create a new"} state entry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="country_id">Country *</Label>
                <Select
                  name="country_id"
                  defaultValue={editingState?.country_id}
                  value={selectedCountry}
                  onValueChange={setSelectedCountry}
                  required
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select a country" />
                  </SelectTrigger>
                  <SelectContent>
                    {countries.map((country) => (
                      <SelectItem key={country.id} value={country.id}>
                        {country.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label htmlFor="name">State Name *</Label>
                <Input id="name" name="name" defaultValue={editingState?.name} required />
              </div>
              <div>
                <Label htmlFor="code">State Code</Label>
                <Input id="code" name="code" defaultValue={editingState?.code || ""} placeholder="CA, NY, etc." />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  defaultChecked={editingState?.status === "active"}
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
              <TableHead>State</TableHead>
              <TableHead>Country</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {states.map((state) => (
              <TableRow key={state.id}>
                <TableCell className="font-medium">{state.name}</TableCell>
                <TableCell>{state.countries?.name || "—"}</TableCell>
                <TableCell>{state.code || "—"}</TableCell>
                <TableCell>
                  <Badge variant={state.status === "active" ? "default" : "secondary"}>{state.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingState(state)
                        setSelectedCountry(state.country_id)
                        setOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(state.id)}>
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
