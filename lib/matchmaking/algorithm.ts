/**
 * Matchmaking Algorithm
 *
 * CORE LOGIC:
 * 1. Compare currentUser.preferences vs potentialMatch.attributes
 * 2. If preference.importance === "OPEN_TO_ALL" → NO scoring impact (always match)
 * 3. Otherwise → Check if potentialMatch.attribute IN currentUser.preferences
 * 4. Apply weight multiplier based on importance level (1x, 2x, 3x, 5x)
 * 5. Calculate weighted score across categories
 */

import { PreferenceImportanceEnum } from "@/lib/types/detailed-profile";

interface UserProfile {
  id: string;
  attributes: {
    // Existing physical attributes
    hairColor?: string;
    hairLength?: string;
    eyeColor?: string;
    bodyType?: string;
    complexion?: string;
    race?: string;
    tattooStatus?: string;
    height?: number;
    breastSize?: string;
    penisSize?: string;
    
    // NEW Phase 6: Extended physical attributes
    forehead?: string;
    eyeShape?: string;
    nose?: string;
    cheekbones?: string;
    lips?: string;
    handSize?: string;
    buttocks?: string;
    legs?: string;
    shoeSize?: number;
    hasTattoos?: string;
    
    // Demographics
    dateOfBirth?: Date;
    maritalStatus?: string;
    kidsCount?: number;
    kidsBoys?: number;
    kidsGirls?: number;
    
    // Lifestyle
    religion?: string;
    workoutFrequency?: string;
    gymType?: string;
    alcoholConsumption?: string;
    nightclubFrequency?: string;
    sexuallyActiveFrequency?: string;
    likesOutdoors?: boolean;
    
    // NEW Phase 7: Personal & Professional
    occupation?: string;
    ownsBusinessFlag?: boolean;
    businessType?: string;
    housingStatus?: string;
    lookingForRoommate?: boolean;
    relationshipType?: string;
    favoriteColor?: string;
    dressCodePreference?: string;
    
    // NEW Phase 7: Beauty & Wellness
    makeupSpendingFrequency?: string;
    likesMassage?: boolean;
    nailsDoneFrequency?: string;
    facialFrequency?: string;
  };
}

