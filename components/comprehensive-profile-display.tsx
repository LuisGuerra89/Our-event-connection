/**
 * Comprehensive Profile Display
 * Shows all user attributes and preferences organized by:
 * - "What I Am" (user attributes)
 * - "What I'm Looking For" (user preferences)
 */

"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { 
  User, 
  Heart, 
  Eye, 
  Ruler, 
  Home, 
  Briefcase, 
  Sparkles,
  Target,
  Search
} from "lucide-react";

interface UserAttributes {
  // Physical
  hair_color?: string;
  hair_length?: string;
  eye_color?: string;
  eye_shape?: string;
  body_type?: string;
  complexion?: string;
  race?: string;
  height?: number;
  forehead?: string;
  nose?: string;
  cheekbones?: string;
  lips?: string;
  hand_size?: string;
  breast_size?: string;
  penis_size?: string;
  buttocks?: string;
  legs?: string;
  shoe_size?: number;
  tattoo_status?: string;
  
  // Lifestyle
  religion?: string;
  workout_frequency?: string;
  alcohol_consumption_frequency?: string;
  nightclub_bar_frequency?: string;
  sexually_active_frequency?: string;
  likes_outdoors?: boolean;
  
  // Personal & Professional
  marital_status?: string;
  kids_count?: number;
  kids_boys?: number;
  kids_girls?: number;
  kids_age_ranges?: string;
  occupation?: string;
  owns_business_flag?: boolean;
  business_type?: string;
  housing_status?: string;
  looking_for_roommate?: boolean;
  relationship_type_seeking?: string;
  favorite_color?: string;
  favorite_foods?: string[];
  dress_code_preference?: string;
  
  // Beauty & Wellness
  makeup_spending_frequency?: string;
  likes_massage?: boolean;
  nails_done_frequency?: string;
  facial_frequency?: string;
  likes_networking_events?: boolean;
  
  // Events & Interests
  event_categories_liked?: string[];
  
  // Housing
  interested_in_remodel?: boolean;
  interested_in_adu?: boolean;
  interested_in_refinance?: boolean;
}

interface UserPreferences {
  // Physical preferences
  hair_color_importance?: string;
  hair_color_preference?: string[];
  hair_length_importance?: string;
  hair_length_preference?: string[];
  eye_color_importance?: string;
  eye_color_preference?: string[];
  eye_shape_importance?: string;
  eye_shape_preference?: string[];
  body_type_importance?: string;
  body_type_preference?: string[];
  height_importance?: string;
  height_min?: number;
  height_max?: number;
  race_importance?: string;
  race_preference?: string[];
  complexion_importance?: string;
  complexion_preference?: string[];
  
  // Extended physical features
  forehead_importance?: string;
  forehead_preference?: string[];
  nose_importance?: string;
  nose_preference?: string[];
  cheekbones_importance?: string;
  cheekbones_preference?: string[];
  lips_importance?: string;
  lips_preference?: string[];
  hand_size_importance?: string;
  hand_size_preference?: string[];
  breast_size_importance?: string;
  breast_size_preference?: string[];
  penis_size_importance?: string;
  penis_size_preference?: string[];
  buttocks_importance?: string;
  buttocks_preference?: string[];
  legs_importance?: string;
  legs_preference?: string[];
  shoe_size_importance?: string;
  shoe_size_min?: number;
  shoe_size_max?: number;
  
  // Tattoo preferences
  tattoo_importance?: string;
  tattoo_preference?: string[];
  tattoo_location_preference?: string[];
  
  // Beauty & Wellness preferences
  makeup_spending_importance?: string;
  makeup_spending_preference?: string[];
  massage_importance?: string;
  nails_importance?: string;
  nails_preference?: string[];
  facial_importance?: string;
  facial_preference?: string[];
  
  // Lifestyle preferences
  religion_importance?: string;
  religion_preference?: string[];
  workout_importance?: string;
  workout_frequency_preference?: string[];
  alcohol_importance?: string;
  alcohol_preference?: string[];
  marital_status_importance?: string;
  marital_status_preference?: string[];
  kids_importance?: string;
  kids_preference?: string[];
  housing_status_importance?: string;
  housing_status_preference?: string[];
  
  // Social preferences
  sexually_active_importance?: string;
  sexually_active_preference?: string[];
  nightclub_importance?: string;
  nightclub_preference?: string[];
  outdoors_importance?: string;
  wants_outdoor_partner?: boolean;
  
