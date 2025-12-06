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
    // CHANGED: Fetch profiles and attributes separately to ensure data integrity
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
        location_country
      `
      )
      .neq("id", user.id)
      .limit(500); // Get enough to filter

    if (profilesError || !profiles) {
      console.error("Error fetching profiles:", profilesError);
      return NextResponse.json(
        { error: "Failed to fetch potential matches" },
        { status: 500 }
      );
    }

    console.log(`Fetched ${profiles.length} potential profiles`);

    // Get attributes for all profiles
    const { data: allAttributes, error: allAttributesError } = await supabase
      .from("user_attributes")
      .select("*");

    if (allAttributesError) {
      console.error("Error fetching attributes:", allAttributesError);
    }

    // Create a map of user_id -> attributes for quick lookup
    const attributesMap = new Map();
    if (allAttributes) {
      allAttributes.forEach((attr: any) => {
        attributesMap.set(attr.user_id, attr);
      });
    }

    console.log(`Fetched attributes for ${attributesMap.size} users`);

    // Merge attributes into profiles
    const profilesWithData = profiles
      .map((profile: any) => ({
        ...profile,
        user_attributes: attributesMap.get(profile.id),
      }))
      .filter((p: any) => p.user_attributes); // Only keep profiles with attributes

    console.log(`Profiles with attributes ready for matching: ${profilesWithData.length}`);

    const matches: Match[] = [];

    console.log(`=== MATCH CALCULATION FOR USER ${user.id} ===`);
    console.log(`Profile completion: ${filledPreferencesCount} non-open preferences`);
    console.log(`Using minScore: ${minScore}`);
    console.log(`Total potential matches to evaluate: ${profilesWithData.length}`);
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
        console.log("Profile has no location - allowing");
        return true;
      }

      // If max distance is 0 or very high (500+), allow any location (anywhere in USA)
      if (maxTravelDistance === 0 || maxTravelDistance >= 500) {
        console.log(`Max distance ${maxTravelDistance} - allowing all locations`);
        return true;
      }

      // For small distances (< 500 miles), allow same country at minimum
      // Don't strictly enforce state boundaries
      const sameState = currentUserProfile.location_state === profileLocation.location_state;
      
      if (sameState) {
        return true; // Same state is always acceptable
      }

      // Different state: only filter if distance is VERY small (< 25 miles) and same city required
      if (maxTravelDistance < 25 && currentUserProfile.location_city && profileLocation.location_city) {
        const sameCityMatch = currentUserProfile.location_city.toLowerCase() === profileLocation.location_city.toLowerCase();
        if (!sameCityMatch) {
          console.log(`Different city and < 25 miles - skipping`);
          return false;
        }
      }

      // Otherwise allow it
      return true;
    };

    // Calculate match score for each potential match
    let skippedByDistance = 0;
    let skippedByNoAttributes = 0;
    
    console.log(`Current user location: ${currentUserProfile?.location_city}, ${currentUserProfile?.location_state}`);
    
    for (const profile of profilesWithData) {
      const profileLocation = {
        location_city: (profile as any).location_city,
        location_state: (profile as any).location_state,
        location_country: (profile as any).location_country,
      };
      
      // Filter by travel distance first
      if (!isWithinTravelDistance(profileLocation)) {
        skippedByDistance++;
        console.log(`Skipping ${profile.full_name} (${profileLocation.location_city}, ${profileLocation.location_state}) - too far`);
        continue; // Skip this user, too far away
      }

      // Get attributes for this user (guaranteed to exist due to filter above)
      const userAttrs = (profile as any).user_attributes;

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
        } else {
          console.log(`Skipping match ${profile.id}: score ${matchDetail.percentageMatch}% < minScore ${minScore}%`);
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

    console.log(`=== MATCH RESULTS ===`);
    console.log(`Total matches found: ${matches.length}`);
    console.log(`Skipped by distance: ${skippedByDistance}`);
    console.log(`Skipped by no attributes: ${skippedByNoAttributes}`);
    console.log(`Top matches returned: ${topMatches.length}`);
    if (topMatches.length === 0) {
      console.warn(`WARNING: No matches found! Check preferenes and attributes.`);
    }

    // Store in database using a simple reliable approach
    const matchRecords = topMatches.map((match) => ({
      user_id: user.id,
      matched_user_id: match.matchedUserId,
      match_score: match.percentageMatch,
    }));

    if (matchRecords.length > 0) {
      try {
        console.log(`Processing ${matchRecords.length} matches for storage...`);
        
        // Strategy: Update or insert each match individually to avoid batch conflicts
        let successCount = 0;
        let failCount = 0;

        for (const record of matchRecords) {
          try {
            // Try to upsert by trying update first, then insert if it fails
            const { data: existing } = await supabase
              .from("matches")
              .select("id")
              .eq("user_id", record.user_id)
              .eq("matched_user_id", record.matched_user_id)
              .maybeSingle();

            if (existing) {
              // Update existing
              const updateData: any = { match_score: record.match_score };
              // Only add updated_at if the column exists (after migration)
              // The column will be added via migration 098_add_updated_at_to_matches.sql
              const { error: updateError } = await supabase
                .from("matches")
                .update(updateData)
                .eq("id", existing.id);

              if (updateError) {
                console.error(`Failed to update match ${record.matched_user_id}:`, updateError);
                failCount++;
              } else {
                successCount++;
              }
            } else {
              // Insert new
              const { error: insertError } = await supabase
                .from("matches")
                .insert(record);

              if (insertError) {
                console.error(`Failed to insert match ${record.matched_user_id}:`, insertError);
                failCount++;
              } else {
                successCount++;
              }
            }
          } catch (err) {
            console.error(`Exception processing match ${record.matched_user_id}:`, err);
            failCount++;
          }
        }

        console.log(`Match storage complete: ${successCount} succeeded, ${failCount} failed`);
        
        // Also clean up any old matches that weren't in the top results
        if (matchRecords.length > 0) {
          try {
            // Fetch all old matches first
            const { data: allMatches } = await supabase
              .from("matches")
              .select("id, matched_user_id")
              .eq("user_id", user.id);

            if (allMatches && allMatches.length > 0) {
              const matchedUserIds = matchRecords.map(m => m.matched_user_id);
              const toDelete = allMatches.filter(
                m => !matchedUserIds.includes(m.matched_user_id)
              );

              if (toDelete.length > 0) {
                const deleteIds = toDelete.map(m => m.id);
                const { error: cleanupError } = await supabase
                  .from("matches")
                  .delete()
                  .in("id", deleteIds);

                if (cleanupError) {
                  console.log("Cleanup note:", cleanupError);
                } else {
                  console.log(`Cleaned up ${toDelete.length} old matches`);
                }
              }
            }
          } catch (cleanupErr) {
            console.log("Cleanup error (non-critical):", cleanupErr);
          }
        }
      } catch (storageError) {
        console.error("Exception during match storage:", storageError);
        console.warn("Matches were calculated but storage had issues. Returning results anyway.");
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
