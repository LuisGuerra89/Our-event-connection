/**
 * Testing Guide for Detailed Profile Questionnaire
 * 
 * This file provides test cases, mock data, and examples for validating
 * the matchmaking algorithm and questionnaire system.
 */

// ============================================================================
// MOCK DATA FOR TESTING
// ============================================================================

export const MOCK_USER_ALICE = {
  id: 'alice-uuid',
  attributes: {
    hairColor: 'blonde',
    hairLength: 'long',
    eyeColor: 'blue',
    bodyType: 'athletic',
    complexion: 'fair',
    race: 'white',
    height: 165,
    religion: 'christian',
    workoutFrequency: 'often',
    gymType: 'commercial',
    alcoholConsumption: 'sometimes',
    nightclubFrequency: 'sometimes',
    sexuallyActiveFrequency: 'often',
    likesOutdoors: true,
    maritalStatus: 'single',
    kidsCount: 0,
    occupation: 'Software Engineer',
    ownsBusinessFlag: false,
    relationshipType: 'serious_long_term',
  },
};

export const MOCK_USER_BOB = {
  id: 'bob-uuid',
  attributes: {
    hairColor: 'dark_brown',
    hairLength: 'short',
    eyeColor: 'brown',
    bodyType: 'athletic',
    complexion: 'medium',
    race: 'hispanic_latino',
    height: 180,
    religion: 'agnostic',
    workoutFrequency: 'very_often',
    gymType: 'crossfit',
    alcoholConsumption: 'rarely',
    nightclubFrequency: 'rarely',
    sexuallyActiveFrequency: 'very_often',
    likesOutdoors: true,
    maritalStatus: 'single',
    kidsCount: 0,
    occupation: 'Fitness Trainer',
    ownsBusinessFlag: true,
    relationshipType: 'serious_long_term',
  },
};

export const MOCK_USER_CHARLIE = {
  id: 'charlie-uuid',
  attributes: {
    hairColor: 'red',
    hairLength: 'medium',
    eyeColor: 'green',
    bodyType: 'plus_size',
    complexion: 'fair',
    race: 'white',
    height: 155,
    religion: 'jewish',
    workoutFrequency: 'rarely',
    gymType: 'yoga',
    alcoholConsumption: 'often',
    nightclubFrequency: 'often',
    sexuallyActiveFrequency: 'sometimes',
    likesOutdoors: false,
    maritalStatus: 'divorced',
    kidsCount: 1,
    occupation: 'Artist',
    ownsBusinessFlag: true,
    relationshipType: 'casual_dating',
  },
};

// Alice's preferences (what she seeks)
export const ALICE_PREFERENCES = {
  id: 'alice-prefs-uuid',
  preferences: {
    // Physical preferences
    hairColorImportance: 'very_important',
    hairColorPreference: ['dark_brown', 'black'],
    
    bodyTypeImportance: 'important',
    bodyTypePreference: ['athletic', 'muscular'],
    
    raceImportance: 'open_to_all', // She's flexible
    racePreference: null,
    
    heightImportance: 'somewhat_important',
    heightMin: 175,
    heightMax: 190,
    
    // Lifestyle preferences
    religionImportance: 'not_important',
    religionPreference: null,
    
    workoutImportance: 'very_important',
    workoutFrequencyPreference: ['often', 'very_often'],
    
    alcoholImportance: 'important',
    alcoholPreference: ['rarely', 'sometimes'],
    
    outdoorsImportance: 'important',
    outdoorsPreference: ['yes'],
    
    // Demographics
    kidsImportance: 'very_important',
    kidsPreference: ['no', '0'],
    
    // General
    relationshipTypeImportance: 'very_important',
    relationshipTypePreference: ['serious_long_term'],
    
    ageMin: 28,
    ageMax: 40,
    ageImportance: 'important',
  },
};

// ============================================================================
// TEST CASES
// ============================================================================

