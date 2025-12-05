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
  buttocks?: string;
  legs?: string;
  shoe_size?: number;
  breast_size?: string;
  penis_size?: string;
  has_tattoos?: string;
  
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
  occupation?: string;
  owns_business_flag?: boolean;
  business_type?: string;
  housing_status?: string;
  looking_for_roommate?: boolean;
  relationship_type?: string;
  favorite_color?: string;
  dress_code_preference?: string;
  
  // Beauty & Wellness
  makeup_spending_frequency?: string;
  likes_massage?: boolean;
  nails_done_frequency?: string;
  facial_frequency?: string;
  likes_networking_events?: boolean;
}

interface UserPreferences {
  // Physical preferences
  hair_color_importance?: string;
  hair_color_preference?: string[];
  hair_length_importance?: string;
  hair_length_preference?: string[];
  eye_color_importance?: string;
  eye_color_preference?: string[];
  body_type_importance?: string;
  body_type_preference?: string[];
  height_importance?: string;
  height_min?: number;
  height_max?: number;
  race_importance?: string;
  race_preference?: string[];
  
  // Extended physical
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
  buttocks_importance?: string;
  buttocks_preference?: string[];
  legs_importance?: string;
  legs_preference?: string[];
  shoe_size_importance?: string;
  shoe_size_min?: number;
  shoe_size_max?: number;
  
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
  
  // Beauty & Wellness preferences
  makeup_spending_importance?: string;
  makeup_spending_preference?: string[];
  massage_importance?: string;
  nails_frequency_importance?: string;
  nails_frequency_preference?: string[];
  facial_frequency_importance?: string;
  facial_frequency_preference?: string[];
  
  relationship_type_importance?: string;
  relationship_type_preference?: string[];
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
              attributes.hand_size || attributes.buttocks || attributes.legs || attributes.shoe_size) && (
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
                    {attributes.has_tattoos && (
                      <div className="text-sm">
                        <span className="text-muted-foreground">Tattoos:</span>
                        <Badge variant="secondary" className="ml-2">{attributes.has_tattoos}</Badge>
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
                {attributes.relationship_type && (
                  <div className="text-sm">
                    <span className="text-muted-foreground">Seeking:</span>
                    <Badge variant="secondary" className="ml-2">{attributes.relationship_type}</Badge>
                  </div>
                )}
              </div>
            </div>

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
            {/* General Preferences */}
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
              </div>
            </div>

            {/* Physical Preferences */}
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
              </div>
            </div>

            {/* Lifestyle Preferences */}
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
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
