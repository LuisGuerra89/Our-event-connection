"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { createBrowserClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"

interface EnumFormProps {
  initialData?: {
    id: string
    enum_type: string
    enum_title: string
    parent_type: string | null
    parent_value: string | null
    display_order: number
    status: string
  }
}

export function EnumForm({ initialData }: EnumFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [loading, setLoading] = useState(false)
  const [enumType, setEnumType] = useState(initialData?.enum_type || "")
  const [enumTitle, setEnumTitle] = useState(initialData?.enum_title || "")
  const [parentType, setParentType] = useState(initialData?.parent_type || "")
  const [parentValue, setParentValue] = useState(initialData?.parent_value || "")
  const [displayOrder, setDisplayOrder] = useState(initialData?.display_order?.toString() || "0")
  const [status, setStatus] = useState(initialData?.status || "active")

  const [enumTypes, setEnumTypes] = useState<string[]>([])
  const [parentEnums, setParentEnums] = useState<Array<{ type: string; value: string }>>([])

  useEffect(() => {
    loadEnumTypes()
    loadParentEnums()
  }, [])

  const loadEnumTypes = async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase.from("enums").select("enum_type").order("enum_type")
    if (data) {
      const types = Array.from(new Set(data.map((e) => e.enum_type)))
      setEnumTypes(types)
    }
  }

  const loadParentEnums = async () => {
    const supabase = createBrowserClient()
    const { data } = await supabase.from("enums").select("enum_type, enum_title").order("enum_type, enum_title")
    if (data) {
      setParentEnums(data.map((e) => ({ type: e.enum_type, value: e.enum_title })))
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      const supabase = createBrowserClient()
      const enumData = {
        enum_type: enumType,
        enum_title: enumTitle,
        parent_type: parentType || null,
        parent_value: parentValue || null,
        display_order: parseInt(displayOrder),
        status,
      }

      let error
      if (initialData) {
        const result = await supabase.from("enums").update(enumData).eq("id", initialData.id)
        error = result.error
      } else {
        const result = await supabase.from("enums").insert([enumData])
        error = result.error
      }

      if (error) throw error

      toast({
        title: "Success",
        description: initialData ? "Enum updated successfully" : "Enum created successfully",
      })
      router.push("/admin/enums")
      router.refresh()
    } catch (error) {
      console.error("Error saving enum:", error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to save enum",
        variant: "destructive",
      })
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      <div className="space-y-2">
        <Label htmlFor="enum_type">
          Enum Type * <span className="text-xs text-muted-foreground">(e.g., event_type, venue_type, skin_tone)</span>
        </Label>
        <Select value={enumType} onValueChange={setEnumType} required>
          <SelectTrigger>
            <SelectValue placeholder="Select or type an existing enum type" />
          </SelectTrigger>
          <SelectContent>
            {enumTypes.map((type) => (
              <SelectItem key={type} value={type}>
                {type}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
        <p className="text-xs text-muted-foreground mt-1">
          Select an existing type or use the input field to add a new one
        </p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="enum_title">
          Enum Title * <span className="text-xs text-muted-foreground">(Display value)</span>
        </Label>
        <Input
          id="enum_title"
          value={enumTitle}
          onChange={(e) => setEnumTitle(e.target.value)}
          placeholder="Speed Dating"
          required
        />
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="parent_type">
            Parent Type <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <Select value={parentType} onValueChange={setParentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select parent type" />
            </SelectTrigger>
            <SelectContent>
              {Array.from(new Set(parentEnums.map((e) => e.type))).map((type) => (
                <SelectItem key={type} value={type}>
                  {type}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="space-y-2">
          <Label htmlFor="parent_value">
            Parent Value <span className="text-xs text-muted-foreground">(Optional)</span>
          </Label>
          <Select value={parentValue} onValueChange={setParentValue} disabled={!parentType}>
            <SelectTrigger>
              <SelectValue placeholder="Select parent value" />
            </SelectTrigger>
            <SelectContent>
              {parentEnums
                .filter((e) => e.type === parentType)
                .map((e) => (
                  <SelectItem key={e.value} value={e.value}>
                    {e.value}
                  </SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="display_order">Display Order</Label>
          <Input
            id="display_order"
            type="number"
            value={displayOrder}
            onChange={(e) => setDisplayOrder(e.target.value)}
            placeholder="0"
          />
        </div>

        <div className="space-y-2">
          <Label htmlFor="status">Status *</Label>
          <Select value={status} onValueChange={setStatus} required>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="active">Active</SelectItem>
              <SelectItem value="inactive">Inactive</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      <div className="flex justify-end gap-4 pt-4">
        <Button type="button" variant="outline" onClick={() => router.push("/admin/enums")} disabled={loading}>
          Cancel
        </Button>
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {initialData ? "Update" : "Create"} Enum
        </Button>
      </div>
    </form>
  )
}