interface UserPreference {
  id: string;
  preferences: {
    // Physical preferences with importance (existing)
    hairColorImportance?: PreferenceImportanceEnum;
    hairColorPreference?: string[];
    hairLengthImportance?: PreferenceImportanceEnum;
    hairLengthPreference?: string[];
    eyeColorImportance?: PreferenceImportanceEnum;
    eyeColorPreference?: string[];
    bodyTypeImportance?: PreferenceImportanceEnum;
    bodyTypePreference?: string[];
    complexionImportance?: PreferenceImportanceEnum;
    complexionPreference?: string[];
    raceImportance?: PreferenceImportanceEnum;
    racePreference?: string[];
    tattooImportance?: PreferenceImportanceEnum;
    tattooPreference?: string[];
    heightImportance?: PreferenceImportanceEnum;
    heightMin?: number;
    heightMax?: number;
    breastSizeImportance?: PreferenceImportanceEnum;
    breastSizePreference?: string[];
    penisSizeImportance?: PreferenceImportanceEnum;
    penisSizePreference?: string[];
    
    // NEW Phase 8: Extended physical preferences
    foreheadImportance?: PreferenceImportanceEnum;
    foreheadPreference?: string[];
    eyeShapeImportance?: PreferenceImportanceEnum;
    eyeShapePreference?: string[];
    noseImportance?: PreferenceImportanceEnum;
    nosePreference?: string[];
    cheekbonesImportance?: PreferenceImportanceEnum;
    cheekbonesPreference?: string[];
    lipsImportance?: PreferenceImportanceEnum;
    lipsPreference?: string[];
    handSizeImportance?: PreferenceImportanceEnum;
    handSizePreference?: string[];
    buttocksImportance?: PreferenceImportanceEnum;
    buttocksPreference?: string[];
    legsImportance?: PreferenceImportanceEnum;
    legsPreference?: string[];
    shoeSizeImportance?: PreferenceImportanceEnum;
    shoeSizeMin?: number;
    shoeSizeMax?: number;
    
    // Lifestyle preferences (existing)
    religionImportance?: PreferenceImportanceEnum;
    religionPreference?: string[];
    workoutImportance?: PreferenceImportanceEnum;
    workoutFrequencyPreference?: string[];
    gymTypePreference?: string[];
    alcoholImportance?: PreferenceImportanceEnum;
    alcoholPreference?: string[];
    nightclubImportance?: PreferenceImportanceEnum;
    nightclubPreference?: string[];
    sexuallyActiveImportance?: PreferenceImportanceEnum;
    sexuallyActivePreference?: string[];
    outdoorsImportance?: PreferenceImportanceEnum;
    outdoorsPreference?: string[];
    
    // NEW Phase 8: Beauty & Wellness preferences
    makeupSpendingImportance?: PreferenceImportanceEnum;
    makeupSpendingPreference?: string[];
    massageImportance?: PreferenceImportanceEnum;
    nailsFrequencyImportance?: PreferenceImportanceEnum;
    nailsFrequencyPreference?: string[];
    facialFrequencyImportance?: PreferenceImportanceEnum;
    facialFrequencyPreference?: string[];
    
    // Demographics (existing)
    maritalStatusImportance?: PreferenceImportanceEnum;
    maritalStatusPreference?: string[];
    kidsImportance?: PreferenceImportanceEnum;
    kidsPreference?: string[];
    occupationImportance?: PreferenceImportanceEnum;
    occupationPreference?: string[];
    businessOwnerImportance?: PreferenceImportanceEnum;
    wantsBusinessOwnerPartner?: boolean;
    
    // NEW Phase 8: Housing & Personal preferences
    housingStatusImportance?: PreferenceImportanceEnum;
    housingStatusPreference?: string[];
    relationshipTypeImportance?: PreferenceImportanceEnum;
    relationshipTypePreference?: string[];
    
    // General
    ageImportance?: PreferenceImportanceEnum;
    ageMin?: number;
    ageMax?: number;
  };
}

// ============================================================================
// SCORING WEIGHTS
// ============================================================================

const IMPORTANCE_WEIGHTS = {
  not_important: 1.0,
  somewhat_important: 2.0,
  important: 3.0,
  very_important: 5.0,
  open_to_all: 0.0, // CRITICAL: Open to all = no impact on score
};

const CATEGORY_WEIGHTS = {
  physical: 0.35, // Physical attraction is 35% of match
  lifestyle: 0.30, // Lifestyle compatibility is 30%
  demographics: 0.20, // Demographics is 20%
  general: 0.15, // General preferences is 15%
};

const MAX_SCORES = {
  physical: 100,
  lifestyle: 100,
  demographics: 100,
  general: 100,
};

// ============================================================================
// CORE MATCHING LOGIC
// ============================================================================

/**
 * Check if preference is "OPEN TO ALL" (user doesn't care)
 * UPDATED: Now treats undefined/null/empty as "open_to_all"
 * This allows incomplete questionnaires to show everyone
 */
function isOpenToAll(importance?: PreferenceImportanceEnum): boolean {
  return !importance || importance === "open_to_all";
}

/**
 * Check if preference values are empty/undefined
 * Empty preferences = "open to all" for that attribute
 */
function isPreferenceEmpty(preferenceValues?: string[] | number[] | boolean): boolean {
  if (preferenceValues === undefined || preferenceValues === null) return true;
  if (Array.isArray(preferenceValues) && preferenceValues.length === 0) return true;
  return false;
}

/**
 * Get weight multiplier for importance level
 */
