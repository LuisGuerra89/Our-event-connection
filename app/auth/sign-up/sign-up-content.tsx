'use client'

import { useSearchParams } from "next/navigation"
import { SignUpForm } from "./sign-up-form"

export function SignUpContent() {
  const searchParams = useSearchParams()
  const referralCode = searchParams?.get("ref") || ""
  const errorCode = searchParams?.get("error_code") || ""
  const errorDescription = searchParams?.get("error_description") || ""

  return <SignUpForm 
    initialReferralCode={referralCode}
    initialErrorCode={errorCode}
    initialErrorDescription={errorDescription}
  />
}
