"use client"

import { Suspense } from "react"
import { LoginContent } from "./login-content"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center p-6">
        <div className="w-full max-w-sm">
          <div className="animate-pulse space-y-4">
            <div className="h-10 bg-gray-200 rounded"></div>
            <div className="h-6 bg-gray-200 rounded w-2/3"></div>
            <div className="space-y-3">
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
              <div className="h-10 bg-gray-200 rounded"></div>
            </div>
          </div>
        </div>
      </div>
    }>
      <LoginContent />
    </Suspense>
  )
}
