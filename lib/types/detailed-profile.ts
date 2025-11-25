/**
 * Types and DTOs for Detailed Profile Questionnaire
 * Supports 54+ attributes with bidirectional preferences (user has + user seeks)
 * with "OPEN_TO_ALL" option
 */

import { z } from "zod";

// ============================================================================
// ENUMS - Matching Supabase types
// ============================================================================

export enum HairLengthEnum {
  VERY_SHORT = "very_short",
  SHORT = "short",
  SHOULDER_LENGTH = "shoulder_length",
  LONG = "long",
  VERY_LONG = "very_long",
}

export enum HairColorEnum {
  BLACK = "black",
  DARK_BROWN = "dark_brown",
  LIGHT_BROWN = "light_brown",
  BLONDE = "blonde",
  RED = "red",
  GRAY = "gray",
  WHITE = "white",
  OTHER = "other",
}

export enum EyeShapeEnum {
  ROUND = "round",
  ALMOND = "almond",
  MONOLID = "monolid",
  HOODED = "hooded",
  UPTURNED = "upturned",
  DOWNTURNED = "downturned",
  OTHER = "other",
}

export enum EyeColorEnum {
  BLUE = "blue",
  GREEN = "green",
  BROWN = "brown",
  AMBER = "amber",
  GRAY = "gray",
  HAZEL = "hazel",
  OTHER = "other",
}

export enum NoseShapeEnum {
  BUTTON = "button",
  SNUB = "snub",
  ROMAN = "roman",
  GRECIAN = "grecian",
  NUBIAN = "nubian",
  HAWK = "hawk",
  CELESTIAL = "celestial",
  OTHER = "other",
}

export enum LipsTypeEnum {
  THIN = "thin",
  AVERAGE = "average",
  FULL = "full",
  VERY_FULL = "very_full",
  HEART_SHAPED = "heart_shaped",
  OTHER = "other",
}

export enum ComplexionEnum {
  FAIR = "fair",
  MEDIUM = "medium",
  OLIVE = "olive",
  DARK = "dark",
  VERY_DARK = "very_dark",
  OTHER = "other",
}

export enum BodyTypeEnum {
  SLIM = "slim",
  ATHLETIC = "athletic",
  AVERAGE = "average",
  CURVY = "curvy",
  MUSCULAR = "muscular",
  PLUS_SIZE = "plus_size",
  OTHER = "other",
}

export enum BreastSizeEnum {
  A = "a",
  B = "b",
  C = "c",
  D = "d",
  E = "e",
  F = "f",
  OTHER = "other",
}

