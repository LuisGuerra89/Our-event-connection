"use client"

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, RefreshCw, ExternalLink } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Payment {
  id: string
  registration_id: string | null
  payment_amount: number
  tax_amount: number
  discount_amount: number
  total_amount: number
  payment_method: string | null
  transaction_id: string | null
  payment_status: string
  payment_date: string
  stripe_payment_intent_id: string | null
  profiles?: {
    full_name: string | null
    email: string
  } | null
  events?: {
    title: string
  } | null
}

export function PaymentsTable({ payments }: { payments: Payment[] }) {
  const { toast } = useToast()
  const router = useRouter()
  const [searchTerm, setSearchTerm] = useState("")
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [methodFilter, setMethodFilter] = useState<string>("all")
  const [syncing, setSyncing] = useState(false)

  const handleSyncStripe = async () => {
    setSyncing(true)
    try {
      const response = await fetch("/api/admin/sync-stripe-payments", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ limit: 100 }),
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || "Failed to sync payments")
      }

      toast({
        title: "Sync Complete",
        description: `Synced ${data.synced} payments from Stripe${data.errors > 0 ? ` (${data.errors} errors)` : ""}`,
      })

      router.refresh()
    } catch (error) {
      toast({
        title: "Sync Failed",
        description: error instanceof Error ? error.message : "Failed to sync with Stripe",
        variant: "destructive",
      })
    } finally {
      setSyncing(false)
    }
  }

  const filteredPayments = payments.filter((payment) => {
    const matchesSearch =
      payment.profiles?.full_name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.profiles?.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.events?.title?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.registration_id?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      payment.transaction_id?.toLowerCase().includes(searchTerm.toLowerCase())

    const matchesStatus = statusFilter === "all" || payment.payment_status === statusFilter
    const matchesMethod = methodFilter === "all" || payment.payment_method === methodFilter

    return matchesSearch && matchesStatus && matchesMethod
  })

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1 flex items-center gap-2">
          <Search className="h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search by customer, event, registration ID, or transaction ID..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        
        <Select value={statusFilter} onValueChange={setStatusFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Status</SelectItem>
            <SelectItem value="success">Success</SelectItem>
            <SelectItem value="failed">Failed</SelectItem>
            <SelectItem value="pending">Pending</SelectItem>
            <SelectItem value="refunded">Refunded</SelectItem>
          </SelectContent>
        </Select>

        <Select value={methodFilter} onValueChange={setMethodFilter}>
          <SelectTrigger className="w-[150px]">
            <SelectValue placeholder="Method" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Methods</SelectItem>
            <SelectItem value="card">Card</SelectItem>
            <SelectItem value="bank_transfer">Bank Transfer</SelectItem>
            <SelectItem value="cash">Cash</SelectItem>
          </SelectContent>
        </Select>

        <Button onClick={handleSyncStripe} disabled={syncing} variant="outline">
          <RefreshCw className={`h-4 w-4 mr-2 ${syncing ? "animate-spin" : ""}`} />
          {syncing ? "Syncing..." : "Sync Stripe"}
        </Button>
      </div>

      <div className="rounded-md border overflow-x-auto">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Customer Name</TableHead>
              <TableHead>Registration ID</TableHead>
              <TableHead>Event Name</TableHead>
              <TableHead>Payment Amount</TableHead>
              <TableHead>Tax Amount</TableHead>
              <TableHead>Discount Amount</TableHead>
              <TableHead>Total Amount</TableHead>
              <TableHead>Payment Method</TableHead>
              <TableHead>Transaction ID</TableHead>
              <TableHead>Payment Date</TableHead>
              <TableHead>Payment Status</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredPayments.length === 0 ? (
              <TableRow>
                <TableCell colSpan={11} className="text-center text-muted-foreground py-8">
                  {searchTerm || statusFilter !== "all" || methodFilter !== "all"
                    ? "No payments found matching your filters"
                    : "No payments found"}
                </TableCell>
              </TableRow>
            ) : (
              filteredPayments.map((payment) => (
                <TableRow key={payment.id}>
                  <TableCell>
                    <div className="font-medium">{payment.profiles?.full_name || "Unknown"}</div>
                    <div className="text-sm text-muted-foreground">{payment.profiles?.email || "—"}</div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {payment.registration_id || "—"}
                  </TableCell>
                  <TableCell>{payment.events?.title || "—"}</TableCell>
                  <TableCell>${Number(payment.payment_amount).toFixed(2)}</TableCell>
                  <TableCell>${Number(payment.tax_amount).toFixed(2)}</TableCell>
                  <TableCell>
                    {payment.discount_amount > 0 ? (
                      <span className="text-green-600">
                        -${Number(payment.discount_amount).toFixed(2)}
                      </span>
                    ) : (
                      "$0.00"
                    )}
                  </TableCell>
                  <TableCell className="font-semibold">
                    ${Number(payment.total_amount).toFixed(2)}
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="capitalize">
                      {payment.payment_method || "—"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-1">
                      <span className="font-mono text-xs truncate max-w-[120px]">
                        {payment.transaction_id || "—"}
                      </span>
                      {payment.stripe_payment_intent_id && (
                        <a
                          href={`https://dashboard.stripe.com/payments/${payment.stripe_payment_intent_id}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-primary hover:text-primary/80"
                        >
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </TableCell>
                  <TableCell className="whitespace-nowrap">
                    {new Date(payment.payment_date).toLocaleDateString("en-US", {
                      month: "short",
                      day: "numeric",
                      year: "numeric",
                    })}
                  </TableCell>
                  <TableCell>
                    <Badge
                      variant={
                        payment.payment_status === "success"
                          ? "default"
                          : payment.payment_status === "failed"
                            ? "destructive"
                            : payment.payment_status === "refunded"
                            ? "secondary"
                            : "outline"
                      }
                    >
                      {payment.payment_status}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between text-sm text-muted-foreground">
        <div>
          Showing {filteredPayments.length} of {payments.length} payments
        </div>
        {filteredPayments.length > 0 && (
          <div>
            Total Revenue: $
            {filteredPayments
              .filter((p) => p.payment_status === "success")
              .reduce((sum, p) => sum + Number(p.total_amount), 0)
              .toFixed(2)}
          </div>
        )}
      </div>
    </div>
  )
}
