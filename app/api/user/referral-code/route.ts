import { createServerClient } from "@/lib/supabase/server"
import { NextRequest, NextResponse } from "next/server"

/**
 * GET /api/user/referral-code
 * 
 * Returns current user's referral code and stats
 */
export async function GET(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Fetch user's referral code and count
    const { data: profile, error: profileError } = await supabase
      .from("profiles")
      .select("referral_code, referral_count, free_events_earned")
      .eq("id", user.id)
      .single()
    
    if (profileError || !profile) {
      return NextResponse.json(
        { error: "Profile not found" },
        { status: 404 }
      )
    }
    
    // Get count of referrals that earned rewards
    const { data: rewards, error: rewardsError } = await supabase
      .from("referrals")
      .select("id", { count: "exact" })
      .eq("referrer_id", user.id)
      .eq("reward_given", true)
    
    const rewardsEarned = rewards?.length || 0
    
    // Calculate progress to next reward (every 25 referrals)
    const nextRewardAt = Math.ceil((profile.referral_count + 1) / 25) * 25
    const progressToNextReward = ((profile.referral_count % 25) + 1)
    
    return NextResponse.json({
      referral_code: profile.referral_code,
      referral_count: profile.referral_count,
      free_events_earned: profile.free_events_earned,
      rewards_earned_count: rewardsEarned,
      progress_to_next_reward: progressToNextReward,
      next_reward_at: nextRewardAt,
      sharing_url: `${process.env.NEXT_PUBLIC_APP_URL || ""}/auth/sign-up?ref=${profile.referral_code}`
    })
    
  } catch (error) {
    console.error("[API] Error fetching referral code:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}

/**
 * GET /api/user/referrals
 * 
 * Returns list of users referred by current user
 */
export async function POST(request: NextRequest) {
  try {
    const supabase = await createServerClient()
    
    // Get current user
    const { data: { user }, error: authError } = await supabase.auth.getUser()
    
    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }
    
    // Get all referrals for this user
    const { data: referrals, error: referralsError } = await supabase
      .from("referrals")
      .select(`
        id,
        referred_id,
        referral_date,
        status,
        reward_given,
        profiles:referred_id(full_name, email, created_at)
      `)
      .eq("referrer_id", user.id)
      .order("referral_date", { ascending: false })
    
    if (referralsError) {
      return NextResponse.json(
        { error: "Failed to fetch referrals" },
        { status: 500 }
      )
    }
    
    return NextResponse.json({
      total_referrals: referrals?.length || 0,
      referrals: referrals || []
    })
    
  } catch (error) {
    console.error("[API] Error fetching referrals:", error)
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    )
  }
}
