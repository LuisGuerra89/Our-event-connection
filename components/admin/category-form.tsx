"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import * as z from "zod"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Switch } from "@/components/ui/switch"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { Loader2 } from "lucide-react"
import { ImageUpload } from "@/components/admin/image-upload"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"

const categorySchema = z.object({
  name: z.string().min(1, "Name is required").max(100),
  slug: z.string().min(1, "Slug is required").max(100).regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Slug must be lowercase alphanumeric with hyphens"),
  description: z.string().min(1, "Description is required"),
  image_url: z.string().refine((val) => !val || /^https?:\/\/.+/.test(val), "Must be a valid URL or empty"),
  display_order: z.coerce.number().int().min(0, "Display order must be 0 or greater"),
  is_featured: z.boolean().default(false),
  status: z.enum(["active", "inactive"]).default("active"),
})

type CategoryFormValues = z.infer<typeof categorySchema>

interface CategoryFormProps {
  category?: {
    id: string
    name: string
    slug: string
    description: string
    image_url?: string | null
    display_order: number
    is_featured: boolean
    status: string
  }
  mode: "create" | "edit"
}

export function CategoryForm({ category, mode }: CategoryFormProps) {
  const router = useRouter()
  const { toast } = useToast()
  const [isLoading, setIsLoading] = useState(false)
  const [existingOrders, setExistingOrders] = useState<number[]>([])

  useEffect(() => {
    // Fetch all existing display orders for validation
    const fetchOrders = async () => {
      try {
        const response = await fetch("/api/admin/categories?select=display_order")
        if (response.ok) {
          const categories = await response.json()
          const orders = categories
            .map((cat: any) => cat.display_order)
            .filter((order: number) => order !== category?.display_order) // Exclude current category's order when editing
          setExistingOrders(orders)
        }
      } catch (error) {
        console.error("Failed to fetch existing orders:", error)
      }
    }
    fetchOrders()
  }, [category?.display_order])

  const form = useForm<CategoryFormValues>({
    resolver: zodResolver(categorySchema),
    defaultValues: {
      name: category?.name || "",
      slug: category?.slug || "",
      description: category?.description || "",
      image_url: category?.image_url || "",
      display_order: category?.display_order || 0,
      is_featured: category?.is_featured || false,
      status: (category?.status as "active" | "inactive") || "active",
    },
  })

  const generateSlug = (name: string) => {
    return name
      .toLowerCase()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/(^-|-$)/g, "")
  }

  const onNameChange = (name: string) => {
    if (mode === "create" && !form.formState.dirtyFields.slug) {
      form.setValue("slug", generateSlug(name))
    }
  }

  async function onSubmit(values: CategoryFormValues) {
    // Client-side validation for unique order
    if (existingOrders.includes(values.display_order)) {
      toast({
        title: "Invalid Order",
        description: "This display order is already in use. Please choose a different number.",
        variant: "destructive",
      })
      return
    }

    // Validate order is not negative (extra safety check)
    if (values.display_order < 0) {
      toast({
        title: "Invalid Order",
        description: "Display order cannot be negative.",
        variant: "destructive",
      })
      return
    }

    setIsLoading(true)

    try {
      const url = mode === "create" ? "/api/admin/categories" : `/api/admin/categories/${category?.id}`
      const method = mode === "create" ? "POST" : "PATCH"

      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(values),
      })

      if (!response.ok) {
        const error = await response.json()
        throw new Error(error.error || "Failed to save category")
      }

      toast({
        title: mode === "create" ? "Category created" : "Category updated",
        description: `The category has been ${mode === "create" ? "created" : "updated"} successfully.`,
      })

      router.push("/admin/categories")
      router.refresh()
    } catch (error) {
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Something went wrong",
        variant: "destructive",
      })
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <Card>
          <CardHeader>
            <CardTitle>Basic Information</CardTitle>
            <CardDescription>Enter the category details</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="e.g., Music Festival"
                      {...field}
                      onChange={(e) => {
                        field.onChange(e)
                        onNameChange(e.target.value)
                      }}
                    />
                  </FormControl>
                  <FormDescription>The display name of the category</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="slug"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Slug *</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g., music-festival" {...field} />
                  </FormControl>
                  <FormDescription>URL-friendly version (lowercase, hyphens only)</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description *</FormLabel>
                  <FormControl>
                    <Textarea placeholder="Enter category description" rows={4} {...field} />
                  </FormControl>
                  <FormDescription>Describe what this category is about</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="image_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Image *</FormLabel>
                  <FormControl>
                    <Tabs defaultValue="upload" className="w-full">
                      <TabsList className="grid w-full grid-cols-2">
                        <TabsTrigger value="upload">Upload</TabsTrigger>
                        <TabsTrigger value="url">URL</TabsTrigger>
                      </TabsList>
                      <TabsContent value="upload" className="mt-4">
                        <ImageUpload value={field.value} onChange={field.onChange} />
                      </TabsContent>
                      <TabsContent value="url" className="mt-4">
                        <Input placeholder="https://example.com/image.jpg" {...field} />
                        <p className="mt-2 text-xs text-muted-foreground">
                          Enter the full URL to an external image
                        </p>
                      </TabsContent>
                    </Tabs>
                  </FormControl>
                  <FormDescription>Upload an image or provide a URL</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="display_order"
              render={({ field }) => {
                const orderValue = field.value
                const isOrderDuplicate = orderValue !== undefined && existingOrders.includes(Number(orderValue))
                
                return (
                  <FormItem>
                    <FormLabel>Display Order *</FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        min="0"
                        placeholder="0"
                        {...field}
                        onChange={(e) => {
                          field.onChange(e)
                        }}
                      />
                    </FormControl>
                    <FormDescription>
                      Lower numbers appear first. Must be unique and 0 or greater.
                      {isOrderDuplicate && (
                        <span className="block mt-1 text-red-500 font-semibold">
                          This order number is already in use. Please choose a different number.
                        </span>
                      )}
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )
              }}
            />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Settings</CardTitle>
            <CardDescription>Configure category visibility and status</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="is_featured"
              render={({ field }) => (
                <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4">
                  <div className="space-y-0.5">
                    <FormLabel className="text-base">Featured</FormLabel>
                    <FormDescription>Display this category prominently on the homepage</FormDescription>
                  </div>
                  <FormControl>
                    <Switch checked={field.value} onCheckedChange={field.onChange} />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="status"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Status *</FormLabel>
                  <Select onValueChange={field.onChange} defaultValue={field.value}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Select status" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      <SelectItem value="active">Active</SelectItem>
                      <SelectItem value="inactive">Inactive</SelectItem>
                    </SelectContent>
                  </Select>
                  <FormDescription>Only active categories are visible to users</FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />
          </CardContent>
        </Card>

        <div className="flex justify-end gap-4">
          <Button type="button" variant="outline" onClick={() => router.back()} disabled={isLoading}>
            Cancel
          </Button>
          <Button type="submit" disabled={isLoading}>
            {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create Category" : "Update Category"}
          </Button>
        </div>
      </form>
    </Form>
  )
}
