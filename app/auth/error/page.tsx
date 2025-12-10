import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle } from "lucide-react"
import Link from "next/link"
import { Button } from "@/components/ui/button"

export default async function ErrorPage({
  searchParams,
}: {
  searchParams: Promise<{ error?: string; error_code?: string; error_description?: string }>
}) {
  const params = await searchParams

  // Decode error description if present
  let decodedDescription = params?.error_description
  if (decodedDescription) {
    try {
      decodedDescription = decodeURIComponent(decodedDescription)
    } catch (e) {
      // Keep original if decoding fails
    }
  }

  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-md">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-destructive/10 p-3">
                <AlertCircle className="h-6 w-6 text-destructive" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Authentication Error</CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-2">
              {params?.error ? (
                <p className="text-sm text-muted-foreground text-center">
                  Error: {params.error}
                  {decodedDescription && ` - ${decodedDescription}`}
                </p>
              ) : (
                <p className="text-sm text-muted-foreground text-center">
                  An unexpected error occurred during authentication.
                </p>
              )}
            </div>
            
            <div className="space-y-3">
              <Link href="/auth/sign-up" className="block">
                <Button variant="outline" className="w-full">
                  Back to Sign Up
                </Button>
              </Link>
              <Link href="/auth/login" className="block">
                <Button variant="ghost" className="w-full">
                  Back to Sign In
                </Button>
              </Link>
            </div>
            
            <div className="pt-4 border-t">
              <p className="text-xs text-muted-foreground text-center">
                Need help? <Link href="/contact" className="text-primary hover:underline">Contact support</Link>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
