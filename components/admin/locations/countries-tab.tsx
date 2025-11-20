"use client"

import type React from "react"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
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
import { addCountry, updateCountry, deleteCountry } from "@/app/admin/locations/actions"
import { useRouter } from "next/navigation"

interface Country {
  id: string
  name: string
  code: string | null
  status: string
}

export function CountriesTab({ countries }: { countries: Country[] }) {
  const router = useRouter()
  const [open, setOpen] = useState(false)
  const [editingCountry, setEditingCountry] = useState<Country | null>(null)
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setLoading(true)

    const formData = new FormData(e.currentTarget)

    if (editingCountry) {
      await updateCountry(editingCountry.id, formData)
    } else {
      await addCountry(formData)
    }

    setLoading(false)
    setOpen(false)
    setEditingCountry(null)
    router.refresh()
  }

  const handleDelete = async (id: string) => {
    if (confirm("Are you sure you want to delete this country?")) {
      await deleteCountry(id)
      router.refresh()
    }
  }

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between">
        <div>
          <CardTitle>Countries</CardTitle>
          <CardDescription>Manage countries for the platform</CardDescription>
        </div>
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => setEditingCountry(null)}>
              <Plus className="h-4 w-4 mr-2" />
              Add Country
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>{editingCountry ? "Edit Country" : "Add Country"}</DialogTitle>
              <DialogDescription>{editingCountry ? "Update" : "Create a new"} country entry</DialogDescription>
            </DialogHeader>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <Label htmlFor="name">Country Name *</Label>
                <Input id="name" name="name" defaultValue={editingCountry?.name} required />
              </div>
              <div>
                <Label htmlFor="code">Country Code</Label>
                <Input id="code" name="code" defaultValue={editingCountry?.code || ""} placeholder="US, GB, etc." />
              </div>
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="status"
                  name="status"
                  defaultChecked={editingCountry?.status === "active"}
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
              <TableHead>Name</TableHead>
              <TableHead>Code</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {countries.map((country) => (
              <TableRow key={country.id}>
                <TableCell className="font-medium">{country.name}</TableCell>
                <TableCell>{country.code || "—"}</TableCell>
                <TableCell>
                  <Badge variant={country.status === "active" ? "default" : "secondary"}>{country.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => {
                        setEditingCountry(country)
                        setOpen(true)
                      }}
                    >
                      <Edit className="h-4 w-4" />
                    </Button>
                    <Button variant="ghost" size="icon" onClick={() => handleDelete(country.id)}>
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
