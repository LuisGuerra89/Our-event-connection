/**
 * API Endpoint: Save/Update User Attributes
 * POST/PUT /api/user/attributes
 *
 * Handles saving the detailed user attributes (what the user HAS)
 * with proper validation, error handling, and RLS enforcement
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { DetailedUserAttributesDTO } from "@/lib/types/detailed-profile";

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

    // Parse and validate request body
    const body = await request.json();
    const validatedData = DetailedUserAttributesDTO.parse(body);

    // Update profile with questionnaire status
    if (validatedData.questionnaireCompleted !== undefined || validatedData.questionnaireSkipped !== undefined) {
      const profileUpdate: any = {};
      
      if (validatedData.questionnaireCompleted !== undefined) {
        profileUpdate.questionnaire_completed = validatedData.questionnaireCompleted;
        if (validatedData.questionnaireCompleted) {
          profileUpdate.questionnaire_completed_at = new Date().toISOString();
        }
      }
      
      if (validatedData.questionnaireSkipped !== undefined) {
        profileUpdate.questionnaire_skipped = validatedData.questionnaireSkipped;
        if (validatedData.questionnaireSkipped) {
          profileUpdate.questionnaire_skipped_at = new Date().toISOString();
        }
      }
      
      const { error: profileError } = await supabase
        .from("profiles")
        .update(profileUpdate)
        .eq("id", user.id);

      if (profileError) {
        console.error("Profile update error:", profileError);
        return NextResponse.json(
          { error: "Failed to update profile status", details: profileError.message },
          { status: 500 }
        );
      }
    }

    // Flatten the nested attributes for database insert
    const dbPayload = {
      user_id: user.id,
      
      // Physical attributes
      hair_length: validatedData.physical?.hairLength,
      hair_color: validatedData.physical?.hairColor,
      forehead_type: validatedData.physical?.foreheadType,
      eye_shape: validatedData.physical?.eyeShape,
      eye_color: validatedData.physical?.eyeColor,
      nose_type: validatedData.physical?.noseShape,
      cheekbones: validatedData.physical?.cheekbones,
      lips_type: validatedData.physical?.lipsType,
      complexion: validatedData.physical?.complexion,
      body_type: validatedData.physical?.bodyType,
      hand_size: validatedData.physical?.handSize,
      breast_size: validatedData.physical?.breastSize,
      penis_size: validatedData.physical?.penisSize,
      butt_size: validatedData.physical?.buttocks,
      legs_type: validatedData.physical?.legs,
      shoe_size: validatedData.physical?.shoeSize,
      race: validatedData.physical?.race,
      tattoo_status: validatedData.physical?.tattooStatus,
      tattoo_locations: validatedData.physical?.tattooLocations,
      tattoo_details: validatedData.physical?.tattooDetails,
      height: validatedData.physical?.height,
      
      // Lifestyle attributes
      religion: validatedData.lifestyle?.religion,
      sports_hobbies: validatedData.lifestyle?.hobbies,
      makeup_spending_frequency: validatedData.lifestyle?.makeupSpendingFrequency,
      likes_massage: validatedData.lifestyle?.likesMassage,
      nails_done_frequency: validatedData.lifestyle?.nailsDoneFrequency,
      facial_frequency: validatedData.lifestyle?.facialFrequency,
      workout_frequency: validatedData.lifestyle?.workoutFrequency,
      gym_type: validatedData.lifestyle?.gymType,
      sexually_active_frequency: validatedData.lifestyle?.sexuallyActiveFrequency,
      alcohol_consumption_frequency: validatedData.lifestyle?.alcoholConsumptionFrequency,
      nightclub_bar_frequency: validatedData.lifestyle?.nightclubBarFrequency,
      likes_outdoors: validatedData.lifestyle?.likesOutdoors,
      favorite_color: validatedData.lifestyle?.favoriteColor,
      favorite_foods: validatedData.lifestyle?.favoriteFoods,
      dress_code_preference: validatedData.lifestyle?.dressCodePreference,
      
      // Demographics
      marital_status: validatedData.demographics?.maritalStatus,
      kids_count: validatedData.demographics?.kidsCount,
      kids_boys: validatedData.demographics?.kidsBoys,
      kids_girls: validatedData.demographics?.kidsGirls,
      occupation: validatedData.demographics?.occupation,
      owns_business: validatedData.demographics?.ownsBusinessFlag,
      business_type: validatedData.demographics?.businessType,
      
      // Housing
      housing_status: validatedData.housing?.housingStatus,
      home_purchase_date: validatedData.housing?.homePurchaseDate,
      interested_in_remodel: validatedData.housing?.interestedInRemodel,
      interested_in_adu: validatedData.housing?.interestedInAdu,
      interested_in_refinance: validatedData.housing?.interestedInRefinance,
      
      // Preferences
      relationship_type: validatedData.relationshipType,
      event_categories_liked: validatedData.eventCategoriesLiked,
      questionnaire_completed: validatedData.questionnaireCompleted,
      questionnaire_completed_at: validatedData.questionnaireCompletedAt,
      updated_at: new Date().toISOString(),
    };

    // Upsert user attributes
    const { data, error } = await supabase
      .from("user_attributes")
      .upsert(dbPayload, { onConflict: "user_id" })
      .select()
      .single();

    if (error) {
      console.error("Supabase error:", error);
      return NextResponse.json(
        { error: "Failed to save attributes", details: error.message },
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
