import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Mail } from "lucide-react"

export default function VerifyEmailPage() {
  return (
    <div className="flex min-h-svh w-full items-center justify-center p-6">
      <div className="w-full max-w-sm">
        <Card>
          <CardHeader>
            <div className="flex justify-center mb-4">
              <div className="rounded-full bg-primary/10 p-3">
                <Mail className="h-6 w-6 text-primary" />
              </div>
            </div>
            <CardTitle className="text-2xl text-center">Check Your Email</CardTitle>
            <CardDescription className="text-center">We&apos;ve sent you a verification link</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-muted-foreground text-center">
                Please check your email and click the verification link to activate your account. After verification,
                you&apos;ll be redirected to complete your profile and sign the liability waiver.
              </p>

              <div className="pt-4 border-t">
                <p className="text-xs text-muted-foreground text-center mb-2">
                  <strong>Not receiving emails?</strong>
                </p>
                <ul className="text-xs text-muted-foreground space-y-1 list-disc list-inside">
                  <li>Check your spam/junk folder</li>
                  <li>Verify your email address is correct</li>
                  <li>Wait a few minutes and refresh your inbox</li>
                </ul>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
