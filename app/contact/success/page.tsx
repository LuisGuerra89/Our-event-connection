import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { CheckCircle } from "lucide-react"
import Link from "next/link"
import { PublicPageLayout } from "@/components/public-page-layout"

export default function ContactSuccessPage() {
  return (
    <PublicPageLayout>
      <div className="container mx-auto px-4 py-16 max-w-2xl">
        <Card className="border-0 shadow-lg">
          <CardContent className="pt-12 pb-12 text-center">
            <CheckCircle className="h-16 w-16 text-green-500 mx-auto mb-6" />
            <h1 className="text-4xl font-bold mb-4">Message Sent!</h1>
            <p className="text-lg text-muted-foreground mb-8">
              Thank you for contacting us. We've received your message and will get back to you as soon as possible.
            </p>
            <p className="text-sm text-muted-foreground mb-8">
              A confirmation email has been sent to your email address.
            </p>
            <div className="flex gap-4 justify-center">
              <Button variant="outline" asChild>
                <Link href="/">Return Home</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </PublicPageLayout>
  )
}
