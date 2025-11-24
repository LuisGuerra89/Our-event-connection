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

        const serviceClient = getServiceClient()
        const { error: deleteError } = await serviceClient.auth.admin.deleteUser(user.id)

        if (deleteError) {
            console.error("[DELETE ACCOUNT] Error deleting user:", deleteError)
            return NextResponse.json(
                { error: "Failed to delete account", details: deleteError.message },
                { status: 500 }
            )
        }

        console.log("[DELETE ACCOUNT] Successfully deleted user:", user.id)

        // Step 4: Sign out the user
        await supabase.auth.signOut()

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
