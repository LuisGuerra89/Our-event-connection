"use client"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Edit, Trash2 } from "lucide-react"
import Link from "next/link"

interface Affiliate {
  id: string
  name: string
  city: string | null
  state: string | null
  country: string | null
  barcode: string | null
  status: string
}

export function AffiliatesTable({ affiliates }: { affiliates: Affiliate[] }) {
  return (
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead>Name</TableHead>
            <TableHead>Location</TableHead>
            <TableHead>Barcode</TableHead>
            <TableHead>Status</TableHead>
            <TableHead className="text-right">Actions</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {affiliates.length === 0 ? (
            <TableRow>
              <TableCell colSpan={5} className="text-center text-muted-foreground">
                No affiliates found
              </TableCell>
            </TableRow>
          ) : (
            affiliates.map((affiliate) => (
              <TableRow key={affiliate.id}>
                <TableCell className="font-medium">{affiliate.name}</TableCell>
                <TableCell>
                  {[affiliate.city, affiliate.state, affiliate.country].filter(Boolean).join(", ") || "—"}
                </TableCell>
                <TableCell className="font-mono text-sm">{affiliate.barcode || "—"}</TableCell>
                <TableCell>
                  <Badge variant={affiliate.status === "active" ? "default" : "secondary"}>{affiliate.status}</Badge>
                </TableCell>
                <TableCell className="text-right">
                  <div className="flex justify-end gap-2">
                    <Button variant="ghost" size="icon" asChild>
                      <Link href={`/admin/affiliates/${affiliate.id}`}>
                        <Edit className="h-4 w-4" />
                      </Link>
                    </Button>
                    <Button variant="ghost" size="icon">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </TableCell>
              </TableRow>
            ))
          )}
        </TableBody>
      </Table>
    </div>
  )
}
