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
              Questionnaire Completed
            </>
          ) : (
            <>
              <AlertCircle className="h-5 w-5 text-yellow-600" />
              Questionnaire Incomplete
            </>
          )}
        </CardTitle>
        <CardDescription>
          {questionnaireCompleted
            ? "You can update your preferences and attributes anytime to get better matches."
            : "Complete the questionnaire to get personalized matches!"}
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Button asChild className="w-full">
          <Link href="/onboarding/complete-profile">
            {questionnaireCompleted ? "Update Questionnaire" : "Complete Questionnaire"}
          </Link>
        </Button>
      </CardContent>
    </Card>
  )
}
