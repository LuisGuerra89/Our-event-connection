import { createServerClient } from "@/lib/supabase/server";
import { NextRequest, NextResponse } from "next/server";

export async function GET(request: NextRequest) {
  const supabase = await createServerClient();

  const { data, error } = await supabase.auth.getUser();
  if (error || !data?.user) {
    return NextResponse.json(
      { error: "Unauthorized" },
      { status: 401 }
    );
  }

  try {
    // Fetch matches for the current user
    const { data: matches, error: matchError } = await supabase
      .from("matches")
      .select(`
        id,
        matched_user_id,
        profiles!matches_matched_user_id_fkey (
          id,
          display_name,
          bio,
          location_city,
          location_state,
          gender,
          profile_image_url,
          user_attributes (*)
        )
      `)
      .eq("user_id", data.user.id);

    if (matchError) {
      console.error("Error fetching matches:", matchError);
      return NextResponse.json(
        { error: "Failed to fetch matches" },
        { status: 500 }
      );
    }

    // Transform matches data
    const matchedUsers = matches?.map((match: any) => ({
      ...match.profiles,
      matchId: match.id,
    })) || [];

    return NextResponse.json({ matches: matchedUsers });
  } catch (error) {
    console.error("Error in GET /api/matches:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
