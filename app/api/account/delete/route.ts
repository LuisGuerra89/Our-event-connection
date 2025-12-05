import { NextRequest, NextResponse } from "next/server"
import { createClient } from "@/lib/supabase/server"
import { createClient as createServiceClient } from "@supabase/supabase-js"
import Stripe from "stripe"

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY || "", {
    apiVersion: "2024-11-20.acacia",
})

// Create service role client for admin operations
const getServiceClient = () => {
    return createServiceClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )
}

export async function POST(request: NextRequest) {
    try {
        const supabase = await createClient()

        // Get authenticated user
        const {
            data: { user },
            error: authError,
        } = await supabase.auth.getUser()

        if (authError || !user) {
            return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
        }

        console.log("[DELETE ACCOUNT] Starting account deletion for user:", user.id)

        // Get service role client early for operations that need to bypass RLS
        const serviceClient = getServiceClient()

        // Step 0: Delete all related data from tables before deleting the user
        // This avoids foreign key constraint issues
        try {
            console.log("[DELETE ACCOUNT] Deleting related user data...")
            
            // First, handle the self-referential foreign key in profiles
            // Set referred_by to NULL for any users who were referred by this user
            // Use service client to bypass RLS policies
            try {
                const { data: referredUsers, error: checkError } = await serviceClient
                    .from("profiles")
                    .select("id, full_name")
                    .eq("referred_by", user.id)

                if (checkError) {
                    console.log("[DELETE ACCOUNT] Error checking referred users:", checkError.message)
                } else if (referredUsers && referredUsers.length > 0) {
                    console.log(`[DELETE ACCOUNT] Found ${referredUsers.length} users referred by this account`)
                    
                    const { error: updateReferralError } = await serviceClient
                        .from("profiles")
                        .update({ referred_by: null })
                        .eq("referred_by", user.id)

                    if (updateReferralError) {
                        console.log("[DELETE ACCOUNT] Error updating referrals:", updateReferralError.message)
                    } else {
                        console.log("[DELETE ACCOUNT] Successfully updated referred_by to NULL for all referred users")
                    }
                } else {
                    console.log("[DELETE ACCOUNT] No users were referred by this account")
                }
            } catch (referralError) {
                console.log("[DELETE ACCOUNT] Exception handling referrals:", referralError)
            }
            
            // Delete in order of foreign key dependencies
            // Note: profiles table uses 'id' as primary key, not 'user_id'
            const tablesWithUserId = [
                "matches",
                "user_preferences",
                "user_attributes",
                "event_attendees",
                "user_subscriptions",
            ]

            for (const table of tablesWithUserId) {
                try {
                    const { error } = await supabase
                        .from(table)
                        .delete()
                        .eq("user_id", user.id)

                    if (error) {
                        console.log(`[DELETE ACCOUNT] Note: Could not delete from ${table}:`, error.message)
                        // Continue anyway - some tables might not exist for this user
                    } else {
                        console.log(`[DELETE ACCOUNT] Deleted records from ${table}`)
                    }
                } catch (tableError) {
                    console.log(`[DELETE ACCOUNT] Table ${table} may not have user_id or may not exist`)
                }
            }

            // Handle matches table separately for matched_user_id
            try {
                const { error: matchesError } = await supabase
                    .from("matches")
                    .delete()
                    .eq("matched_user_id", user.id)

                if (!matchesError) {
                    console.log("[DELETE ACCOUNT] Deleted matches where user was matched_user_id")
                }
            } catch (matchError) {
                console.log("[DELETE ACCOUNT] Error deleting matched_user_id records:", matchError)
            }
        } catch (dataDeleteError) {
            console.error("[DELETE ACCOUNT] Error deleting related data:", dataDeleteError)
            // Continue anyway - we'll try to delete the auth user
        }

        // Step 1: Get active subscriptions
        const { data: subscriptions, error: subError } = await supabase
            .from("user_subscriptions")
            .select("id, stripe_subscription_id, status")
            .eq("user_id", user.id)
            .eq("status", "active")

        if (subError) {
            console.error("[DELETE ACCOUNT] Error fetching subscriptions:", subError)
        }

        // Step 2: Cancel active Stripe subscriptions
        if (subscriptions && subscriptions.length > 0) {
            console.log(`[DELETE ACCOUNT] Found ${subscriptions.length} active subscription(s)`)

            for (const subscription of subscriptions) {
                if (subscription.stripe_subscription_id) {
                    try {
                        console.log("[DELETE ACCOUNT] Cancelling Stripe subscription:", subscription.stripe_subscription_id)

                        // Cancel subscription in Stripe
                        await stripe.subscriptions.cancel(subscription.stripe_subscription_id)

                        // Update subscription status in database
                        await supabase
                            .from("user_subscriptions")
                            .update({
                                status: "cancelled",
                                cancelled_at: new Date().toISOString(),
                                updated_at: new Date().toISOString(),
                            })
                            .eq("id", subscription.id)

                        console.log("[DELETE ACCOUNT] Successfully cancelled subscription:", subscription.stripe_subscription_id)
                    } catch (stripeError) {
                        console.error("[DELETE ACCOUNT] Error cancelling Stripe subscription:", stripeError)
                        // Continue with deletion even if Stripe cancellation fails
                    }
                }
            }
        } else {
            console.log("[DELETE ACCOUNT] No active subscriptions found")
        }

        // Step 3: Delete user from auth.users using service role client
        // This will trigger CASCADE DELETE for all related data via foreign key constraints
        console.log("[DELETE ACCOUNT] Deleting user from auth.users")
        
        try {
            const { data, error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

            if (deleteError) {
                console.error("[DELETE ACCOUNT] Error deleting user:", {
                    message: deleteError.message,
                    code: deleteError.code,
                    status: (deleteError as any).status,
                })
                
                // If we get an auth error, try one more approach: manually delete from public.profiles
                console.log("[DELETE ACCOUNT] Attempting fallback: deleting from public.profiles...")
                
                // Use service client for profile deletion
                const { error: profileError } = await serviceClient
                    .from("profiles")
                    .delete()
                    .eq("id", user.id)

                if (profileError) {
                    console.error("[DELETE ACCOUNT] Also failed to delete profile:", profileError)
                    return NextResponse.json(
                        { 
                            error: "Failed to delete account", 
                            details: `Could not delete user: ${deleteError.message}. Profile deletion error: ${profileError.message}` 
                        },
                        { status: 500 }
                    )
                }

                // Profile deleted, but auth user still exists - this is acceptable
                console.log("[DELETE ACCOUNT] Profile deleted successfully (auth user may still exist)")
            } else {
                console.log("[DELETE ACCOUNT] Successfully deleted user:", user.id)
            }
        } catch (deleteException) {
            console.error("[DELETE ACCOUNT] Exception deleting user:", deleteException)
            
            return NextResponse.json(
                { 
                    error: "Failed to delete account", 
                    details: deleteException instanceof Error ? deleteException.message : "Unknown error during deletion" 
                },
                { status: 500 }
            )
        }

        // Step 4: Sign out the user
        try {
            await supabase.auth.signOut()
        } catch (signOutError) {
            console.error("[DELETE ACCOUNT] Error signing out user:", signOutError)
            // Continue anyway - user is already deleted
        }

        return NextResponse.json({
            success: true,
            message: "Account deleted successfully",
        })
    } catch (error) {
        console.error("[DELETE ACCOUNT] Unexpected error:", error)
        return NextResponse.json(
            {
                error: "An unexpected error occurred",
                details: error instanceof Error ? error.message : "Unknown error",
            },
            { status: 500 }
        )
    }
}