function getWeightMultiplier(
  importance?: PreferenceImportanceEnum
): number {
  if (!importance) return 0;
  return IMPORTANCE_WEIGHTS[importance as keyof typeof IMPORTANCE_WEIGHTS] ?? 0;
}

/**
 * Calculate age from DOB
 */
function calculateAge(dateOfBirth?: Date): number | null {
  if (!dateOfBirth) return null;
  const today = new Date();
  const birthDate = new Date(dateOfBirth);
  let age = today.getFullYear() - birthDate.getFullYear();
  const monthDiff = today.getMonth() - birthDate.getMonth();
  if (
    monthDiff < 0 ||
    (monthDiff === 0 && today.getDate() < birthDate.getDate())
  ) {
    age--;
  }
  return age;
}

/**
 * Check if value matches any in preference array (case-insensitive)
 */
function isValueInPreference(value: string | undefined, preference: string[] | undefined): boolean {
  if (!value || !preference || preference.length === 0) return false;
  return preference.some(p => p.toLowerCase() === value.toLowerCase());
}

/**
 * Check if numeric value is in range
 */
function isValueInRange(value: number | undefined, min?: number, max?: number): boolean {
  if (value === undefined || value === null) return false;
  if (min !== undefined && value < min) return false;
  if (max !== undefined && value > max) return false;
  return true;
}

/**
 * Calculate single attribute match score
 * UPDATED: Empty preferences are treated as "open to all"
 */
function calculateAttributeScore(
  userValue: string | number | undefined,
  preferenceImportance?: PreferenceImportanceEnum,
  preferenceValues?: string[] | number[],
  isRange?: boolean
): { matches: boolean; score: number } {
  // If preference is OPEN_TO_ALL → automatic match, no points deducted
  if (isOpenToAll(preferenceImportance)) {
    return { matches: true, score: 0 }; // No scoring impact
  }

  // NUEVO: Si preference values está vacío → tratarlo como "open to all"
  if (isPreferenceEmpty(preferenceValues)) {
    return { matches: true, score: 0 }; // No filter applied for empty preferences
  }

  // No user value provided → treat as no match
  if (userValue === undefined || userValue === null) {
    return { matches: false, score: 0 };
  }

  let matches = false;

  // Handle range checks (height, age, shoe size)
  if (isRange && typeof preferenceValues !== "string") {
    const [min, max] = (preferenceValues as number[]) || [];
    matches = isValueInRange(userValue as number, min, max);
  } else {
    // Handle array matches
    matches = isValueInPreference(String(userValue), preferenceValues as string[]);
  }

  const weight = getWeightMultiplier(preferenceImportance);
  const score = matches ? weight : 0;

  return { matches, score };
}

// ============================================================================
// CATEGORY SCORING FUNCTIONS
// ============================================================================

interface AttributeMatchResult {
  attributeName: string;
  userValue?: string | number | boolean;
  matches: boolean;
  score: number;
  weight: number;
}

interface CategoryScoreResult {
  score: number;
  maxScore: number;
  percentage: number;
  attributeMatches: AttributeMatchResult[];
}

/**
 * Calculate Physical Attributes Score
 */
