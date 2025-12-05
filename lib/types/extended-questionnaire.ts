/**
 * Extended Questionnaire Types
 * Comprehensive 54+ question questionnaire for detailed matching algorithm
 * Includes both "What I Am" and "What I'm Looking For" sections
 */

import { z } from "zod";

// ============================================================================
// ADDITIONAL ENUMS (beyond detailed-profile.ts)
// ============================================================================

export enum ForeheadTypeEnum {
  SMALL = "small",
  AVERAGE = "average",
  BROAD = "broad",
  HIGH = "high",
  OTHER = "other",
}

export enum CheekbonesEnum {
  HIGH = "high",
  PROMINENT = "prominent",
  AVERAGE = "average",
  SOFT = "soft",
  OTHER = "other",
}

export enum ButtocksEnum {
  SMALL = "small",
  AVERAGE = "average",
  CURVY = "curvy",
  FULL = "full",
  ATHLETIC = "athletic",
  OTHER = "other",
}

export enum HandSizeEnum {
  PETITE = "petite",
  SMALL = "small",
  AVERAGE = "average",
  LARGE = "large",
  VERY_LARGE = "very_large",
}

export enum LegsEnum {
  SHORT = "short",
  AVERAGE = "average",
  LONG = "long",
  ATHLETIC = "athletic",
  CURVY = "curvy",
}

// ============================================================================
// SCHEMAS for Zod Validation
// ============================================================================

const foreheadTypeSchema = z.enum(["small", "average", "broad", "high", "other"]);
const cheekbonesSchema = z.enum(["high", "prominent", "average", "soft", "other"]);
const buttocksSchema = z.enum(["small", "average", "curvy", "full", "athletic", "other"]);
const handSizeSchema = z.enum(["petite", "small", "average", "large", "very_large"]);
const legsSchema = z.enum(["short", "average", "long", "athletic", "curvy"]);

// Import from detailed-profile.ts
const hairLengthSchema = z.enum(["very_short", "short", "shoulder_length", "long", "very_long"]);
const hairColorSchema = z.enum(["black", "dark_brown", "light_brown", "blonde", "red", "gray", "white", "other"]);
const eyeShapeSchema = z.enum(["round", "almond", "monolid", "hooded", "upturned", "downturned", "other"]);
const eyeColorSchema = z.enum(["blue", "green", "brown", "amber", "gray", "hazel", "other"]);
const noseShapeSchema = z.enum(["button", "snub", "roman", "grecian", "nubian", "hawk", "celestial", "other"]);
const lipsTypeSchema = z.enum(["thin", "average", "full", "very_full", "heart_shaped", "other"]);
const complexionSchema = z.enum(["fair", "medium", "olive", "dark", "very_dark", "other"]);
const bodyTypeSchema = z.enum(["slim", "athletic", "average", "curvy", "muscular", "plus_size", "other"]);
const breastSizeSchema = z.enum(["a", "b", "c", "d", "e", "f", "other"]);
const penisSizeSchema = z.enum(["small", "average", "large", "very_large", "prefer_not_to_say"]);
const tattooStatusSchema = z.enum(["none", "small_few", "several", "extensive", "prefer_not_to_say"]);
const tattooLocationSchema = z.enum(["arms", "chest", "back", "legs", "neck", "face", "hands", "torso"]);
const religionSchema = z.enum([
  "agnostic", "atheist", "buddhist", "christian", "hindu", "jewish", 
  "muslim", "spiritual_not_religious", "other", "prefer_not_to_say"
]);
const maritalStatusSchema = z.enum(["single", "married", "divorced", "widowed", "separated", "domestic_partnership"]);
const frequencySchema = z.enum(["never", "rarely", "sometimes", "often", "very_often", "daily"]);
const gymTypeSchema = z.enum(["no_gym", "home", "commercial", "crossfit", "boxing", "pilates", "yoga", "multiple", "other"]);
const housingStatusSchema = z.enum(["renting", "looking_for_roommate", "owns_home", "with_family", "other"]);
const dressCodeSchema = z.enum(["casual", "business_casual", "business", "formal", "athletic", "mixed"]);
const relationshipTypeSchema = z.enum([
  "monogamous", "open_relationship", "polyamorous", "casual_dating", 
  "serious_long_term", "friendship_first", "not_sure"
]);
const raceSchema = z.enum([
  "white", "black_african_american", "hispanic_latino", "asian", "middle_eastern",
  "native_american", "pacific_islander", "mixed", "other", "prefer_not_to_say"
]);