  // Professional preferences
  occupation_importance?: string;
  occupation_preference?: string[];
  business_owner_importance?: string;
  wants_business_owner_partner?: boolean;
  
  // Event & Interest preferences
  event_categories_importance?: string;
  event_categories_preference?: string[];
  networking_events_importance?: string;
  likes_networking_events?: boolean;
  
  // Personal preferences
  hobbies_importance?: string;
  hobbies_preference?: string[];
  favorite_color_importance?: string;
  favorite_color_preference?: string[];
  favorite_food_importance?: string;
  favorite_food_preference?: string[];
  dress_code_importance?: string;
  dress_code_preference?: string[];
  
  // Relationship preferences
  relationship_type_importance?: string;
  relationship_type_preference?: string[];
  
  // General preferences
  gym_type_preference?: string[];
  age_importance?: string;
  age_min?: number;
  age_max?: number;
}

interface Props {
  attributes?: UserAttributes | null;
  preferences?: UserPreferences | null;
}

const importanceLabels: Record<string, string> = {
  open_to_all: "Open to All",
  not_important: "Not Important",
  somewhat_important: "Somewhat Important",
  important: "Important",
  very_important: "Very Important",
};

const importanceColors: Record<string, string> = {
  open_to_all: "bg-gray-100 text-gray-600",
  not_important: "bg-blue-100 text-blue-600",
  somewhat_important: "bg-yellow-100 text-yellow-600",
  important: "bg-orange-100 text-orange-600",
  very_important: "bg-red-100 text-red-600",
};

