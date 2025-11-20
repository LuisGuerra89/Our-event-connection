import { createClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function POST() {
  try {
    const supabase = await createClient()
    
    const { error } = await supabase.auth.signOut()
    
    if (error) {
      console.error("Sign out error:", error)
      return NextResponse.json({ error: error.message }, { status: 400 })
    }
    
    // Create response and redirect to home
    const response = NextResponse.json({ success: true })
    
    // Clear auth cookies - adjust cookie names based on your Supabase project ID
    response.cookies.delete("sb-ntypvlstidyjrxrtcfyo-auth-token")
    response.cookies.delete("sb-ntypvlstidyjrxrtcfyo-auth-token-code-verifier")
    
    return response
  } catch (err) {
    console.error("Unexpected error during sign out:", err)
    return NextResponse.json({ error: "Sign out failed" }, { status: 500 })
  }
}
