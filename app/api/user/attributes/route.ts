/**
 * API Endpoint: Save/Update User Attributes
 * POST/PUT /api/user/attributes
 *
 * Handles saving the detailed user attributes (what the user HAS)
 * Accepts flexible format from onboarding wizard phases
 * Automatically converts camelCase to snake_case
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
 * Field name mapping for special cases
 */
const fieldNameMapping: Record<string, string> = {
  // Phase 6 - Physical attributes
  forehead: 'forehead_type',
  cheekbones: 'cheekbones',
  nose: 'nose',
  lips: 'lips',
  handSize: 'hand_size',
  buttocks: 'buttocks',
  legs: 'legs',
  shoeSize: 'shoe_size',
  breastSize: 'breast_size',
  penisSize: 'penis_size',
  hasTattoos: 'tattoo_status',
  tattooStatus: 'tattoo_status',
  tattooLocations: 'tattoo_locations',
  tattooDetails: 'tattoo_details',
  
  // Phase 7 - Personal & Professional Info
  maritalStatus: 'marital_status',
  hasKids: 'has_kids',
  kidsBoys: 'kids_boys',
  kidsGirls: 'kids_girls',
  ownsBusiness: 'owns_business',
  businessType: 'business_type',
  housingStatus: 'housing_status',
  lookingForRoommate: 'looking_for_roommate',
  
  // Phase 8 - Lifestyle & Personal Care Preferences
  makeupSpendingFrequency: 'makeup_spending_frequency',
  likesMassage: 'likes_massage',
  nailsDoneFrequency: 'nails_done_frequency',
  nailsFrequencyImportance: 'nails_done_frequency',
  facialFrequency: 'facial_frequency',
  facialFrequencyImportance: 'facial_frequency',
  relationshipTypeSeeking: 'relationship_type_seeking',
  favoriteColor: 'favorite_color',
  dressCodePreference: 'dress_code_preference',
  
  // Other questionnaire fields
  workoutFrequency: 'workout_frequency',
  gymType: 'gym_type',
  sexuallyActiveFrequency: 'sexually_active_frequency',
  alcoholConsumptionFrequency: 'alcohol_consumption_frequency',
  nightclubBarFrequency: 'nightclub_bar_frequency',
  likesOutdoors: 'likes_outdoors',
  kidsCount: 'kids_count',
  occupation: 'occupation',
  business_owner_importance: 'business_owner_importance',
  wants_business_owner_partner: 'wants_business_owner_partner',
  homePurchaseDate: 'home_purchase_date',
  interestedInRemodel: 'interested_in_remodel',
  interestedInAdu: 'interested_in_adu',
  interestedInRefinance: 'interested_in_refinance',
  favoriteFoods: 'favorite_foods',
  relationshipType: 'relationship_type',
  eventCategoriesLiked: 'event_categories_liked',
  questionnaireCompleted: 'questionnaire_completed',
  questionnaireCompletedAt: 'questionnaire_completed_at',
  questionnaireSkipped: 'questionnaire_skipped',
  questionnaireSkippedAt: 'questionnaire_skipped_at',
  foreheadType: 'forehead_type',
  hairLength: 'hair_length',
  hairColor: 'hair_color',
  eyeColor: 'eye_color',
  eyeShape: 'eye_shape',
};

/**
 * Flatten nested attributes and convert to snake_case
 * Only includes fields that have non-null values
 */
function flattenAttributes(data: any): Record<string, any> {
  const flat: Record<string, any> = {};
  
  // Handle nested structure (physical, personal, professional, etc.)
  for (const [category, values] of Object.entries(data)) {
    if (typeof values === 'object' && values !== null && !Array.isArray(values)) {
      for (const [key, value] of Object.entries(values)) {
        // Only include if value is not null/undefined
        if (value !== null && value !== undefined && value !== '') {
          const mappedKey = fieldNameMapping[key] || toSnakeCase(key);
          flat[mappedKey] = value;
        }
      }
    } else if (values !== null && values !== undefined && values !== '') {
      // Direct key-value
      const snakeKey = fieldNameMapping[category] || toSnakeCase(category);
      flat[snakeKey] = values;
    }
  }
  
  return flat;
}

/**
 * PUT /api/user/attributes
 * Update user attributes with detailed questionnaire data
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
    console.log("Received attributes body:", JSON.stringify(body, null, 2));
    
    // Flatten and convert to snake_case
    const flatAttributes = flattenAttributes(body);
    console.log("Flattened attributes:", JSON.stringify(flatAttributes, null, 2));
    
    // Build db payload with user_id and updated_at
    const dbPayload = {
      user_id: user.id,
      ...flatAttributes,
      updated_at: new Date().toISOString(),
    };
    
    console.log("DB Payload:", JSON.stringify(dbPayload, null, 2));

    // Upsert user attributes (update if exists, insert if not)
    const { data, error } = await supabase
      .from("user_attributes")
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
          error: "Failed to save attributes", 
          details: error.message,
          code: error.code,
          hint: error.hint
        },
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
 * GET /api/user/attributes
 * Retrieve current user's attributes
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
      .from("user_attributes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (error && error.code !== "PGRST116") { // PGRST116 = not found
      return NextResponse.json(
        { error: "Failed to fetch attributes" },
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