function scorePhysicalAttributes(
  userAttrs: UserProfile["attributes"],
  userPrefs: UserPreference["preferences"]
): CategoryScoreResult {
  const attributeMatches: AttributeMatchResult[] = [];
  let totalScore = 0;
  let totalPossibleScore = 0;

  const attributes = [
    // Existing physical attributes
    {
      name: "hairColor",
      value: userAttrs.hairColor,
      importance: userPrefs.hairColorImportance,
      preferences: userPrefs.hairColorPreference,
    },
    {
      name: "hairLength",
      value: userAttrs.hairLength,
      importance: userPrefs.hairLengthImportance,
      preferences: userPrefs.hairLengthPreference,
    },
    {
      name: "eyeColor",
      value: userAttrs.eyeColor,
      importance: userPrefs.eyeColorImportance,
      preferences: userPrefs.eyeColorPreference,
    },
    {
      name: "bodyType",
      value: userAttrs.bodyType,
      importance: userPrefs.bodyTypeImportance,
      preferences: userPrefs.bodyTypePreference,
    },
    {
      name: "complexion",
      value: userAttrs.complexion,
      importance: userPrefs.complexionImportance,
      preferences: userPrefs.complexionPreference,
    },
    {
      name: "race",
      value: userAttrs.race,
      importance: userPrefs.raceImportance,
      preferences: userPrefs.racePreference,
    },
    {
      name: "tattooStatus",
      value: userAttrs.tattooStatus,
      importance: userPrefs.tattooImportance,
      preferences: userPrefs.tattooPreference,
    },
    {
      name: "breastSize",
      value: userAttrs.breastSize,
      importance: userPrefs.breastSizeImportance,
      preferences: userPrefs.breastSizePreference,
    },
    {
      name: "penisSize",
      value: userAttrs.penisSize,
      importance: userPrefs.penisSizeImportance,
      preferences: userPrefs.penisSizePreference,
    },
    {
      name: "height",
      value: userAttrs.height,
      importance: userPrefs.heightImportance,
      preferences: userPrefs.heightMin && userPrefs.heightMax 
        ? [userPrefs.heightMin, userPrefs.heightMax] 
        : undefined,
      isRange: true,
    },
    // NEW Phase 6: Extended physical attributes
    {
      name: "forehead",
      value: userAttrs.forehead,
      importance: userPrefs.foreheadImportance,
      preferences: userPrefs.foreheadPreference,
    },
    {
      name: "eyeShape",
      value: userAttrs.eyeShape,
      importance: userPrefs.eyeShapeImportance,
      preferences: userPrefs.eyeShapePreference,
    },
    {
      name: "nose",
      value: userAttrs.nose,
      importance: userPrefs.noseImportance,
      preferences: userPrefs.nosePreference,
    },
    {
      name: "cheekbones",
      value: userAttrs.cheekbones,
      importance: userPrefs.cheekbonesImportance,
      preferences: userPrefs.cheekbonesPreference,
    },
    {
      name: "lips",
      value: userAttrs.lips,
      importance: userPrefs.lipsImportance,
      preferences: userPrefs.lipsPreference,
    },
    {
      name: "handSize",
      value: userAttrs.handSize,
      importance: userPrefs.handSizeImportance,
      preferences: userPrefs.handSizePreference,
    },
    {
      name: "buttocks",
      value: userAttrs.buttocks,
      importance: userPrefs.buttocksImportance,
      preferences: userPrefs.buttocksPreference,
    },
    {
      name: "legs",
      value: userAttrs.legs,
      importance: userPrefs.legsImportance,
      preferences: userPrefs.legsPreference,
    },
    {
      name: "shoeSize",
      value: userAttrs.shoeSize,
      importance: userPrefs.shoeSizeImportance,
      preferences: userPrefs.shoeSizeMin && userPrefs.shoeSizeMax 
        ? [userPrefs.shoeSizeMin, userPrefs.shoeSizeMax] 
        : undefined,
      isRange: true,
    },
    {
      name: "hasTattoos",
      value: userAttrs.hasTattoos,
      importance: userPrefs.tattooImportance,
      preferences: userPrefs.tattooPreference,
    },
  ];

  for (const attr of attributes) {
    // Si importance es open_to_all O preferences está vacío → skip (no filtrar)
    if (isOpenToAll(attr.importance) || isPreferenceEmpty(attr.preferences)) {
      // OPEN_TO_ALL or EMPTY: no impact on scoring
      continue;
    }

    const result = calculateAttributeScore(
      attr.value as string | number,
      attr.importance,
      attr.preferences,
      attr.isRange
    );

    const weight = getWeightMultiplier(attr.importance);
    totalPossibleScore += weight;
    totalScore += result.score;

    attributeMatches.push({
      attributeName: attr.name,
      userValue: attr.value,
      matches: result.matches,
      score: result.score,
      weight,
    });
  }

  const percentage =
    totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 100;

  return {
    score: totalScore,
    maxScore: totalPossibleScore,
    percentage,
    attributeMatches,
  };
}

