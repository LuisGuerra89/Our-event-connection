import { createServerClient } from "@/lib/supabase/server"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ userId: string }> }
) {
  try {
    const supabase = await createServerClient()
    const { userId } = await params

    const { data: preferences, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", userId)
      .single()

    if (error) {
      return NextResponse.json({ error: error.message }, { status: 404 })
    }

    return NextResponse.json(preferences)
  } catch (error) {
    return NextResponse.json({ error: "Failed to fetch preferences" }, { status: 500 })
  }
}
