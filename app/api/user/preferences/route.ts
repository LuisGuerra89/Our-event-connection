/**
 * API Endpoint: Save/Update User Preferences
 * POST/PUT /api/user/preferences
 *
 * Handles saving the detailed user preferences (what the user SEEKS)
 * with proper handling of "OPEN_TO_ALL" preference importance
 * 
 * Accepts flexible format from onboarding wizard phases
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";

/**
 * Convert camelCase keys to snake_case for database
 */
function toSnakeCase(str: string): string {
  return str.replace(/[A-Z]/g, letter => `_${letter.toLowerCase()}`);
}

/**
 * Mapeo de campos especiales que no siguen la convención estándar
 */
const fieldNameMapping: Record<string, string> = {
  // Phase 5 mappings
  workoutPreference: 'workout_frequency_preference',
  workoutImportance: 'workout_importance',
  
  // Otros campos que no siguen convención
  foodPreference: 'food_preference',
};

/**
 * Flatten nested preference object and convert keys to snake_case
 */
function flattenPreferences(data: any): Record<string, any> {
  const flat: Record<string, any> = {};
  
  // Handle nested structure (physical, lifestyle, demographics, general)
  for (const [category, values] of Object.entries(data)) {
    if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
      for (const [key, value] of Object.entries(values)) {
        // Check if there's a custom mapping for this field
        const mappedKey = fieldNameMapping[key] || toSnakeCase(key);
        flat[mappedKey] = value;
      }
    } else {
      // Direct key-value
      const snakeKey = fieldNameMapping[category] || toSnakeCase(category);
      flat[snakeKey] = values;
    }
  }
  
  return flat;
}

/**
 * PUT /api/user/preferences
 * Update user preferences for matchmaking
 */
export async function PUT(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore set cookie errors on server-side rendering
            }
          },
        },
      }
    );

    // Get authenticated user
    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    // Parse request body
    const body = await request.json();
    console.log("Received preferences body:", JSON.stringify(body, null, 2));

    // Flatten and convert to snake_case
    const flatPreferences = flattenPreferences(body);
    console.log("Flattened preferences:", JSON.stringify(flatPreferences, null, 2));
    
    // Build db payload with user_id and updated_at
    const dbPayload = {
      user_id: user.id,
      ...flatPreferences,
      updated_at: new Date().toISOString(),
    };
    
    console.log("DB Payload:", JSON.stringify(dbPayload, null, 2));

    // Upsert user preferences (update if exists, insert if not)
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(dbPayload, { 
        onConflict: "user_id",
        ignoreDuplicates: false // Always update
      })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", {
        code: error.code,
        message: error.message,
        details: error.details,
        hint: error.hint,
      });
      return NextResponse.json(
        { 
          error: "Failed to save preferences", 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
        { status: 500 }
      );
    }

    // Recalculate matches after preferences update
    // TODO: This should be called from the client side after preferences are saved
    // Server-side fetch doesn't have proper authentication context
    // try {
    //   await fetch(`${request.nextUrl.origin}/api/matches/calculate`, {
    //     method: "POST",
    //     headers: { "Content-Type": "application/json" },
    //     body: JSON.stringify({ limit: 50, minScore: 30 }),
    //   });
    // } catch (matchError) {
    //   console.error("Error recalculating matches:", matchError);
    //   // Don't fail the request if match calculation fails
    // }

    return NextResponse.json(
      { success: true, data },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 400 }
    );
  }
}

/**
 * GET /api/user/preferences
 * Retrieve current user's preferences
 */
export async function GET(request: NextRequest) {
  try {
    const cookieStore = await cookies();
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll();
          },
          setAll(cookiesToSet) {
            try {
              cookiesToSet.forEach(({ name, value, options }) =>
                cookieStore.set(name, value, options)
              );
            } catch {
              // Ignore set cookie errors
            }
          },
        },
      }
    );

    const {
      data: { user },
      error: authError,
    } = await supabase.auth.getUser();

    if (authError || !user) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      );
    }

    const { data, error } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = not found
      return NextResponse.json(
        { error: "Failed to fetch preferences" },
        { status: 500 }
      );
    }

    return NextResponse.json({ data: data || null }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
