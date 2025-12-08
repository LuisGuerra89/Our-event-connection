'use client'

import { Suspense } from 'react'
import { AdminResetPasswordForm } from './admin-reset-password-form'
import { Card, CardHeader, CardTitle } from "@/components/ui/card"

export default function AdminResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen items-center justify-center bg-background p-4">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle className="text-2xl text-center">Loading...</CardTitle>
          </CardHeader>
        </Card>
      </div>
    }>
      <AdminResetPasswordForm />
    </Suspense>
  )
}
