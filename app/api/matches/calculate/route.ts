/**
 * API Endpoint: Calculate Matches
 * POST /api/matches/calculate
 *
 * Calculates match scores for current user against all potential matches
 * and stores results in the matches table
 */

import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import { NextRequest, NextResponse } from "next/server";
import { calculateMatchScore } from "@/lib/matchmaking/algorithm";

interface CalculateMatchesRequest {
  limit?: number; // How many top matches to return
  minScore?: number; // Only return matches above this threshold
}

interface Match {
  matchedUserId: string;
  matchScore: number;
  percentageMatch: number;
  matchedUserName?: string;
  matchedUserAge?: number;
}

/**
 * POST /api/matches/calculate
 * Calculate and store match scores for current user
 */
export async function POST(request: NextRequest) {
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
              // Ignore
            }
          },
        },
      }
    );

    // Authenticate user
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

    const body: CalculateMatchesRequest = await request.json();
    const limit = body.limit || 50;
    // CHANGED: For incomplete profiles, be more permissive with minScore
    // minScore of 30 is too high for users with minimal preferences
    let minScore = body.minScore || 30;

    // Get current user's preferences
    const { data: userPreferences, error: prefError } = await supabase
      .from("user_preferences")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (prefError || !userPreferences) {
      return NextResponse.json(
        { error: "User preferences not found. Please complete profile." },
        { status: 400 }
      );
    }

    // Check how complete the user's profile is
    // Count non-null importance values to determine profile completion
    const importanceFields = [
      "hair_color_importance",
      "hair_length_importance",
      "eye_color_importance",
      "body_type_importance",
      "complexion_importance",
      "race_importance",
      "tattoo_importance",
      "height_importance",
      "religion_importance",
      "workout_importance",
      "alcohol_importance",
      "nightclub_importance",
      "marital_status_importance",
      "kids_importance",
      "age_importance",
    ] as const;

    const filledPreferencesCount = importanceFields.filter(
      (field) => userPreferences[field as keyof typeof userPreferences] && 
                 userPreferences[field as keyof typeof userPreferences] !== "open_to_all"
    ).length;

    // If profile is very incomplete (less than 2 non-open preferences), be lenient
    if (filledPreferencesCount <= 2) {
      minScore = 0; // Show all matches for incomplete profiles
      console.log(`Profile very incomplete (${filledPreferencesCount} preferences). Using minScore = 0`);
    } else if (filledPreferencesCount <= 5) {
      minScore = Math.min(minScore, 20); // More lenient for somewhat complete profiles
      console.log(`Profile somewhat incomplete (${filledPreferencesCount} preferences). Using minScore = ${minScore}`);
    }

    // Get current user's attributes
    const { data: userAttributes, error: attrError } = await supabase
      .from("user_attributes")
      .select("*")
      .eq("user_id", user.id)
      .single();

    if (attrError || !userAttributes) {
      return NextResponse.json(
        { error: "User attributes not found. Please complete profile." },
        { status: 400 }
      );
    }

    // Get current user's profile for location data
    const { data: currentUserProfile, error: currentProfileError } = await supabase
      .from("profiles")
      .select("location_city, location_state, location_country")
      .eq("id", user.id)
      .single();

    if (currentProfileError) {
      console.warn("Could not fetch current user profile for location filtering");
    }

    const maxTravelDistance = userPreferences.max_travel_distance_miles || 50;

    // Get all potential matches (other users)
    const { data: profiles, error: profilesError } = await supabase
      .from("profiles")
      .select(
        `
        id,
        email,
        full_name,
        date_of_birth,
        gender,
        location_city,
        location_state,
        location_country,
        user_attributes(*)
      `
      )
      .neq("id", user.id)
      .limit(500); // Get enough to filter

    if (profilesError || !profiles) {
      return NextResponse.json(
        { error: "Failed to fetch potential matches" },
        { status: 500 }
      );
    }

    const matches: Match[] = [];

    console.log(`=== MATCH CALCULATION FOR USER ${user.id} ===`);
    console.log(`Profile completion: ${filledPreferencesCount} non-open preferences`);
    console.log(`Using minScore: ${minScore}`);
    console.log(`Total potential matches to evaluate: ${profiles.length}`);
    console.log(`Max travel distance: ${maxTravelDistance} miles`);

    // Helper function to check if location is within travel distance
    // Simple implementation: check if same state (for now)
    // TODO: Implement proper distance calculation with geocoding
    const isWithinTravelDistance = (profileLocation: any): boolean => {
      // If no current user location, allow all matches (user might not have set location)
      if (!currentUserProfile?.location_state) {
        console.log("No current user location - allowing all matches");
        return true;
      }

      // If no profile location, allow it (don't exclude - data might be incomplete)
      if (!profileLocation?.location_state) {
        return true;
      }

      // If max distance is 1000+, allow any location (anywhere)
      if (maxTravelDistance >= 1000) {
        return true;
      }

      // For distances < 1000 miles, require same state for now
      // TODO: Implement actual distance calculation using coordinates
      const sameState = currentUserProfile.location_state === profileLocation.location_state;
      
      // If same state, check city if available and distance is small
      if (sameState) {
        // If very short distance (< 50 miles), might want same city
        if (maxTravelDistance < 50 && currentUserProfile.location_city && profileLocation.location_city) {
          return currentUserProfile.location_city === profileLocation.location_city;
        }
        return true; // Same state is acceptable for 50+ miles
      }

      return false; // Different state and < 1000 miles
    };

    // Calculate match score for each potential match
    for (const profile of profiles) {
      // Filter by travel distance first
      if (!isWithinTravelDistance({
        location_city: (profile as any).location_city,
        location_state: (profile as any).location_state,
        location_country: (profile as any).location_country,
      })) {
        continue; // Skip this user, too far away
      }

      // Get attributes for this user
      const userAttrs = (profile as any).user_attributes;
      if (!userAttrs) continue;

      try {
        const matchDetail = calculateMatchScore(
          {
            id: user.id,
            preferences: {
              // Physical
              hairColorImportance: userPreferences.hair_color_importance,
              hairColorPreference: userPreferences.hair_color_preference,
              hairLengthImportance: userPreferences.hair_length_importance,
              hairLengthPreference: userPreferences.hair_length_preference,
              eyeColorImportance: userPreferences.eye_color_importance,
              eyeColorPreference: userPreferences.eye_color_preference,
              bodyTypeImportance: userPreferences.body_type_importance,
              bodyTypePreference: userPreferences.body_type_preference,
              complexionImportance: userPreferences.complexion_importance,
              complexionPreference: userPreferences.complexion_preference,
              raceImportance: userPreferences.race_importance,
              racePreference: userPreferences.race_preference,
              tattooImportance: userPreferences.tattoo_importance,
              tattooPreference: userPreferences.tattoo_preference,
              heightImportance: userPreferences.height_importance,
              heightMin: userPreferences.height_min,
              heightMax: userPreferences.height_max,
              breastSizeImportance: userPreferences.breast_size_importance,
              breastSizePreference: userPreferences.breast_size_preference,
              penisSizeImportance: userPreferences.penis_size_importance,
              penisSizePreference: userPreferences.penis_size_preference,
              
              // Lifestyle
              religionImportance: userPreferences.religion_importance,
              religionPreference: userPreferences.religion_preference,
              workoutImportance: userPreferences.workout_importance,
              workoutFrequencyPreference: userPreferences.workout_frequency_preference,
              gymTypePreference: userPreferences.gym_type_preference,
              alcoholImportance: userPreferences.alcohol_importance,
              alcoholPreference: userPreferences.alcohol_preference,
              nightclubImportance: userPreferences.nightclub_importance,
              nightclubPreference: userPreferences.nightclub_preference,
              sexuallyActiveImportance: userPreferences.sexually_active_importance,
              sexuallyActivePreference: userPreferences.sexually_active_preference,
              outdoorsImportance: userPreferences.outdoors_importance,
              outdoorsPreference: userPreferences.outdoors_preference,
              
              // Demographics
              maritalStatusImportance: userPreferences.marital_status_importance,
              maritalStatusPreference: userPreferences.marital_status_preference,
              kidsImportance: userPreferences.kids_importance,
              kidsPreference: userPreferences.kids_preference,
              occupationImportance: userPreferences.occupation_importance,
              occupationPreference: userPreferences.occupation_preference,
              businessOwnerImportance: userPreferences.business_owner_importance,
              wantsBusinessOwnerPartner: userPreferences.wants_business_owner_partner,
              
              // General
              relationshipTypeImportance: userPreferences.relationship_type_importance,
              relationshipTypePreference: userPreferences.relationship_type_preference,
              ageImportance: userPreferences.age_importance,
              ageMin: userPreferences.age_min,
              ageMax: userPreferences.age_max,
            },
          },
          {
            id: profile.id,
            attributes: {
              hairColor: userAttrs.hair_color,
              hairLength: userAttrs.hair_length,
              eyeColor: userAttrs.eye_color,
              bodyType: userAttrs.body_type,
              complexion: userAttrs.complexion,
              race: userAttrs.race,
              tattooStatus: userAttrs.tattoo_status,
              height: userAttrs.height,
              breastSize: userAttrs.breast_size,
              penisSize: userAttrs.penis_size,
              dateOfBirth: userAttrs.date_of_birth ? new Date(userAttrs.date_of_birth) : undefined,
              religion: userAttrs.religion,
              workoutFrequency: userAttrs.workout_frequency,
              gymType: userAttrs.gym_type,
              alcoholConsumption: userAttrs.alcohol_consumption_frequency,
              nightclubFrequency: userAttrs.nightclub_bar_frequency,
              sexuallyActiveFrequency: userAttrs.sexually_active_frequency,
              likesOutdoors: userAttrs.likes_outdoors,
              maritalStatus: userAttrs.marital_status,
              kidsCount: userAttrs.kids_count,
              occupation: userAttrs.occupation,
              ownsBusinessFlag: userAttrs.owns_business,
              relationshipType: userAttrs.relationship_type,
            },
          }
        );

        // Only include if score meets threshold
        if (matchDetail.percentageMatch >= minScore) {
          matches.push({
            matchedUserId: profile.id,
            matchScore: matchDetail.totalScore,
            percentageMatch: matchDetail.percentageMatch,
            matchedUserName: (profile as any).full_name,
            matchedUserAge: profile.date_of_birth
              ? new Date().getFullYear() - new Date((profile as any).date_of_birth).getFullYear()
              : undefined,
          });
        }
      } catch (error) {
        console.error(`Error calculating match for user ${profile.id}:`, error);
        continue;
      }
    }

    // Sort by match score descending
    matches.sort((a, b) => b.percentageMatch - a.percentageMatch);

    // Take top N matches
    const topMatches = matches.slice(0, limit);

    // Store in database (upsert)
    const matchRecords = topMatches.map((match) => ({
      user_id: user.id,
      matched_user_id: match.matchedUserId,
      match_score: match.percentageMatch,
    }));

    // Delete old matches for this user first
    await supabase
      .from("matches")
      .delete()
      .eq("user_id", user.id);

    // Insert new matches
    if (matchRecords.length > 0) {
      const { error: insertError } = await supabase
        .from("matches")
        .insert(matchRecords);

      if (insertError) {
        console.error("Error storing matches:", insertError);
        return NextResponse.json(
          { error: "Failed to store match results" },
          { status: 500 }
        );
      }
    }

    return NextResponse.json(
      {
        success: true,
        totalMatches: matches.length,
        topMatches,
        message: `Found ${matches.length} potential matches (showing top ${topMatches.length})`,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}

/**
 * GET /api/matches/calculate
 * Get stored match results for current user
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
              // Ignore
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

    // Get URL parameters
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get("limit") ?? "50");
    const minScore = parseInt(searchParams.get("minScore") ?? "0");

    // Query matches for this user
    const { data: matches, error } = await supabase
      .from("matches")
      .select(
        `
        id,
        matched_user_id,
        match_score,
        matched_user:profiles(full_name, date_of_birth)
      `
      )
      .eq("user_id", user.id)
      .gte("match_score", minScore)
      .order("match_score", { ascending: false })
      .limit(limit);

    if (error) {
      return NextResponse.json(
        { error: "Failed to fetch matches" },
        { status: 500 }
      );
    }

    return NextResponse.json({ matches }, { status: 200 });
  } catch (error) {
    console.error("API error:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Internal server error" },
      { status: 500 }
    );
  }
}
