"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import Link from "next/link"
import { ArrowLeft, AlertCircle, CheckCircle2, XCircle, Loader2 } from "lucide-react"
import { format } from "date-fns"
import { createClient } from "@/lib/supabase/client"
import { ImageUpload } from "@/components/admin/image-upload"

interface Affiliate {
  id: string
  name: string
  description: string
  address: string
  city: string
  state: string
  country: string
  image_url: string | null
  approval_status: "pending" | "approved" | "rejected"
  application_date: string
  approved_date: string | null
}

interface EditAffiliateClientProps {
  affiliate: Affiliate
  affiliateId: string
}

export default function EditAffiliateClient({ affiliate: initialAffiliate, affiliateId }: EditAffiliateClientProps) {
  const [affiliate, setAffiliate] = useState<Affiliate>(initialAffiliate)
  const [imageUrl, setImageUrl] = useState(initialAffiliate.image_url || "")
  const [isApproving, setIsApproving] = useState(false)
  const [isRejecting, setIsRejecting] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [successDialog, setSuccessDialog] = useState(false)
  const [successMessage, setSuccessMessage] = useState("")
  const [successTitle, setSuccessTitle] = useState("")
  const router = useRouter()
  const supabase = createClient()

  async function approveAffiliate() {
    if (!affiliate) return
    setIsApproving(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from("affiliates")
        .update({
          approval_status: "approved",
          approved_date: new Date().toISOString(),
          image_url: imageUrl || null,
        })
        .eq("id", affiliateId)

      if (err) throw err

      setAffiliate({ ...affiliate, approval_status: "approved", image_url: imageUrl || null })
      setSuccessTitle("Partner Approved")
      setSuccessMessage("The partner has been successfully approved and will be visible in the public showcase.")
      setSuccessDialog(true)
    } catch (err) {
      console.error(err)
      setError("Error approving partner. Please try again.")
    } finally {
      setIsApproving(false)
    }
  }

  async function rejectAffiliate() {
    if (!affiliate) return
    setIsRejecting(true)
    setError(null)

    try {
      const { error: err } = await supabase
        .from("affiliates")
        .update({
          approval_status: "rejected",
        })
        .eq("id", affiliateId)

      if (err) throw err

      setAffiliate({ ...affiliate, approval_status: "rejected" })
      setSuccessTitle("Application Rejected")
      setSuccessMessage("The application has been rejected. The user can reapply.")
      setSuccessDialog(true)
    } catch (err) {
      console.error(err)
      setError("Error rejecting application. Please try again.")
    } finally {
      setIsRejecting(false)
    }
  }

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  return (
    <div className="container mx-auto py-8 max-w-3xl">
      <Button variant="ghost" asChild className="mb-6">
        <Link href="/admin/affiliates">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to Partners
        </Link>
      </Button>

      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div>
              <CardTitle className="text-2xl">Review Application</CardTitle>
              <CardDescription>Review and approve/reject this partner application</CardDescription>
            </div>
            <Badge
              variant={
                affiliate.approval_status === "approved"
                  ? "default"
                  : affiliate.approval_status === "rejected"
                    ? "destructive"
                    : "secondary"
              }
            >
              {affiliate.approval_status === "pending" && "Pending"}
              {affiliate.approval_status === "approved" && "Approved"}
              {affiliate.approval_status === "rejected" && "Rejected"}
            </Badge>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Error Alert */}
          {error && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <AlertCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">{error}</AlertDescription>
            </Alert>
          )}

          {/* Business Header */}
          <div className="flex items-start gap-6 pb-6 border-b">
            <Avatar className="h-16 w-16">
              <AvatarImage src={imageUrl || affiliate.image_url || undefined} alt={affiliate.name} />
              <AvatarFallback className="text-lg">{getInitials(affiliate.name)}</AvatarFallback>
            </Avatar>
            <div className="flex-1">
              <h3 className="text-xl font-semibold">{affiliate.name}</h3>
              <p className="text-sm text-muted-foreground">
                {[affiliate.city, affiliate.state, affiliate.country].filter(Boolean).join(", ")}
              </p>
              <p className="text-xs text-muted-foreground mt-2">
                Applied on {format(new Date(affiliate.application_date), "MMMM d, yyyy")}
              </p>
            </div>
          </div>

          {/* Edit Business Image */}
          <div className="border-b pb-6">
            <h4 className="font-semibold text-sm mb-3">Business Logo/Image</h4>
            <ImageUpload
              value={imageUrl || affiliate.image_url || ""}
              onChange={setImageUrl}
              bucket="affiliates"
              folder="logos"
              maxSize={5}
            />
          </div>

          {/* Business Details */}
          <div className="space-y-4">
            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Address</h4>
              <p>{affiliate.address || "Not provided"}</p>
            </div>

            <div>
              <h4 className="font-semibold text-sm text-muted-foreground mb-2">Description</h4>
              <p className="text-sm leading-relaxed">{affiliate.description || "Not provided"}</p>
            </div>

            <div className="grid md:grid-cols-3 gap-4 pt-4 border-t">
              <div>
                <p className="text-xs text-muted-foreground">Status</p>
                <p className="font-semibold text-sm">{affiliate.approval_status}</p>
              </div>
              <div>
                <p className="text-xs text-muted-foreground">Application Date</p>
                <p className="font-semibold text-sm">
                  {format(new Date(affiliate.application_date), "MMM d, yyyy")}
                </p>
              </div>
              {affiliate.approved_date && (
                <div>
                  <p className="text-xs text-muted-foreground">Approved Date</p>
                  <p className="font-semibold text-sm">
                    {format(new Date(affiliate.approved_date), "MMM d, yyyy")}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Alerts based on status */}
          {affiliate.approval_status === "approved" && (
            <Alert className="border-green-500 bg-green-50 dark:bg-green-950">
              <CheckCircle2 className="h-4 w-4 text-green-600" />
              <AlertDescription className="text-green-800 dark:text-green-200">
                This partner is approved and visible in the public showcase.
              </AlertDescription>
            </Alert>
          )}

          {affiliate.approval_status === "rejected" && (
            <Alert className="border-red-500 bg-red-50 dark:bg-red-950">
              <XCircle className="h-4 w-4 text-red-600" />
              <AlertDescription className="text-red-800 dark:text-red-200">
                This application was rejected. The user can reapply.
              </AlertDescription>
            </Alert>
          )}

          {affiliate.approval_status === "pending" && (
            <Alert className="border-yellow-500 bg-yellow-50 dark:bg-yellow-950">
              <AlertCircle className="h-4 w-4 text-yellow-600" />
              <AlertDescription className="text-yellow-800 dark:text-yellow-200">
                This application is pending your review. Please approve or reject it.
              </AlertDescription>
            </Alert>
          )}

          {/* Action Buttons */}
          {affiliate.approval_status === "pending" && (
            <div className="flex gap-3 pt-4">
              <Button
                onClick={approveAffiliate}
                disabled={isApproving || isRejecting}
                className="flex-1 bg-green-600 hover:bg-green-700"
              >
                {isApproving ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Approving...
                  </>
                ) : (
                  <>
                    <CheckCircle2 className="h-4 w-4 mr-2" />
                    Approve Partner
                  </>
                )}
              </Button>
              <Button
                onClick={rejectAffiliate}
                disabled={isApproving || isRejecting}
                variant="destructive"
                className="flex-1"
              >
                {isRejecting ? (
                  <>
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                    Rejecting...
                  </>
                ) : (
                  <>
                    <XCircle className="h-4 w-4 mr-2" />
                    Reject Application
                  </>
                )}
              </Button>
            </div>
          )}

          {affiliate.approval_status !== "pending" && (
            <div className="pt-4 border-t">
              <p className="text-sm text-muted-foreground mb-3">
                This application has already been {affiliate.approval_status}. To change the status, create a new record or contact support.
              </p>
              <Button asChild variant="outline" className="w-full">
                <Link href="/admin/affiliates">Back to List</Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      <Dialog open={successDialog} onOpenChange={setSuccessDialog}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle>{successTitle}</DialogTitle>
          </DialogHeader>
          <p className="text-sm text-muted-foreground">{successMessage}</p>
          <DialogFooter>
            <Button
              onClick={() => {
                setSuccessDialog(false)
                router.push("/admin/affiliates")
              }}
            >
              Back to List
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
