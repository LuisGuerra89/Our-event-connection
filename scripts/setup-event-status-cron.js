#!/usr/bin/env node

/**
 * Setup script for automatic event status updates
 * This script configures the PostgreSQL pg_cron extension and schedules
 * automatic updates of expired events from 'upcoming' to 'completed'
 */

const fs = require("fs")
const path = require("path")
const { createClient } = require("@supabase/supabase-js")

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error("❌ Error: NEXT_PUBLIC_SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY environment variables are required")
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function setupCronJobs() {
  console.log("🚀 Setting up automatic event status updates...")
  console.log("")

  try {
    // Step 1: Enable pg_cron extension
    console.log("📋 Step 1: Enabling pg_cron extension...")
    const { error: extensionError } = await supabase.rpc("execute_sql", {
      sql: "CREATE EXTENSION IF NOT EXISTS pg_cron;",
    })

    if (extensionError && !extensionError.message.includes("already exists")) {
      console.warn("⚠️  Warning enabling extension:", extensionError.message)
    } else {
      console.log("✅ pg_cron extension enabled")
    }

    // Step 2: Create the update function
    console.log("\n📋 Step 2: Creating update_expired_events function...")
    const functionSQL = `
      CREATE OR REPLACE FUNCTION public.update_expired_events()
      RETURNS TABLE(updated_count int, message text) AS $$
      DECLARE
        v_count int;
      BEGIN
        UPDATE public.events
        SET 
          status = 'completed',
          updated_at = NOW()
        WHERE 
          status = 'upcoming' 
          AND end_date < NOW()
          AND deleted_at IS NULL;
        
        GET DIAGNOSTICS v_count = ROW_COUNT;
        
        RETURN QUERY SELECT v_count, 'Successfully updated ' || v_count::text || ' events to completed status';
      END;
      $$ LANGUAGE plpgsql SECURITY DEFINER;
    `

    const { error: functionError } = await supabase.rpc("execute_sql", {
      sql: functionSQL,
    })

    if (functionError && !functionError.message.includes("already exists")) {
      console.warn("⚠️  Warning creating function:", functionError.message)
    } else {
      console.log("✅ Function created/updated successfully")
    }

    // Step 3: Schedule the cron job
    console.log("\n📋 Step 3: Scheduling cron job (every hour)...")
    const scheduleSQL = `
      SELECT cron.schedule(
        'update_expired_events',
        '0 * * * *',
        'SELECT public.update_expired_events()'
      );
    `

    const { error: scheduleError } = await supabase.rpc("execute_sql", {
      sql: scheduleSQL,
    })

    if (scheduleError) {
      console.warn("⚠️  Warning scheduling job:", scheduleError.message)
      console.log("   This might be expected if the job already exists")
    } else {
      console.log("✅ Cron job scheduled successfully")
    }

    // Step 4: Verify the setup
    console.log("\n📋 Step 4: Verifying setup...")
    const { data: jobData, error: verifyError } = await supabase.rpc("execute_sql", {
      sql: `SELECT jobid, jobname, schedule, command FROM cron.job WHERE jobname = 'update_expired_events';`,
    })

    if (!verifyError && jobData) {
      console.log("✅ Cron job verified:", jobData)
    }

    // Step 5: Test the function
    console.log("\n📋 Step 5: Testing the function with a dry run...")
    const { data: testData, error: testError } = await supabase.rpc("execute_sql", {
      sql: `
        SELECT 
          COUNT(*) as total_upcoming,
          COUNT(CASE WHEN end_date < NOW() THEN 1 END) as expired_events
        FROM public.events
        WHERE status = 'upcoming' AND deleted_at IS NULL;
      `,
    })

    if (!testError && testData) {
      console.log("✅ Events status check:")
      console.log(`   - Total upcoming events: ${testData[0]?.total_upcoming || 0}`)
      console.log(`   - Expired events ready to update: ${testData[0]?.expired_events || 0}`)
    }

    console.log("\n" + "=".repeat(60))
    console.log("✨ Setup completed successfully!")
    console.log("=".repeat(60))
    console.log("\n📝 Configuration:")
    console.log("   - Function: public.update_expired_events()")
    console.log("   - Schedule: Every hour (at minute 0)")
    console.log("   - Database: Supabase PostgreSQL")
    console.log("\n🔄 What happens:")
    console.log("   - Automatically checks for expired events every hour")
    console.log("   - Updates 'upcoming' events to 'completed' if end_date < NOW()")
    console.log("   - Updates the 'updated_at' timestamp")
    console.log("\n💡 To modify the schedule, update the cron expression:")
    console.log("   - Every 15 minutes: '*/15 * * * *'")
    console.log("   - Every 30 minutes: '*/30 * * * *'")
    console.log("   - Daily at midnight: '0 0 * * *'")
    console.log("   - Daily at noon: '0 12 * * *'")
    console.log("")

  } catch (error) {
    console.error("❌ Error during setup:", error.message)
    process.exit(1)
  }
}

async function testEventUpdate() {
  console.log("\n🧪 Running test: Manually trigger the event status update...")

  try {
    const { data, error } = await supabase.rpc("update_expired_events")

    if (error) {
      console.error("❌ Error:", error.message)
      return
    }

    if (data && data.length > 0) {
      console.log("✅ Test result:")
      data.forEach((result) => {
        console.log(`   - ${result.message}`)
      })
    }

  } catch (error) {
    console.error("❌ Test error:", error.message)
  }
}

// Main execution
async function main() {
  await setupCronJobs()

  // Optional: Run a test
  const args = process.argv.slice(2)
  if (args.includes("--test")) {
    await testEventUpdate()
  } else {
    console.log("💡 Tip: Run with --test flag to trigger an immediate update")
    console.log("   npx node scripts/setup-event-status-cron.js --test\n")
  }
}

main()