const preferenceImportanceSchema = z.enum([
  "not_important", "somewhat_important", "important", "very_important", "open_to_all"
]);

// ============================================================================
// COMPREHENSIVE USER ATTRIBUTES - "What I Am"
// ============================================================================

export const ComprehensiveUserAttributesSchema = z.object({
  // ===== Physical Appearance =====
  hairLength: hairLengthSchema.optional().nullable(),
  hairColor: hairColorSchema.optional().nullable(),
  forehead: foreheadTypeSchema.optional().nullable(),
  eyeShape: eyeShapeSchema.optional().nullable(),
  eyeColor: eyeColorSchema.optional().nullable(),
  nose: noseShapeSchema.optional().nullable(),
  cheekbones: cheekbonesSchema.optional().nullable(),
  lips: lipsTypeSchema.optional().nullable(),
  complexion: complexionSchema.optional().nullable(),
  bodyType: bodyTypeSchema.optional().nullable(),
  handSize: handSizeSchema.optional().nullable(),
  breastSize: breastSizeSchema.optional().nullable(),
  penisSize: penisSizeSchema.optional().nullable(),
  buttocks: buttocksSchema.optional().nullable(),
  legs: legsSchema.optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  height: z.number().optional().nullable(), // in cm
  race: raceSchema.optional().nullable(),
  
  // ===== Tattoos =====
  hasTattoos: tattooStatusSchema.optional().nullable(),
  tattooLocations: z.array(tattooLocationSchema).optional().nullable(),
  tattooDetails: z.string().optional().nullable(),
  
  // ===== Lifestyle & Beauty =====
  makeupSpendingFrequency: frequencySchema.optional().nullable(),
  likesMassage: z.boolean().optional().nullable(),
  nailsDoneFrequency: frequencySchema.optional().nullable(),
  facialFrequency: frequencySchema.optional().nullable(),
  
  // ===== Fitness =====
  workoutFrequency: frequencySchema.optional().nullable(),
  gymType: gymTypeSchema.optional().nullable(),
  
  // ===== Social Habits =====
  sexuallyActiveFrequency: frequencySchema.optional().nullable(),
  alcoholConsumption: frequencySchema.optional().nullable(),
  nightclubBarFrequency: frequencySchema.optional().nullable(),
  likesOutdoors: z.boolean().optional().nullable(),
  
  // ===== Personal Info =====
  religion: religionSchema.optional().nullable(),
  hobbies: z.array(z.string()).optional().nullable(),
  maritalStatus: maritalStatusSchema.optional().nullable(),
  hasKids: z.boolean().optional().nullable(),
  kidsCount: z.number().optional().nullable(),
  kidsBoys: z.number().optional().nullable(),
  kidsGirls: z.number().optional().nullable(),
  
  // ===== Professional =====
  occupation: z.string().optional().nullable(),
  ownsBusiness: z.boolean().optional().nullable(),
  businessType: z.string().optional().nullable(),
  
  // ===== Housing =====
  housingStatus: housingStatusSchema.optional().nullable(),
  lookingForRoommate: z.boolean().optional().nullable(),
  homePurchaseDate: z.string().optional().nullable(),
  interestedInRemodel: z.boolean().optional().nullable(),
  remodelingType: z.string().optional().nullable(),
  interestedInADU: z.boolean().optional().nullable(),
  interestedInRefinance: z.boolean().optional().nullable(),
  
  // ===== Interests & Events =====
  eventCategoriesLiked: z.array(z.string()).optional().nullable(),
  likesNetworkingEvents: z.boolean().optional().nullable(),
  
  // ===== Personal Preferences =====
  relationshipTypeSeeking: relationshipTypeSchema.optional().nullable(),
  favoriteColor: z.string().optional().nullable(),
  favoriteFoods: z.array(z.string()).optional().nullable(), // by country/cuisine
  dressCodePreference: dressCodeSchema.optional().nullable(),
});