/**
 * Calculate Lifestyle Attributes Score
 */
function scoreLifestyleAttributes(
  userAttrs: UserProfile["attributes"],
  userPrefs: UserPreference["preferences"]
): CategoryScoreResult {
  const attributeMatches: AttributeMatchResult[] = [];
  let totalScore = 0;
  let totalPossibleScore = 0;

  const attributes = [
    // Existing lifestyle attributes
    {
      name: "religion",
      value: userAttrs.religion,
      importance: userPrefs.religionImportance,
      preferences: userPrefs.religionPreference,
    },
    {
      name: "workoutFrequency",
      value: userAttrs.workoutFrequency,
      importance: userPrefs.workoutImportance,
      preferences: userPrefs.workoutFrequencyPreference,
    },
    {
      name: "gymType",
      value: userAttrs.gymType,
      importance: userPrefs.workoutImportance, // Same importance as workout
      preferences: userPrefs.gymTypePreference,
    },
    {
      name: "alcoholConsumption",
      value: userAttrs.alcoholConsumption,
      importance: userPrefs.alcoholImportance,
      preferences: userPrefs.alcoholPreference,
    },
    {
      name: "nightclubFrequency",
      value: userAttrs.nightclubFrequency,
      importance: userPrefs.nightclubImportance,
      preferences: userPrefs.nightclubPreference,
    },
    {
      name: "sexuallyActiveFrequency",
      value: userAttrs.sexuallyActiveFrequency,
      importance: userPrefs.sexuallyActiveImportance,
      preferences: userPrefs.sexuallyActivePreference,
    },
    {
      name: "likesOutdoors",
      value: userAttrs.likesOutdoors ? "yes" : "no",
      importance: userPrefs.outdoorsImportance,
      preferences: userPrefs.outdoorsPreference,
    },
    // NEW Phase 7/8: Beauty & Wellness
    {
      name: "makeupSpending",
      value: userAttrs.makeupSpendingFrequency,
      importance: userPrefs.makeupSpendingImportance,
      preferences: userPrefs.makeupSpendingPreference,
    },
    {
      name: "likesMassage",
      value: userAttrs.likesMassage ? "yes" : "no",
      importance: userPrefs.massageImportance,
      preferences: ["yes"], // Assuming preference is boolean-like
    },
    {
      name: "nailsFrequency",
      value: userAttrs.nailsDoneFrequency,
      importance: userPrefs.nailsFrequencyImportance,
      preferences: userPrefs.nailsFrequencyPreference,
    },
    {
      name: "facialFrequency",
      value: userAttrs.facialFrequency,
      importance: userPrefs.facialFrequencyImportance,
      preferences: userPrefs.facialFrequencyPreference,
    },
  ];

  for (const attr of attributes) {
    // Si importance es open_to_all O preferences está vacío → skip (no filtrar)
    if (isOpenToAll(attr.importance) || isPreferenceEmpty(attr.preferences)) {
      continue;
    }

    const result = calculateAttributeScore(
      attr.value as string,
      attr.importance,
      attr.preferences
    );

    const weight = getWeightMultiplier(attr.importance);
    totalPossibleScore += weight;
    totalScore += result.score;

    attributeMatches.push({
      attributeName: attr.name,
      userValue: attr.value,
      matches: result.matches,
      score: result.score,
      weight,
    });
  }

  const percentage =
    totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 100;

  return {
    score: totalScore,
    maxScore: totalPossibleScore,
    percentage,
    attributeMatches,
  };
}

/**
 * Calculate Demographics Score
 */
