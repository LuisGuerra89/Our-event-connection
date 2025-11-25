/**
 * API Endpoint: Save/Update User Preferences
 * POST/PUT /api/user/preferences
 *
 * Handles saving the detailed user preferences (what the user SEEKS)
 * with proper handling of "OPEN_TO_ALL" preference importance
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { DetailedUserPreferencesDTO } from "@/lib/types/detailed-profile";

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = DetailedUserPreferencesDTO.parse(body);

    // Flatten the nested preferences for database insert
    const dbPayload = {
      user_id: user.id,
      
      // Physical preferences
      hair_color_importance: validatedData.physical?.hairColorImportance,
      hair_color_preference: validatedData.physical?.hairColorPreference,
      
      hair_length_importance: validatedData.physical?.hairLengthImportance,
      hair_length_preference: validatedData.physical?.hairLengthPreference,
      
      eye_color_importance: validatedData.physical?.eyeColorImportance,
      eye_color_preference: validatedData.physical?.eyeColorPreference,
      
      body_type_importance: validatedData.physical?.bodyTypeImportance,
      body_type_preference: validatedData.physical?.bodyTypePreference,
      
      complexion_importance: validatedData.physical?.complexionImportance,
      complexion_preference: validatedData.physical?.complexionPreference,
      
      race_importance: validatedData.physical?.raceImportance,
      race_preference: validatedData.physical?.racePreference,
      
      tattoo_importance: validatedData.physical?.tattooImportance,
      tattoo_preference: validatedData.physical?.tattooPreference,
      
      height_importance: validatedData.physical?.heightImportance,
      height_min: validatedData.physical?.heightMin,
      height_max: validatedData.physical?.heightMax,
      
      breast_size_importance: validatedData.physical?.breastSizeImportance,
      breast_size_preference: validatedData.physical?.breastSizePreference,
      
      penis_size_importance: validatedData.physical?.penisSizeImportance,
      penis_size_preference: validatedData.physical?.penisSizePreference,
      
      // Lifestyle preferences
      religion_importance: validatedData.lifestyle?.religionImportance,
      religion_preference: validatedData.lifestyle?.religionPreference,
      
      workout_importance: validatedData.lifestyle?.workoutImportance,
      workout_frequency_preference: validatedData.lifestyle?.workoutFrequencyPreference,
      gym_type_preference: validatedData.lifestyle?.gymTypePreference,
      
      alcohol_importance: validatedData.lifestyle?.alcoholImportance,
      alcohol_preference: validatedData.lifestyle?.alcoholPreference,
      
      nightclub_importance: validatedData.lifestyle?.nightclubImportance,
      nightclub_preference: validatedData.lifestyle?.nightclubPreference,
      
      sexually_active_importance: validatedData.lifestyle?.sexuallyActiveImportance,
      sexually_active_preference: validatedData.lifestyle?.sexuallyActivePreference,
      
      outdoors_importance: validatedData.lifestyle?.outdoorsImportance,
      outdoors_preference: validatedData.lifestyle?.outdoorsPreference,
      
      // Demographics preferences
      marital_status_importance: validatedData.demographics?.maritalStatusImportance,
      marital_status_preference: validatedData.demographics?.maritalStatusPreference,
      
      kids_importance: validatedData.demographics?.kidsImportance,
      kids_preference: validatedData.demographics?.kidsPreference,
      
      occupation_importance: validatedData.demographics?.occupationImportance,
      occupation_preference: validatedData.demographics?.occupationPreference,
      
      business_owner_importance: validatedData.demographics?.businessOwnerImportance,
      wants_business_owner_partner: validatedData.demographics?.wantsBusinessOwnerPartner,
      
      // General preferences
      relationship_type_importance: validatedData.general?.relationshipTypeImportance,
      relationship_type_preference: validatedData.general?.relationshipTypePreference,
      
      event_categories_importance: validatedData.general?.eventCategoriesImportance,
      event_categories_preference: validatedData.general?.eventCategoriesPreference,
      
      favorite_color_importance: validatedData.general?.favoriteColorImportance,
      favorite_color_preference: validatedData.general?.favoriteColorPreference,
      
      favorite_food_importance: validatedData.general?.favoriteFoodImportance,
      food_preference: validatedData.general?.favoriteFoodPreference,
      
      dress_code_importance: validatedData.general?.dressCodeImportance,
      dress_code_preference: validatedData.general?.dressCodePreference,
      
      age_importance: validatedData.general?.ageImportance,
      age_min: validatedData.general?.ageMin,
      age_max: validatedData.general?.ageMax,
      
      updated_at: new Date().toISOString(),
    };

    // Upsert user preferences
    const { data, error } = await supabase
      .from("user_preferences")
      .upsert(dbPayload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save preferences", details: error.message },
        { status: 500 }
      );
    }

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