export enum PenisSizeEnum {
  SMALL = "small",
  AVERAGE = "average",
  LARGE = "large",
  VERY_LARGE = "very_large",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum TattooStatusEnum {
  NONE = "none",
  SMALL_FEW = "small_few",
  SEVERAL = "several",
  EXTENSIVE = "extensive",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum TattooLocationEnum {
  ARMS = "arms",
  CHEST = "chest",
  BACK = "back",
  LEGS = "legs",
  NECK = "neck",
  FACE = "face",
  HANDS = "hands",
  TORSO = "torso",
}

export enum ReligionEnum {
  AGNOSTIC = "agnostic",
  ATHEIST = "atheist",
  BUDDHIST = "buddhist",
  CHRISTIAN = "christian",
  HINDU = "hindu",
  JEWISH = "jewish",
  MUSLIM = "muslim",
  SPIRITUAL_NOT_RELIGIOUS = "spiritual_not_religious",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum MaritalStatusEnum {
  SINGLE = "single",
  MARRIED = "married",
  DIVORCED = "divorced",
  WIDOWED = "widowed",
  SEPARATED = "separated",
  DOMESTIC_PARTNERSHIP = "domestic_partnership",
}

export enum FrequencyEnum {
  NEVER = "never",
  RARELY = "rarely",
  SOMETIMES = "sometimes",
  OFTEN = "often",
  VERY_OFTEN = "very_often",
  DAILY = "daily",
}

export enum GymTypeEnum {
  NO_GYM = "no_gym",
  HOME = "home",
  COMMERCIAL = "commercial",
  CROSSFIT = "crossfit",
  BOXING = "boxing",
  PILATES = "pilates",
  YOGA = "yoga",
  MULTIPLE = "multiple",
  OTHER = "other",
}

export enum HousingStatusEnum {
  RENTING = "renting",
  LOOKING_FOR_ROOMMATE = "looking_for_roommate",
  OWNS_HOME = "owns_home",
  WITH_FAMILY = "with_family",
  OTHER = "other",
}

export enum DressCodeEnum {
  CASUAL = "casual",
  BUSINESS_CASUAL = "business_casual",
  BUSINESS = "business",
  FORMAL = "formal",
  ATHLETIC = "athletic",
  MIXED = "mixed",
}

export enum RelationshipTypeEnum {
  MONOGAMOUS = "monogamous",
  OPEN_RELATIONSHIP = "open_relationship",
  POLYAMOROUS = "polyamorous",
  CASUAL_DATING = "casual_dating",
  SERIOUS_LONG_TERM = "serious_long_term",
  FRIENDSHIP_FIRST = "friendship_first",
  NOT_SURE = "not_sure",
}

export enum RaceEnum {
  WHITE = "white",
  BLACK_AFRICAN_AMERICAN = "black_african_american",
  HISPANIC_LATINO = "hispanic_latino",
  ASIAN = "asian",
  MIDDLE_EASTERN = "middle_eastern",
  NATIVE_AMERICAN = "native_american",
  PACIFIC_ISLANDER = "pacific_islander",
  MIXED = "mixed",
  OTHER = "other",
  PREFER_NOT_TO_SAY = "prefer_not_to_say",
}

export enum PreferenceImportanceEnum {
  NOT_IMPORTANT = "not_important",
  SOMEWHAT_IMPORTANT = "somewhat_important",
  IMPORTANT = "important",
  VERY_IMPORTANT = "very_important",
  OPEN_TO_ALL = "open_to_all", // CRITICAL: User doesn't care about this attribute
}

// ============================================================================
// ZOD SCHEMAS - Validation
// ============================================================================

const hairLengthSchema = z.enum([
  "very_short",
  "short",
  "shoulder_length",
  "long",
  "very_long",
]);

const hairColorSchema = z.enum([
  "black",
  "dark_brown",
  "light_brown",
  "blonde",
  "red",
  "gray",
  "white",
  "other",
]);

const eyeShapeSchema = z.enum([
  "round",
  "almond",
  "monolid",
  "hooded",
  "upturned",
  "downturned",
  "other",
]);

const eyeColorSchema = z.enum([
  "blue",
  "green",
  "brown",
  "amber",
  "gray",
  "hazel",
  "other",
]);

const noseShapeSchema = z.enum([
  "button",
  "snub",
  "roman",
  "grecian",
  "nubian",
  "hawk",
  "celestial",
  "other",
]);

const lipsTypeSchema = z.enum([
  "thin",
  "average",
  "full",
  "very_full",
  "heart_shaped",
  "other",
]);

const complexionSchema = z.enum([
  "fair",
  "medium",
  "olive",
  "dark",
  "very_dark",
  "other",
]);

const bodyTypeSchema = z.enum([
  "slim",
  "athletic",
  "average",
  "curvy",
  "muscular",
  "plus_size",
  "other",
]);

const breastSizeSchema = z.enum(["a", "b", "c", "d", "e", "f", "other"]);

const penisSizeSchema = z.enum([
  "small",
  "average",
  "large",
  "very_large",
  "prefer_not_to_say",
]);

const tattooStatusSchema = z.enum([
  "none",
  "small_few",
  "several",
  "extensive",
  "prefer_not_to_say",
]);

const tattooLocationSchema = z.enum([
  "arms",
  "chest",
  "back",
  "legs",
  "neck",
  "face",
  "hands",
  "torso",
]);

const religionSchema = z.enum([
  "agnostic",
  "atheist",
  "buddhist",
  "christian",
  "hindu",
  "jewish",
  "muslim",
  "spiritual_not_religious",
  "other",
  "prefer_not_to_say",
]);

const maritalStatusSchema = z.enum([
  "single",
  "married",
  "divorced",
  "widowed",
  "separated",
  "domestic_partnership",
]);

const frequencySchema = z.enum([
  "never",
  "rarely",
  "sometimes",
  "often",
  "very_often",
  "daily",
]);

const gymTypeSchema = z.enum([
  "no_gym",
  "home",
  "commercial",
  "crossfit",
  "boxing",
  "pilates",
  "yoga",
  "multiple",
  "other",
]);

const housingStatusSchema = z.enum([
  "renting",
  "looking_for_roommate",
  "owns_home",
  "with_family",
  "other",
]);

const dressCodeSchema = z.enum([
  "casual",
  "business_casual",
  "business",
  "formal",
  "athletic",
  "mixed",
]);

const relationshipTypeSchema = z.enum([
  "monogamous",
  "open_relationship",
  "polyamorous",
  "casual_dating",
  "serious_long_term",
  "friendship_first",
  "not_sure",
]);

const raceSchema = z.enum([
  "white",
  "black_african_american",
  "hispanic_latino",
  "asian",
  "middle_eastern",
  "native_american",
  "pacific_islander",
  "mixed",
  "other",
  "prefer_not_to_say",
]);

const preferenceImportanceSchema = z.enum([
  "not_important",
  "somewhat_important",
  "important",
  "very_important",
  "open_to_all",
]);

// ============================================================================
// DTOs - Data Transfer Objects
// ============================================================================

/**
 * Physical attributes that a user HAS
 */
export const UserPhysicalAttributesSchema = z.object({
  hairLength: hairLengthSchema.optional().nullable(),
  hairColor: hairColorSchema.optional().nullable(),
  foreheadType: z.string().optional().nullable(),
  eyeShape: eyeShapeSchema.optional().nullable(),
  eyeColor: eyeColorSchema.optional().nullable(),
  noseShape: noseShapeSchema.optional().nullable(),
  cheekbones: z.string().optional().nullable(),
  lipsType: lipsTypeSchema.optional().nullable(),
  complexion: complexionSchema.optional().nullable(),
  bodyType: bodyTypeSchema.optional().nullable(),
  handSize: z.string().optional().nullable(),
  breastSize: breastSizeSchema.optional().nullable(),
  penisSize: penisSizeSchema.optional().nullable(),
  buttocks: z.string().optional().nullable(),
  legs: z.string().optional().nullable(),
  shoeSize: z.number().optional().nullable(),
  race: raceSchema.optional().nullable(),
  tattooStatus: tattooStatusSchema.optional().nullable(),
  tattooLocations: z.array(tattooLocationSchema).optional().nullable(),
  tattooDetails: z.string().optional().nullable(),
  height: z.number().optional().nullable(), // in cm
});

export type UserPhysicalAttributes = z.infer<
  typeof UserPhysicalAttributesSchema
>;

/**
 * Lifestyle attributes that a user HAS
 */
export const UserLifestyleAttributesSchema = z.object({
  religion: religionSchema.optional().nullable(),
  hobbies: z.array(z.string()).optional().nullable(),
  makeupSpendingFrequency: frequencySchema.optional().nullable(),
  likesMassage: z.boolean().optional().nullable(),
  nailsDoneFrequency: frequencySchema.optional().nullable(),
  facialFrequency: frequencySchema.optional().nullable(),
  workoutFrequency: frequencySchema.optional().nullable(),
  gymType: gymTypeSchema.optional().nullable(),
  sexuallyActiveFrequency: frequencySchema.optional().nullable(),
  alcoholConsumptionFrequency: frequencySchema.optional().nullable(),
  nightclubBarFrequency: frequencySchema.optional().nullable(),
  likesOutdoors: z.boolean().optional().nullable(),
  favoriteColor: z.string().optional().nullable(),
  favoriteFoods: z.array(z.string()).optional().nullable(),
  dressCodePreference: dressCodeSchema.optional().nullable(),
});

export type UserLifestyleAttributes = z.infer<
  typeof UserLifestyleAttributesSchema
>;

/**
 * Demographics that a user HAS
 */
export const UserDemographicsSchema = z.object({
  maritalStatus: maritalStatusSchema.optional().nullable(),
  kidsCount: z.number().optional().nullable(),
  kidsBoys: z.number().optional().nullable(),
  kidsGirls: z.number().optional().nullable(),
  occupation: z.string().optional().nullable(),
  ownsBusinessFlag: z.boolean().optional().nullable(),
  businessType: z.string().optional().nullable(),
});

export type UserDemographics = z.infer<typeof UserDemographicsSchema>;

/**
 * Housing & Finance info
 */
export const UserHousingSchema = z.object({
  housingStatus: housingStatusSchema.optional().nullable(),
  homePurchaseDate: z.string().datetime().optional().nullable(),
  interestedInRemodel: z.boolean().optional().nullable(),
  interestedInAdu: z.boolean().optional().nullable(),
  interestedInRefinance: z.boolean().optional().nullable(),
});

export type UserHousing = z.infer<typeof UserHousingSchema>;

/**
 * User Preferences - What they are LOOKING FOR
 * Each preference has an importance level and possible values
 */
export const UserPreferencePhysicalSchema = z.object({
  hairColorImportance: preferenceImportanceSchema.default("open_to_all"),
  hairColorPreference: z.array(hairColorSchema).optional().nullable(),

  hairLengthImportance: preferenceImportanceSchema.default("open_to_all"),
  hairLengthPreference: z.array(hairLengthSchema).optional().nullable(),

  eyeColorImportance: preferenceImportanceSchema.default("open_to_all"),
  eyeColorPreference: z.array(eyeColorSchema).optional().nullable(),

  bodyTypeImportance: preferenceImportanceSchema.default("open_to_all"),
  bodyTypePreference: z.array(bodyTypeSchema).optional().nullable(),

  complexionImportance: preferenceImportanceSchema.default("open_to_all"),
  complexionPreference: z.array(complexionSchema).optional().nullable(),

  raceImportance: preferenceImportanceSchema.default("open_to_all"),
  racePreference: z.array(raceSchema).optional().nullable(),

  tattooImportance: preferenceImportanceSchema.default("open_to_all"),
  tattooPreference: z.array(z.string()).optional().nullable(),

  heightImportance: preferenceImportanceSchema.default("open_to_all"),
  heightMin: z.number().optional().nullable(),
  heightMax: z.number().optional().nullable(),

  breastSizeImportance: preferenceImportanceSchema.default("open_to_all"),
  breastSizePreference: z.array(breastSizeSchema).optional().nullable(),

  penisSizeImportance: preferenceImportanceSchema.default("open_to_all"),
  penisSizePreference: z.array(penisSizeSchema).optional().nullable(),
});

export type UserPreferencePhysical = z.infer<
  typeof UserPreferencePhysicalSchema
>;

/**
 * Lifestyle preferences
 */
export const UserPreferenceLifestyleSchema = z.object({
  religionImportance: preferenceImportanceSchema.default("open_to_all"),
  religionPreference: z.array(religionSchema).optional().nullable(),

  workoutImportance: preferenceImportanceSchema.default("open_to_all"),
  workoutFrequencyPreference: z.array(frequencySchema).optional().nullable(),
  gymTypePreference: z.array(gymTypeSchema).optional().nullable(),

  alcoholImportance: preferenceImportanceSchema.default("open_to_all"),
  alcoholPreference: z.array(frequencySchema).optional().nullable(),

  nightclubImportance: preferenceImportanceSchema.default("open_to_all"),
  nightclubPreference: z.array(frequencySchema).optional().nullable(),

  sexuallyActiveImportance: preferenceImportanceSchema.default("open_to_all"),
  sexuallyActivePreference: z.array(frequencySchema).optional().nullable(),

  outdoorsImportance: preferenceImportanceSchema.default("open_to_all"),
  outdoorsPreference: z.array(z.string()).optional().nullable(),
});

export type UserPreferenceLifestyle = z.infer<
  typeof UserPreferenceLifestyleSchema
>;

/**
 * Demographics preferences
 */
export const UserPreferenceDemographicsSchema = z.object({
  maritalStatusImportance: preferenceImportanceSchema.default("open_to_all"),
  maritalStatusPreference: z.array(maritalStatusSchema).optional().nullable(),

  kidsImportance: preferenceImportanceSchema.default("open_to_all"),
  kidsPreference: z.array(z.string()).optional().nullable(),

  occupationImportance: preferenceImportanceSchema.default("open_to_all"),
  occupationPreference: z.array(z.string()).optional().nullable(),

  businessOwnerImportance: preferenceImportanceSchema.default("open_to_all"),
  wantsBusinessOwnerPartner: z.boolean().optional().nullable(),
});

export type UserPreferenceDemographics = z.infer<
  typeof UserPreferenceDemographicsSchema
>;

/**
 * Relationship & General preferences
 */
export const UserPreferenceGeneralSchema = z.object({
  relationshipTypeImportance: preferenceImportanceSchema.default("open_to_all"),
  relationshipTypePreference: z.array(relationshipTypeSchema).optional().nullable(),

  eventCategoriesImportance: preferenceImportanceSchema.default("open_to_all"),
  eventCategoriesPreference: z.array(z.string()).optional().nullable(),

  favoriteColorImportance: preferenceImportanceSchema.default("open_to_all"),
  favoriteColorPreference: z.array(z.string()).optional().nullable(),

  favoriteFoodImportance: preferenceImportanceSchema.default("open_to_all"),
  favoriteFoodPreference: z.array(z.string()).optional().nullable(),

  dressCodeImportance: preferenceImportanceSchema.default("open_to_all"),
  dressCodePreference: z.array(dressCodeSchema).optional().nullable(),

  ageImportance: preferenceImportanceSchema.default("open_to_all"),
  ageMin: z.number().optional().nullable(),
  ageMax: z.number().optional().nullable(),
});

export type UserPreferenceGeneral = z.infer<
  typeof UserPreferenceGeneralSchema
>;

// ============================================================================
// COMPREHENSIVE DTOs
// ============================================================================

/**
 * Complete User Attributes DTO (what user HAS)
 */
export const DetailedUserAttributesDTO = z.object({
  // Physical
  physical: UserPhysicalAttributesSchema.optional(),
  // Lifestyle
  lifestyle: UserLifestyleAttributesSchema.optional(),
  // Demographics
  demographics: UserDemographicsSchema.optional(),
  // Housing
  housing: UserHousingSchema.optional(),
  // Metadata
  relationshipType: relationshipTypeSchema.optional().nullable(),
  eventCategoriesLiked: z.array(z.string()).optional().nullable(),
  questionnaireCompleted: z.boolean().optional(),
  questionnaireCompletedAt: z.string().datetime().optional().nullable(),
  questionnaireSkipped: z.boolean().optional(),
  questionnaireSkippedAt: z.string().datetime().optional().nullable(),
});

export type DetailedUserAttributes = z.infer<
  typeof DetailedUserAttributesDTO
>;

/**
 * Complete User Preferences DTO (what user SEEKS)
 */
export const DetailedUserPreferencesDTO = z.object({
  physical: UserPreferencePhysicalSchema.optional(),
  lifestyle: UserPreferenceLifestyleSchema.optional(),
  demographics: UserPreferenceDemographicsSchema.optional(),
  general: UserPreferenceGeneralSchema.optional(),
});

export type DetailedUserPreferences = z.infer<
  typeof DetailedUserPreferencesDTO
>;

/**
 * Combined: User Profile (Attributes + Preferences)
 */
export const CompleteUserProfileDTO = z.object({
  attributes: DetailedUserAttributesDTO,
  preferences: DetailedUserPreferencesDTO,
});

export type CompleteUserProfile = z.infer<typeof CompleteUserProfileDTO>;

// ============================================================================
// STEP-BY-STEP ONBOARDING DTOs
// ============================================================================

/**
 * Initial Signup (MINIMAL - done immediately)
 */
export const SignupPhase1DTO = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  fullName: z.string().min(2),
  dateOfBirth: z.string().date(),
  gender: z.enum(["male", "female", "non-binary", "other"]),
  locationCity: z.string().optional(),
  locationState: z.string().optional(),
});

export type SignupPhase1 = z.infer<typeof SignupPhase1DTO>;

/**
 * Phase 2: Basic Preferences (completed in onboarding wizard)
 */
export const OnboardingPhase2DTO = z.object({
  // Just the ESSENTIALS
  relationshipType: relationshipTypeSchema,
  ageRangeMin: z.number(),
  ageRangeMax: z.number(),
  distancePreference: z.number().optional(), // in km
  heightMin: z.number().optional(),
  heightMax: z.number().optional(),
});

export type OnboardingPhase2 = z.infer<typeof OnboardingPhase2DTO>;

/**
 * Phase 3: Detailed Profile (optional enrichment after onboarding)
 */
export const OnboardingPhase3DTO = z.object({
  physical: UserPhysicalAttributesSchema.optional(),
  lifestyle: UserLifestyleAttributesSchema.optional(),
  demographics: UserDemographicsSchema.optional(),
  housing: UserHousingSchema.optional(),
});

export type OnboardingPhase3 = z.infer<typeof OnboardingPhase3DTO>;

/**
 * Phase 4: Detailed Preferences (optional, can be progressive)
 */
export const OnboardingPhase4DTO = z.object({
  physicalPreferences: UserPreferencePhysicalSchema.optional(),
  lifestylePreferences: UserPreferenceLifestyleSchema.optional(),
  demographicPreferences: UserPreferenceDemographicsSchema.optional(),
});

export type OnboardingPhase4 = z.infer<typeof OnboardingPhase4DTO>;

// ============================================================================
// HELPER TYPES
// ============================================================================

export interface MatchResult {
  matchedUserId: string;
  score: number;
  scoreBreakdown: {
    physical: number;
    lifestyle: number;
    demographics: number;
    general: number;
  };
  percentageMatch: number;
}

export interface AttributeMatch {
  attributeName: string;
  userValue: string | string[] | number | boolean;
  preferenceImportance: PreferenceImportanceEnum;
  isMatch: boolean;
  score: number;
}