function scoreDemographics(
  userAttrs: UserProfile["attributes"],
  userPrefs: UserPreference["preferences"]
): CategoryScoreResult {
  const attributeMatches: AttributeMatchResult[] = [];
  let totalScore = 0;
  let totalPossibleScore = 0;

  const attributes = [
    {
      name: "maritalStatus",
      value: userAttrs.maritalStatus,
      importance: userPrefs.maritalStatusImportance,
      preferences: userPrefs.maritalStatusPreference,
    },
    {
      name: "hasKids",
      value:
        userAttrs.kidsCount && userAttrs.kidsCount > 0
          ? "yes"
          : "no",
      importance: userPrefs.kidsImportance,
      preferences: userPrefs.kidsPreference,
    },
    {
      name: "occupation",
      value: userAttrs.occupation,
      importance: userPrefs.occupationImportance,
      preferences: userPrefs.occupationPreference,
    },
    {
      name: "businessOwner",
      value: userAttrs.ownsBusinessFlag ? "yes" : "no",
      importance: userPrefs.businessOwnerImportance,
      preferences: userPrefs.wantsBusinessOwnerPartner ? ["yes"] : ["no"],
    },
    // NEW Phase 7/8: Housing & Relationship
    {
      name: "housingStatus",
      value: userAttrs.housingStatus,
      importance: userPrefs.housingStatusImportance,
      preferences: userPrefs.housingStatusPreference,
    },
    {
      name: "relationshipType",
      value: userAttrs.relationshipType,
      importance: userPrefs.relationshipTypeImportance,
      preferences: userPrefs.relationshipTypePreference,
    },
  ];

  // Age matching - verificar que haya valores min/max definidos
  if (!isOpenToAll(userPrefs.ageImportance) && 
      (userPrefs.ageMin !== undefined || userPrefs.ageMax !== undefined)) {
    const age = calculateAge(userAttrs.dateOfBirth);
    if (age !== null) {
      const ageInRange = isValueInRange(age, userPrefs.ageMin, userPrefs.ageMax);
      const weight = getWeightMultiplier(userPrefs.ageImportance);
      totalPossibleScore += weight;
      if (ageInRange) {
        totalScore += weight;
      }
      attributeMatches.push({
        attributeName: "age",
        userValue: age,
        matches: ageInRange,
        score: ageInRange ? weight : 0,
        weight,
      });
    }
  }

  for (const attr of attributes) {
    // Si importance es open_to_all O preferences está vacío → skip (no filtrar)
    if (isOpenToAll(attr.importance) || isPreferenceEmpty(attr.preferences)) {
      continue;
    }

    const result = calculateAttributeScore(
      attr.value as string,
      attr.importance,
      attr.preferences
    );

    const weight = getWeightMultiplier(attr.importance);
    totalPossibleScore += weight;
    totalScore += result.score;

    attributeMatches.push({
      attributeName: attr.name,
      userValue: attr.value,
      matches: result.matches,
      score: result.score,
      weight,
    });
  }

  const percentage =
    totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 100;

  return {
    score: totalScore,
    maxScore: totalPossibleScore,
    percentage,
    attributeMatches,
  };
}

/**
 * Calculate General Preferences Score
 */
function scoreGeneralPreferences(
  userAttrs: UserProfile["attributes"],
  userPrefs: UserPreference["preferences"]
): CategoryScoreResult {
  const attributeMatches: AttributeMatchResult[] = [];
  let totalScore = 0;
  let totalPossibleScore = 0;

  const attributes = [
    {
      name: "relationshipType",
      value: userAttrs.relationshipType,
      importance: userPrefs.relationshipTypeImportance,
      preferences: userPrefs.relationshipTypePreference,
    },
  ];

  for (const attr of attributes) {
    // Si importance es open_to_all O preferences está vacío → skip (no filtrar)
    if (isOpenToAll(attr.importance) || isPreferenceEmpty(attr.preferences)) {
      continue;
    }

    const result = calculateAttributeScore(
      attr.value as string,
      attr.importance,
      attr.preferences
    );

    const weight = getWeightMultiplier(attr.importance);
    totalPossibleScore += weight;
    totalScore += result.score;

    attributeMatches.push({
      attributeName: attr.name,
      userValue: attr.value,
      matches: result.matches,
      score: result.score,
      weight,
    });
  }

  const percentage =
    totalPossibleScore > 0 ? (totalScore / totalPossibleScore) * 100 : 100;

  return {
    score: totalScore,
    maxScore: totalPossibleScore,
    percentage,
    attributeMatches,
  };
}

