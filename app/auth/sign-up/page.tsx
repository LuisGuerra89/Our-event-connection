'use client'

import { Suspense } from 'react'
import { SignUpContent } from './sign-up-content'

export default function SignUpPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-svh w-full items-center justify-center">
        <div className="text-center">Loading...</div>
      </div>
    }>
      <SignUpContent />
    </Suspense>
  )
}