export const TEST_CASES = {
  /**
   * Test 1: HIGH MATCH (Alice vs Bob)
   * Expected: ~85-90% match
   * Reasoning:
   * - Both athletic (very_important: +weight)
   * - Both work out often (very_important: +weight)
   * - Both like outdoors (important: +weight)
   * - No kids (very_important: +weight)
   * - Serious relationship type (very_important: +weight)
   * - Hair color different BUT not important (no penalty)
   * - Bob is tall enough (175-190 range: ✓)
   */
  highMatch: {
    name: 'Alice vs Bob - High Match',
    user: ALICE_PREFERENCES,
    potentialMatch: MOCK_USER_BOB,
    expectedScoreRange: [80, 95],
    reasoning: 'Similar lifestyle, aligned preferences, multiple matches on important attributes',
  },

  /**
   * Test 2: LOW MATCH (Alice vs Charlie)
   * Expected: ~30-45% match
   * Reasoning:
   * - Different body type (important mismatch: -weight)
   * - Doesn't work out (very_important mismatch: -weight)
   * - Likes nightclubs/drinking (important mismatch: -weight)
   * - Has kids (very_important mismatch: -weight)
   * - Casual dating vs serious (very_important mismatch: -weight)
   * - Too short (155 < 175 minimum: ✗)
   */
  lowMatch: {
    name: 'Alice vs Charlie - Low Match',
    user: ALICE_PREFERENCES,
    potentialMatch: MOCK_USER_CHARLIE,
    expectedScoreRange: [20, 40],
    reasoning: 'Misaligned lifestyle, conflicting preferences on important attributes',
  },

  /**
   * Test 3: OPEN_TO_ALL flexibility
   * Expected: Should not penalize unmatched attribute
   * If Alice's race preference = OPEN_TO_ALL:
   * - Bob (Hispanic) vs Alice (seeks White): No penalty
   */
  openToAll: {
    name: 'OPEN_TO_ALL should not reduce score',
    setup: () => {
      const prefs = { ...ALICE_PREFERENCES };
      prefs.preferences.raceImportance = 'open_to_all';
      prefs.preferences.racePreference = null;
      return prefs;
    },
    potentialMatch: MOCK_USER_BOB,
    expectedScoreIncrease: true,
    reasoning: 'OPEN_TO_ALL removes matching constraint',
  },

  /**
   * Test 4: Multiple OPEN_TO_ALL preferences
   * User with many OPEN_TO_ALL should have high match rate
   */
  multipleOpenToAll: {
    name: 'Multiple OPEN_TO_ALL increases match pool',
    setup: () => {
      const prefs = { ...ALICE_PREFERENCES };
      prefs.preferences.raceImportance = 'open_to_all';
      prefs.preferences.religionImportance = 'open_to_all';
      prefs.preferences.alcoholImportance = 'open_to_all';
      return prefs;
    },
    potentialMatch: MOCK_USER_CHARLIE,
    expectedBehavior: 'Should match more attributes, increasing score',
  },

  /**
   * Test 5: Range-based matching (age, height)
   * Bob: age 32, height 180
   * Alice: seeks 28-40 age, 175-190 height
   * Expected: Both match ✓
   */
  rangeMatching: {
    name: 'Range-based attributes (age, height) should match correctly',
    user: ALICE_PREFERENCES,
    potentialMatch: MOCK_USER_BOB,
    expectedMatches: ['height', 'age'],
  },

  /**
   * Test 6: Weighted scoring by importance
   * very_important (weight 5) > important (weight 3) > somewhat_important (weight 2) > not_important (weight 1)
   * Same match but different importance = different score
   */
  weightedScoring: {
    name: 'Importance levels should weight scores correctly',
    test: `
      Scenario A: workoutImportance = 'very_important' (weight 5)
      Scenario B: workoutImportance = 'not_important' (weight 1)
      
      Both have Bob with workoutFrequency = 'very_often' (matches preference)
      Expected: Scenario A score > Scenario B score
    `,
  },

  /**
   * Test 7: Category weighting
   * Physical (35%) vs Lifestyle (30%) vs Demographics (20%) vs General (15%)
   * If only physical matches: max 35% score
   * If physical + lifestyle match: higher score
   */
  categoryWeighting: {
    name: 'Category weights should apply correctly',
    test: `
      User matches on:
      - Physical attributes: All match (100% of 35%)
      - Lifestyle: All match (100% of 30%)
      - Demographics: All match (100% of 20%)
      - General: No match (0% of 15%)
      
      Expected: (1.0 * 0.35) + (1.0 * 0.30) + (1.0 * 0.20) + (0 * 0.15) = 85%
    `,
  },
};