// ============================================================================
// MAIN ALGORITHM: CALCULATE MATCH SCORE
// ============================================================================

export interface MatchScoreDetail {
  totalScore: number;
  percentageMatch: number;
  categories: {
    physical: CategoryScoreResult;
    lifestyle: CategoryScoreResult;
    demographics: CategoryScoreResult;
    general: CategoryScoreResult;
  };
  isOpenToAllUser: boolean; // If currentUser is open to everything
}

/**
 * MAIN FUNCTION: Calculate match score between two users
 *
 * @param currentUser User whose preferences we're checking
 * @param potentialMatch User being evaluated
 * @returns Match score (0-100) and detailed breakdown
 *
 * LOGIC:
 * IF (currentUser.preference.importance === "OPEN_TO_ALL")
 *   THEN NO scoring impact (user is flexible)
 * ELSE IF (currentUser.preference.value IN potentialMatch.attribute)
 *   THEN Score += Weight[importance]
 * ELSE
 *   THEN Score += 0
 */
export function calculateMatchScore(
  currentUser: UserPreference,
  potentialMatch: UserProfile
): MatchScoreDetail {
  // Calculate scores per category
  const physicalScore = scorePhysicalAttributes(
    potentialMatch.attributes,
    currentUser.preferences
  );

  const lifestyleScore = scoreLifestyleAttributes(
    potentialMatch.attributes,
    currentUser.preferences
  );

  const demographicsScore = scoreDemographics(
    potentialMatch.attributes,
    currentUser.preferences
  );

  const generalScore = scoreGeneralPreferences(
    potentialMatch.attributes,
    currentUser.preferences
  );

  // Check if user is "OPEN TO ALL" across all preferences
  // UPDATED: Ahora incluye verificación de preferences vacías
  const isOpenToAllUser = Object.values(currentUser.preferences).every(
    (pref) =>
      isOpenToAll(pref as PreferenceImportanceEnum) ||
      !pref
  );

  // Calculate weighted total score
  const maxTotalScore =
    physicalScore.maxScore * CATEGORY_WEIGHTS.physical +
    lifestyleScore.maxScore * CATEGORY_WEIGHTS.lifestyle +
    demographicsScore.maxScore * CATEGORY_WEIGHTS.demographics +
    generalScore.maxScore * CATEGORY_WEIGHTS.general;

  const totalRawScore =
    physicalScore.score * CATEGORY_WEIGHTS.physical +
    lifestyleScore.score * CATEGORY_WEIGHTS.lifestyle +
    demographicsScore.score * CATEGORY_WEIGHTS.demographics +
    generalScore.score * CATEGORY_WEIGHTS.general;

  // CRITICAL: Si maxTotalScore es 0 (usuario no completó nada) → 100% match con TODOS
  // Esto permite que usuarios incompletos vean a todo el mundo
  const percentageMatch =
    maxTotalScore > 0 ? (totalRawScore / maxTotalScore) * 100 : 100;

  return {
    totalScore: Math.round(totalRawScore),
    percentageMatch: Math.round(percentageMatch),
    categories: {
      physical: physicalScore,
      lifestyle: lifestyleScore,
      demographics: demographicsScore,
      general: generalScore,
    },
    isOpenToAllUser,
  };
}

// ============================================================================
// EXPORT FOR USE IN API/DATABASE
// ============================================================================

export { calculateAge, isOpenToAll, getWeightMultiplier };