export function ComprehensiveProfileDisplay({ attributes, preferences }: Props) {
  if (!attributes && !preferences) {
    return null;
  }

  const formatList = (items?: string[]): string => {
    if (!items || items.length === 0) return "Not specified";
    return items.join(", ");
  };

  const formatRange = (min?: number, max?: number, unit?: string): string => {
    if (!min && !max) return "Not specified";
    if (min && max) return `${min}-${max}${unit || ""}`;
    if (min) return `${min}+${unit || ""}`;
    if (max) return `Up to ${max}${unit || ""}`;
    return "Not specified";
  };

  // Check if user has any specified preferences (not all open_to_all)
  const hasSpecificPreferences = (): boolean => {
    if (!preferences) return false;
    
    // Check all importance fields
    const importanceFields = Object.keys(preferences).filter(key => key.endsWith('_importance'));
    return importanceFields.some(field => {
      const value = preferences[field as keyof UserPreferences];
      return value && value !== "open_to_all";
    });
  };

  return (
    <div className="space-y-6">
      {/* MY ATTRIBUTES - What I Am */}
      {attributes && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <User className="h-5 w-5 text-primary" />
              <CardTitle>What I Am</CardTitle>
            </div>
            <CardDescription>My personal attributes and characteristics</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Physical Appearance */}
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Eye className="h-4 w-4" />
                Physical Appearance
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {attributes.hair_color && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Hair Color:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.hair_color}</Badge>
                  </div>
                )}
                {attributes.hair_length && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Hair Length:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.hair_length}</Badge>
                  </div>
                )}
                {attributes.eye_color && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Eye Color:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.eye_color}</Badge>
                  </div>
                )}
                {attributes.eye_shape && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Eye Shape:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.eye_shape}</Badge>
                  </div>
                )}
                {attributes.body_type && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Body Type:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.body_type}</Badge>
                  </div>
                )}
                {attributes.height && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Height:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.height} cm</Badge>
                  </div>
                )}
                {attributes.complexion && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Complexion:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.complexion}</Badge>
                  </div>
                )}
                {attributes.race && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Race:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.race}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Detailed Physical Features */}
            {(attributes.forehead || attributes.nose || attributes.cheekbones || attributes.lips || 
              attributes.hand_size || attributes.buttocks || attributes.legs || attributes.shoe_size ||
              attributes.breast_size || attributes.penis_size || attributes.tattoo_status) && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Ruler className="h-4 w-4" />
                    Detailed Features
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attributes.forehead && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Forehead:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.forehead}</Badge>
                      </div>
                    )}
                    {attributes.nose && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Nose:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.nose}</Badge>
                      </div>
                    )}
                    {attributes.cheekbones && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Cheekbones:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.cheekbones}</Badge>
                      </div>
                    )}
                    {attributes.lips && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Lips:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.lips}</Badge>
                      </div>
                    )}
                    {attributes.hand_size && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Hand Size:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.hand_size}</Badge>
                      </div>
                    )}
                    {attributes.buttocks && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Buttocks:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.buttocks}</Badge>
                      </div>
                    )}
                    {attributes.legs && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Legs:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.legs}</Badge>
                      </div>
                    )}
                    {attributes.shoe_size && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Shoe Size:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.shoe_size} US</Badge>
                      </div>
                    )}
                    {attributes.breast_size && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Breast Size:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.breast_size}</Badge>
                      </div>
                    )}
                    {attributes.penis_size && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Penis Size:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.penis_size}</Badge>
                      </div>
                    )}
                    {attributes.tattoo_status && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Tattoos:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.tattoo_status}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Lifestyle */}
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Heart className="h-4 w-4" />
                Lifestyle
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {attributes.religion && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Religion:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.religion}</Badge>
                  </div>
                )}
                {attributes.workout_frequency && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Workout:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.workout_frequency}</Badge>
                  </div>
                )}
                {attributes.alcohol_consumption_frequency && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Alcohol:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.alcohol_consumption_frequency}</Badge>
                  </div>
                )}
                {attributes.nightclub_bar_frequency && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Nightlife:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.nightclub_bar_frequency}</Badge>
                  </div>
                )}
                {attributes.likes_outdoors !== undefined && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Outdoors:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.likes_outdoors ? "Yes" : "No"}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Personal & Professional */}
            <Separator />
            <div>
              <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                <Briefcase className="h-4 w-4" />
                Personal & Professional
              </h3>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                {attributes.marital_status && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Status:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.marital_status}</Badge>
                  </div>
                )}
                {attributes.kids_count !== undefined && attributes.kids_count > 0 && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Kids:</span>
                    <Badge variant="secondary" className="ml-2">
                      {attributes.kids_count} ({attributes.kids_boys || 0} boys, {attributes.kids_girls || 0} girls)
                    </Badge>
                  </div>
                )}
                {attributes.occupation && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Occupation:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.occupation}</Badge>
                  </div>
                )}
                {attributes.owns_business_flag && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Business:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.business_type || "Yes"}</Badge>
                  </div>
                )}
                {attributes.housing_status && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Housing:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.housing_status}</Badge>
                  </div>
                )}
                {attributes.relationship_type_seeking && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Seeking:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.relationship_type_seeking}</Badge>
                  </div>
                )}
                {attributes.looking_for_roommate !== undefined && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Roommate Search:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.looking_for_roommate ? "Yes" : "No"}</Badge>
                  </div>
                )}
              </div>
            </div>

            {/* Events & Interests */}
            {(attributes.event_categories_liked && attributes.event_categories_liked.length > 0) || attributes.likes_networking_events !== undefined ? (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Sparkles className="h-4 w-4" />
                    Events & Interests
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attributes.event_categories_liked && attributes.event_categories_liked.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Event Categories:</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {attributes.event_categories_liked.map((cat) => (
                            <Badge key={cat} variant="secondary">{cat}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {attributes.likes_networking_events !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Networking Events:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.likes_networking_events ? "Yes" : "No"}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            ) : null}

            {/* Personal Preferences */}
            {(attributes.favorite_color || (attributes.favorite_foods && attributes.favorite_foods.length > 0) || attributes.dress_code_preference) && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <User className="h-4 w-4" />
                    Personal Preferences
                  </h3>
                  <div className="space-y-3">
                    {attributes.favorite_color && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Favorite Color:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.favorite_color}</Badge>
                      </div>
                    )}
                    {attributes.favorite_foods && attributes.favorite_foods.length > 0 && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Favorite Foods:</span>
                        <div className="mt-2 flex flex-wrap gap-1">
                          {attributes.favorite_foods.map((food) => (
                            <Badge key={food} variant="secondary">{food}</Badge>
                          ))}
                        </div>
                      </div>
                    )}
                    {attributes.dress_code_preference && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Dress Code Preference:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.dress_code_preference}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Housing Interests */}
            {(attributes.interested_in_remodel !== undefined || attributes.interested_in_adu !== undefined || attributes.interested_in_refinance !== undefined) && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Home className="h-4 w-4" />
                    Housing Interests
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attributes.interested_in_remodel !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Home Remodel:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.interested_in_remodel ? "Interested" : "Not Interested"}</Badge>
                      </div>
                    )}
                    {attributes.interested_in_adu !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">ADU:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.interested_in_adu ? "Interested" : "Not Interested"}</Badge>
                      </div>
                    )}
                    {attributes.interested_in_refinance !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Refinance:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.interested_in_refinance ? "Interested" : "Not Interested"}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Beauty & Wellness */}
            {(attributes.makeup_spending_frequency || attributes.likes_massage || 
              attributes.nails_done_frequency || attributes.facial_frequency) && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Sparkles className="h-4 w-4" />
                    Beauty & Wellness
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                    {attributes.makeup_spending_frequency && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Makeup:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.makeup_spending_frequency}</Badge>
                      </div>
                    )}
                    {attributes.likes_massage !== undefined && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Massage:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.likes_massage ? "Yes" : "No"}</Badge>
                      </div>
                    )}
                    {attributes.nails_done_frequency && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Nails:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.nails_done_frequency}</Badge>
                      </div>
                    )}
                    {attributes.facial_frequency && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Facials:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.facial_frequency}</Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}

      {/* MY PREFERENCES - What I'm Looking For */}
      {preferences && (
        <Card>
          <CardHeader>
            <div className="flex items-center gap-2">
              <Target className="h-5 w-5 text-primary" />
              <CardTitle>What I'm Looking For</CardTitle>
            </div>
            <CardDescription>My preferences and what matters to me in a match</CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Show message if all preferences are open_to_all */}
            {!hasSpecificPreferences() && (
              <div className="p-6 bg-gradient-to-br from-blue-50 to-purple-50 dark:from-blue-950 dark:to-purple-950 rounded-lg border-2 border-blue-200 dark:border-blue-800">
                <div className="flex items-start gap-3">
                  <div className="text-3xl">🌟</div>
                  <div>
                    <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-2">
                      You're Open to Everyone!
                    </h4>
                    <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                      You currently have all your preferences set to "Open to All", which means you'll see the maximum number of potential matches. This is great for exploring all possibilities!
                    </p>
                    <p className="text-sm text-blue-800 dark:text-blue-200">
                      💡 <strong>Tip:</strong> Want to be more specific? Update your preferences in the questionnaire to focus on what matters most to you. You can always change them later!
                    </p>
                  </div>
                </div>
              </div>
            )}

            {/* General Preferences */}
            {hasSpecificPreferences() && (
              <div>
                <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                  <Search className="h-4 w-4" />
                  General Preferences
                </h3>
                <div className="space-y-3">
                  {preferences.age_importance && preferences.age_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Age Range</p>
                      <p className="text-sm text-muted-foreground">
                        {formatRange(preferences.age_min, preferences.age_max, " years")}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.age_importance]}>
                      {importanceLabels[preferences.age_importance]}
                    </Badge>
                  </div>
                )}
                {preferences.relationship_type_importance && preferences.relationship_type_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Relationship Type</p>
                      <p className="text-sm text-muted-foreground">
                        {formatList(preferences.relationship_type_preference)}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.relationship_type_importance]}>
                      {importanceLabels[preferences.relationship_type_importance]}
                    </Badge>
                  </div>
                )}

                  {(!preferences.age_importance || preferences.age_importance === "open_to_all") && 
                   (!preferences.relationship_type_importance || preferences.relationship_type_importance === "open_to_all") && (
                    <p className="text-sm text-muted-foreground italic">No specific general preferences set</p>
                  )}
                </div>
              </div>
            )}

            {/* Physical Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Eye className="h-4 w-4" />
                    Physical Preferences
                  </h3>
                  <div className="space-y-3">
                    {preferences.hair_color_importance && preferences.hair_color_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Hair Color</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.hair_color_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.hair_color_importance]}>
                          {importanceLabels[preferences.hair_color_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.hair_length_importance && preferences.hair_length_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Hair Length</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.hair_length_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.hair_length_importance]}>
                          {importanceLabels[preferences.hair_length_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.eye_color_importance && preferences.eye_color_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Eye Color</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.eye_color_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.eye_color_importance]}>
                          {importanceLabels[preferences.eye_color_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.eye_shape_importance && preferences.eye_shape_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Eye Shape</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.eye_shape_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.eye_shape_importance]}>
                          {importanceLabels[preferences.eye_shape_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.body_type_importance && preferences.body_type_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Body Type</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.body_type_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.body_type_importance]}>
                          {importanceLabels[preferences.body_type_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.height_importance && preferences.height_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Height</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRange(preferences.height_min, preferences.height_max, " cm")}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.height_importance]}>
                          {importanceLabels[preferences.height_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.race_importance && preferences.race_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Race/Ethnicity</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.race_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.race_importance]}>
                          {importanceLabels[preferences.race_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.complexion_importance && preferences.complexion_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Complexion</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.complexion_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.complexion_importance]}>
                          {importanceLabels[preferences.complexion_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Detailed Physical Features Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Ruler className="h-4 w-4" />
                    Detailed Physical Preferences
                  </h3>
                  <div className="space-y-3">
                    {preferences.forehead_importance && preferences.forehead_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Forehead</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.forehead_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.forehead_importance]}>
                          {importanceLabels[preferences.forehead_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.nose_importance && preferences.nose_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Nose</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.nose_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.nose_importance]}>
                          {importanceLabels[preferences.nose_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.cheekbones_importance && preferences.cheekbones_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Cheekbones</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.cheekbones_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.cheekbones_importance]}>
                          {importanceLabels[preferences.cheekbones_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.lips_importance && preferences.lips_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Lips</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.lips_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.lips_importance]}>
                          {importanceLabels[preferences.lips_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.hand_size_importance && preferences.hand_size_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Hand Size</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.hand_size_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.hand_size_importance]}>
                          {importanceLabels[preferences.hand_size_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.breast_size_importance && preferences.breast_size_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Breast Size</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.breast_size_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.breast_size_importance]}>
                          {importanceLabels[preferences.breast_size_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.penis_size_importance && preferences.penis_size_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Penis Size</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.penis_size_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.penis_size_importance]}>
                          {importanceLabels[preferences.penis_size_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.buttocks_importance && preferences.buttocks_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Buttocks</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.buttocks_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.buttocks_importance]}>
                          {importanceLabels[preferences.buttocks_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.legs_importance && preferences.legs_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Legs</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.legs_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.legs_importance]}>
                          {importanceLabels[preferences.legs_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.shoe_size_importance && preferences.shoe_size_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Shoe Size</p>
                          <p className="text-sm text-muted-foreground">
                            {formatRange(preferences.shoe_size_min, preferences.shoe_size_max, " US")}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.shoe_size_importance]}>
                          {importanceLabels[preferences.shoe_size_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.tattoo_importance && preferences.tattoo_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Tattoos</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.tattoo_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.tattoo_importance]}>
                          {importanceLabels[preferences.tattoo_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Lifestyle Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Heart className="h-4 w-4" />
                    Lifestyle Preferences
                  </h3>
                  <div className="space-y-3">
                {preferences.religion_importance && preferences.religion_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Religion</p>
                      <p className="text-sm text-muted-foreground">
                        {formatList(preferences.religion_preference)}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.religion_importance]}>
                      {importanceLabels[preferences.religion_importance]}
                    </Badge>
                  </div>
                )}
                {preferences.workout_importance && preferences.workout_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Workout Frequency</p>
                      <p className="text-sm text-muted-foreground">
                        {formatList(preferences.workout_frequency_preference)}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.workout_importance]}>
                      {importanceLabels[preferences.workout_importance]}
                    </Badge>
                  </div>
                )}
                {preferences.alcohol_importance && preferences.alcohol_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Alcohol Consumption</p>
                      <p className="text-sm text-muted-foreground">
                        {formatList(preferences.alcohol_preference)}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.alcohol_importance]}>
                      {importanceLabels[preferences.alcohol_importance]}
                    </Badge>
                  </div>
                )}
                {preferences.nightclub_importance && preferences.nightclub_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Nightclub Frequency</p>
                      <p className="text-sm text-muted-foreground">
                        {formatList(preferences.nightclub_preference)}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.nightclub_importance]}>
                      {importanceLabels[preferences.nightclub_importance]}
                    </Badge>
                  </div>
                )}
                {preferences.outdoors_importance && preferences.outdoors_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Outdoors Activities</p>
                      <p className="text-sm text-muted-foreground">
                        {preferences.wants_outdoor_partner ? "Yes" : "Not important"}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.outdoors_importance]}>
                      {importanceLabels[preferences.outdoors_importance]}
                    </Badge>
                  </div>
                )}
                {preferences.marital_status_importance && preferences.marital_status_importance !== "open_to_all" && (
                  <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                    <div>
                      <p className="text-sm font-medium">Marital Status</p>
                      <p className="text-sm text-muted-foreground">
                        {formatList(preferences.marital_status_preference)}
                      </p>
                    </div>
                    <Badge className={importanceColors[preferences.marital_status_importance]}>
                      {importanceLabels[preferences.marital_status_importance]}
                    </Badge>
                  </div>
                )}
                    {preferences.kids_importance && preferences.kids_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Kids</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.kids_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.kids_importance]}>
                          {importanceLabels[preferences.kids_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.sexually_active_importance && preferences.sexually_active_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Sexually Active</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.sexually_active_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.sexually_active_importance]}>
                          {importanceLabels[preferences.sexually_active_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Beauty & Wellness Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Sparkles className="h-4 w-4" />
                    Beauty & Wellness Preferences
                  </h3>
                  <div className="space-y-3">
                    {preferences.makeup_spending_importance && preferences.makeup_spending_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Makeup Spending</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.makeup_spending_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.makeup_spending_importance]}>
                          {importanceLabels[preferences.makeup_spending_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.massage_importance && preferences.massage_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Massage Partner</p>
                          <p className="text-sm text-muted-foreground">
                            {preferences.massage_importance !== "open_to_all" ? "Important" : "Not specified"}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.massage_importance]}>
                          {importanceLabels[preferences.massage_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.nails_importance && preferences.nails_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Nails Frequency</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.nails_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.nails_importance]}>
                          {importanceLabels[preferences.nails_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.facial_importance && preferences.facial_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Facials Frequency</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.facial_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.facial_importance]}>
                          {importanceLabels[preferences.facial_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Professional Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Briefcase className="h-4 w-4" />
                    Professional Preferences
                  </h3>
                  <div className="space-y-3">
                    {preferences.occupation_importance && preferences.occupation_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Occupation</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.occupation_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.occupation_importance]}>
                          {importanceLabels[preferences.occupation_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.business_owner_importance && preferences.business_owner_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Business Owner Partner</p>
                          <p className="text-sm text-muted-foreground">
                            {preferences.wants_business_owner_partner ? "Yes" : "Not important"}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.business_owner_importance]}>
                          {importanceLabels[preferences.business_owner_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.housing_status_importance && preferences.housing_status_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Housing Status</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.housing_status_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.housing_status_importance]}>
                          {importanceLabels[preferences.housing_status_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Events & Interests Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Target className="h-4 w-4" />
                    Events & Interests Preferences
                  </h3>
                  <div className="space-y-3">
                    {preferences.event_categories_importance && preferences.event_categories_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Event Categories</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.event_categories_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.event_categories_importance]}>
                          {importanceLabels[preferences.event_categories_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.networking_events_importance && preferences.networking_events_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Networking Events</p>
                          <p className="text-sm text-muted-foreground">
                            {preferences.likes_networking_events ? "Interested" : "Not interested"}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.networking_events_importance]}>
                          {importanceLabels[preferences.networking_events_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.hobbies_importance && preferences.hobbies_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Hobbies</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.hobbies_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.hobbies_importance]}>
                          {importanceLabels[preferences.hobbies_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}

            {/* Personal Preferences */}
            {hasSpecificPreferences() && (
              <>
                <Separator />
                <div>
                  <h3 className="flex items-center gap-2 text-sm font-semibold mb-3">
                    <Heart className="h-4 w-4" />
                    Personal Preferences
                  </h3>
                  <div className="space-y-3">
                    {preferences.favorite_color_importance && preferences.favorite_color_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Favorite Colors</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.favorite_color_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.favorite_color_importance]}>
                          {importanceLabels[preferences.favorite_color_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.favorite_food_importance && preferences.favorite_food_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Favorite Foods</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.favorite_food_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.favorite_food_importance]}>
                          {importanceLabels[preferences.favorite_food_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.dress_code_importance && preferences.dress_code_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Dress Code Preference</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.dress_code_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.dress_code_importance]}>
                          {importanceLabels[preferences.dress_code_importance]}
                        </Badge>
                      </div>
                    )}
                    {preferences.relationship_type_importance && preferences.relationship_type_importance !== "open_to_all" && (
                      <div className="flex items-center justify-between p-3 bg-muted/30 rounded-lg">
                        <div>
                          <p className="text-sm font-medium">Relationship Type</p>
                          <p className="text-sm text-muted-foreground">
                            {formatList(preferences.relationship_type_preference)}
                          </p>
                        </div>
                        <Badge className={importanceColors[preferences.relationship_type_importance]}>
                          {importanceLabels[preferences.relationship_type_importance]}
                        </Badge>
                      </div>
                    )}
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  );
}