// ============================================================================
// UNIT TEST EXAMPLES (Jest/Vitest syntax)
// ============================================================================

/*
import { calculateMatchScore } from '@/lib/matchmaking/algorithm';

describe('Matchmaking Algorithm', () => {
  describe('Basic Matching', () => {
    test('should calculate high match for compatible users', () => {
      const result = calculateMatchScore(ALICE_PREFERENCES, MOCK_USER_BOB);
      expect(result.percentageMatch).toBeGreaterThan(80);
      expect(result.percentageMatch).toBeLessThan(95);
    });

    test('should calculate low match for incompatible users', () => {
      const result = calculateMatchScore(ALICE_PREFERENCES, MOCK_USER_CHARLIE);
      expect(result.percentageMatch).toBeLessThan(50);
    });
  });

  describe('OPEN_TO_ALL Logic', () => {
    test('should not penalize OPEN_TO_ALL preferences', () => {
      const prefs1 = { ...ALICE_PREFERENCES };
      const prefs2 = { ...ALICE_PREFERENCES };
      
      // Bob's race is Hispanic
      // Alice preference 1: raceImportance = 'important', racePreference = ['white']
      // Alice preference 2: raceImportance = 'open_to_all'
      
      prefs1.preferences.raceImportance = 'important';
      prefs1.preferences.racePreference = ['white'];
      
      prefs2.preferences.raceImportance = 'open_to_all';
      
      const result1 = calculateMatchScore(prefs1, MOCK_USER_BOB);
      const result2 = calculateMatchScore(prefs2, MOCK_USER_BOB);
      
      // result2 should be higher (no penalty for race mismatch)
      expect(result2.percentageMatch).toBeGreaterThan(result1.percentageMatch);
    });
  });

  describe('Range-based Matching', () => {
    test('should match within height range', () => {
      // Bob: height 180, Alice seeks 175-190
      const result = calculateMatchScore(ALICE_PREFERENCES, MOCK_USER_BOB);
      const heightMatch = result.categories.physical.attributeMatches.find(
        m => m.attributeName === 'height'
      );
      expect(heightMatch?.matches).toBe(true);
    });

    test('should not match outside age range', () => {
      const tooOldUser = { ...MOCK_USER_BOB, attributes: { ...MOCK_USER_BOB.attributes, age: 50 } };
      const result = calculateMatchScore(ALICE_PREFERENCES, tooOldUser);
      const ageMatch = result.categories.demographics.attributeMatches.find(
        m => m.attributeName === 'age'
      );
      expect(ageMatch?.matches).toBe(false);
    });
  });

  describe('Scoring Weights', () => {
    test('should weight very_important higher than not_important', () => {
      // Create two preference sets with same matches but different importance
      // Verify score difference
    });
  });

  describe('Category Weighting', () => {
    test('should apply physical (35%), lifestyle (30%), demographics (20%), general (15%)', () => {
      // Create user matching all physical, lifestyle, demographics but no general
      // Expected: score ≈ 85%
    });
  });
});
*/

// ============================================================================
// INTEGRATION TEST EXAMPLE
// ============================================================================

/*
describe('API Integration Tests', () => {
  beforeAll(async () => {
    // Create test users in database
    // Save their attributes and preferences
  });

  test('POST /api/user/attributes should save correctly', async () => {
    const response = await fetch('/api/user/attributes', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        physical: MOCK_USER_ALICE.attributes.physical,
        lifestyle: MOCK_USER_ALICE.attributes.lifestyle,
      }),
    });
    expect(response.status).toBe(200);
  });

  test('POST /api/user/preferences should save correctly', async () => {
    const response = await fetch('/api/user/preferences', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(ALICE_PREFERENCES.preferences),
    });
    expect(response.status).toBe(200);
  });

  test('POST /api/matches/calculate should return top matches', async () => {
    const response = await fetch('/api/matches/calculate', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ limit: 50, minScore: 30 }),
    });
    expect(response.status).toBe(200);
    const { topMatches } = await response.json();
    expect(Array.isArray(topMatches)).toBe(true);
    expect(topMatches[0].percentageMatch).toBeGreaterThanOrEqual(30);
  });
});
*/

