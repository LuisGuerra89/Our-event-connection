"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { CheckCircle, AlertCircle } from "lucide-react"

interface QuestionnaireStatusProps {
  questionnaireCompleted?: boolean
}

export function QuestionnaireStatus({ questionnaireCompleted }: QuestionnaireStatusProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          {questionnaireCompleted ? (
            <>
              <CheckCircle className="h-5 w-5 text-green-600" />
              Profile Complete 🎉
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Complete Your Profile
            </>
          )}
        </CardTitle>
        <CardDescription>
          {questionnaireCompleted
            ? "You can update your preferences anytime to find even better matches."
            : "Tell us more about yourself and what you're looking for to get personalized matches!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/onboarding/complete-profile">
            {questionnaireCompleted ? "Update My Profile" : "Complete My Profile"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