export type ComprehensiveUserAttributes = z.infer<typeof ComprehensiveUserAttributesSchema>;

// ============================================================================
// COMPREHENSIVE USER PREFERENCES - "What I'm Looking For"
// ============================================================================

/**
 * Each preference has:
 * - importance: how important is this to me?
 * - preference: what values am I looking for? (array or single value)
 */

export const ComprehensiveUserPreferencesSchema = z.object({
  // ===== Physical Preferences =====
  hairLengthImportance: preferenceImportanceSchema.default("open_to_all"),
  hairLengthPreference: z.array(hairLengthSchema).optional().nullable(),
  
  hairColorImportance: preferenceImportanceSchema.default("open_to_all"),
  hairColorPreference: z.array(hairColorSchema).optional().nullable(),
  
  foreheadImportance: preferenceImportanceSchema.default("open_to_all"),
  foreheadPreference: z.array(foreheadTypeSchema).optional().nullable(),
  
  eyeShapeImportance: preferenceImportanceSchema.default("open_to_all"),
  eyeShapePreference: z.array(eyeShapeSchema).optional().nullable(),
  
  eyeColorImportance: preferenceImportanceSchema.default("open_to_all"),
  eyeColorPreference: z.array(eyeColorSchema).optional().nullable(),
  
  noseImportance: preferenceImportanceSchema.default("open_to_all"),
  nosePreference: z.array(noseShapeSchema).optional().nullable(),
  
  cheekbonesImportance: preferenceImportanceSchema.default("open_to_all"),
  cheekbonesPreference: z.array(cheekbonesSchema).optional().nullable(),
  
  lipsImportance: preferenceImportanceSchema.default("open_to_all"),
  lipsPreference: z.array(lipsTypeSchema).optional().nullable(),
  
  complexionImportance: preferenceImportanceSchema.default("open_to_all"),
  complexionPreference: z.array(complexionSchema).optional().nullable(),
  
  bodyTypeImportance: preferenceImportanceSchema.default("open_to_all"),
  bodyTypePreference: z.array(bodyTypeSchema).optional().nullable(),
  
  handSizeImportance: preferenceImportanceSchema.default("open_to_all"),
  handSizePreference: z.array(handSizeSchema).optional().nullable(),
  
  breastSizeImportance: preferenceImportanceSchema.default("open_to_all"),
  breastSizePreference: z.array(breastSizeSchema).optional().nullable(),
  
  penisSizeImportance: preferenceImportanceSchema.default("open_to_all"),
  penisSizePreference: z.array(penisSizeSchema).optional().nullable(),
  
  buttocksImportance: preferenceImportanceSchema.default("open_to_all"),
  buttocksPreference: z.array(buttocksSchema).optional().nullable(),
  
  legsImportance: preferenceImportanceSchema.default("open_to_all"),
  legsPreference: z.array(legsSchema).optional().nullable(),
  
  shoeSizeImportance: preferenceImportanceSchema.default("open_to_all"),
  shoeSizeMin: z.number().optional().nullable(),
  shoeSizeMax: z.number().optional().nullable(),
  
  heightImportance: preferenceImportanceSchema.default("open_to_all"),
  heightMin: z.number().optional().nullable(),
  heightMax: z.number().optional().nullable(),
  
  raceImportance: preferenceImportanceSchema.default("open_to_all"),
  racePreference: z.array(raceSchema).optional().nullable(),
  
  // ===== Tattoo Preferences =====
  tattooImportance: preferenceImportanceSchema.default("open_to_all"),
  tattooPreference: z.array(tattooStatusSchema).optional().nullable(),
  tattooLocationPreference: z.array(tattooLocationSchema).optional().nullable(),
  
  // ===== Lifestyle Preferences =====
  makeupSpendingImportance: preferenceImportanceSchema.default("open_to_all"),
  makeupSpendingPreference: z.array(frequencySchema).optional().nullable(),
  
  massageImportance: preferenceImportanceSchema.default("open_to_all"),
  wantsMassagePartner: z.boolean().optional().nullable(),
  
  nailsImportance: preferenceImportanceSchema.default("open_to_all"),
  nailsPreference: z.array(frequencySchema).optional().nullable(),
  
  facialImportance: preferenceImportanceSchema.default("open_to_all"),
  facialPreference: z.array(frequencySchema).optional().nullable(),
  
  // ===== Fitness Preferences =====
  workoutImportance: preferenceImportanceSchema.default("open_to_all"),
  workoutFrequencyPreference: z.array(frequencySchema).optional().nullable(),
  gymTypePreference: z.array(gymTypeSchema).optional().nullable(),
  
  // ===== Social Preferences =====
  sexuallyActiveImportance: preferenceImportanceSchema.default("open_to_all"),
  sexuallyActivePreference: z.array(frequencySchema).optional().nullable(),
  
  alcoholImportance: preferenceImportanceSchema.default("open_to_all"),
  alcoholPreference: z.array(frequencySchema).optional().nullable(),
  
  nightclubImportance: preferenceImportanceSchema.default("open_to_all"),
  nightclubPreference: z.array(frequencySchema).optional().nullable(),
  
  outdoorsImportance: preferenceImportanceSchema.default("open_to_all"),
  wantsOutdoorPartner: z.boolean().optional().nullable(),
  
  // ===== Personal Preferences =====
  religionImportance: preferenceImportanceSchema.default("open_to_all"),
  religionPreference: z.array(religionSchema).optional().nullable(),
  
  hobbiesImportance: preferenceImportanceSchema.default("open_to_all"),
  hobbiesPreference: z.array(z.string()).optional().nullable(),
  
  maritalStatusImportance: preferenceImportanceSchema.default("open_to_all"),
  maritalStatusPreference: z.array(maritalStatusSchema).optional().nullable(),
  
  kidsImportance: preferenceImportanceSchema.default("open_to_all"),
  kidsPreference: z.enum(["no_kids", "has_kids", "any"]).optional().nullable(),
  
  // ===== Professional Preferences =====
  occupationImportance: preferenceImportanceSchema.default("open_to_all"),
  occupationPreference: z.array(z.string()).optional().nullable(),
  
  businessOwnerImportance: preferenceImportanceSchema.default("open_to_all"),
  wantsBusinessOwnerPartner: z.boolean().optional().nullable(),
  
  // ===== Housing Preferences =====
  housingImportance: preferenceImportanceSchema.default("open_to_all"),
  housingPreference: z.array(housingStatusSchema).optional().nullable(),
  
  // ===== Event & Interest Preferences =====
  eventCategoriesImportance: preferenceImportanceSchema.default("open_to_all"),
  eventCategoriesPreference: z.array(z.string()).optional().nullable(),
  
  networkingEventsImportance: preferenceImportanceSchema.default("open_to_all"),
  likesNetworkingEvents: z.boolean().optional().nullable(),
  
  // ===== Relationship Preferences =====
  relationshipTypeImportance: preferenceImportanceSchema.default("open_to_all"),
  relationshipTypePreference: z.array(relationshipTypeSchema).optional().nullable(),
  
  favoriteColorImportance: preferenceImportanceSchema.default("open_to_all"),
  favoriteColorPreference: z.array(z.string()).optional().nullable(),
  
  favoriteFoodImportance: preferenceImportanceSchema.default("open_to_all"),
  favoriteFoodPreference: z.array(z.string()).optional().nullable(),
  
  dressCodeImportance: preferenceImportanceSchema.default("open_to_all"),
  dressCodePreference: z.array(dressCodeSchema).optional().nullable(),
  
  // ===== Age Range (Special case - numeric) =====
  ageImportance: preferenceImportanceSchema.default("open_to_all"),
  ageMin: z.number().optional().nullable(),
  ageMax: z.number().optional().nullable(),
});

export type ComprehensiveUserPreferences = z.infer<typeof ComprehensiveUserPreferencesSchema>;

// ============================================================================
// COMPLETE QUESTIONNAIRE SUBMISSION DTO
// ============================================================================

export const CompleteQuestionnaireSchema = z.object({
  attributes: ComprehensiveUserAttributesSchema,
  preferences: ComprehensiveUserPreferencesSchema,
});

export type CompleteQuestionnaire = z.infer<typeof CompleteQuestionnaireSchema>;
