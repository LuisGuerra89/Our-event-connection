'use client'

import { useSearchParams } from "next/navigation"
import { SignUpForm } from "./sign-up-form"

export function SignUpContent() {
  const searchParams = useSearchParams()
  const referralCode = searchParams?.get("ref") || ""

  return <SignUpForm initialReferralCode={referralCode} />
}