// ============================================================================
// MANUAL TESTING CHECKLIST
// ============================================================================

export const MANUAL_TEST_CHECKLIST = `
ONBOARDING FLOW:
□ Phase 2 (Essential Preferences) saves without errors
□ Age range slider works correctly (e.g., 25-45)
□ Relationship type dropdown shows all 7 options
□ Moving to Phase 3 persists Phase 2 data

□ Phase 3 (Physical) shows all 12 attribute fields
□ All dropdowns populate correctly
□ Can select multiple options (if applicable)
□ Moving to Phase 4 persists Phase 3 data

□ Phase 4 (Lifestyle) shows all 7 fields
□ Radio buttons/checkboxes work correctly
□ Moving to Phase 5 persists Phase 4 data

□ Phase 5 (Preferences) shows importance selector
□ Importance levels: 🔓 Open to all | Not important | Somewhat | Important | ⭐ Very
□ Selecting OPEN_TO_ALL hides preference values
□ Completion triggers match calculation

DATABASE VERIFICATION:
□ Verify user_attributes row created with questionnaire_completed = true
□ Verify user_preferences row created with importance levels
□ Verify matches table populated with scores
□ Check RLS policies allow SELECT of matches

API TESTING:
□ GET /api/user/attributes returns correct data
□ GET /api/user/preferences returns correct data
□ GET /api/matches/calculate?limit=10 returns top 10 matches
□ Matches sorted by percentageMatch descending

ALGORITHM VERIFICATION:
□ Test case 1: Alice vs Bob score 80-95%
□ Test case 2: Alice vs Charlie score 20-40%
□ Test case 3: OPEN_TO_ALL doesn't penalize
□ Test case 4: Range matching works (height, age)
□ Test case 5: Weighted scoring by importance level

PERFORMANCE:
□ Match calculation < 1 second for 100 users
□ Match calculation < 10 seconds for 1000 users
□ API response time < 200ms
□ Database queries use indexes (EXPLAIN ANALYZE)

EDGE CASES:
□ User with no attributes defined
□ User with all OPEN_TO_ALL preferences
□ User older than preference max age
□ User with NULL height value
□ Preference values not in dropdown options
□ Rapid successive API calls
□ Concurrent user updates

SECURITY:
□ Cannot access other user's preferences via GET
□ RLS prevents unauthorized attribute reads
□ Match scores only visible to owning user
□ API validates user authentication
□ XSS protection on form inputs
□ SQL injection prevention (use parameterized queries)
`;

// ============================================================================
// PERFORMANCE BENCHMARKS
// ============================================================================

export const PERFORMANCE_BENCHMARKS = {
  calculateMatchScore: {
    description: 'Time to calculate one match score',
    expected: '< 1ms',
    with1000Users: '< 1s per user',
  },
  apiUserAttributes: {
    description: 'Time to save user attributes',
    expected: '< 100ms',
  },
  apiUserPreferences: {
    description: 'Time to save user preferences',
    expected: '< 100ms',
  },
  apiCalculateMatches: {
    description: 'Time to calculate all matches for one user',
    with100Users: '< 500ms',
    with1000Users: '< 5s',
  },
  databaseIndexes: {
    description: 'Must create these indexes',
    indexes: [
      'user_preferences(hair_color_importance, body_type_importance)',
      'matches(user_id, match_score DESC)',
      'user_attributes(questionnaire_completed)',
    ],
  },
};

// ============================================================================
// EXPORT FOR TESTING
// ============================================================================

export default {
  MOCK_USER_ALICE,
  MOCK_USER_BOB,
  MOCK_USER_CHARLIE,
  ALICE_PREFERENCES,
  TEST_CASES,
  MANUAL_TEST_CHECKLIST,
  PERFORMANCE_BENCHMARKS,
};
