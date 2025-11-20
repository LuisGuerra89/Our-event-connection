-- Add missing enum types for the application

-- Event Types (matching DB constraint: speed_dating, social_mixer, activity, dinner, other)
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('event_type', 'Speed Dating', 1, 'active'),
  ('event_type', 'Social Mixer', 2, 'active'),
  ('event_type', 'Activity', 3, 'active'),
  ('event_type', 'Dinner', 4, 'active'),
  ('event_type', 'Other', 5, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Venue Types
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('venue_type', 'Indoor', 1, 'active'),
  ('venue_type', 'Outdoor', 2, 'active'),
  ('venue_type', 'Hybrid', 3, 'active'),
  ('venue_type', 'Online', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Gender Limitations
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('gender_limitation', 'All Genders', 1, 'active'),
  ('gender_limitation', 'Male Only', 2, 'active'),
  ('gender_limitation', 'Female Only', 3, 'active'),
  ('gender_limitation', 'Non-Binary Only', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Event Status (matching DB constraint: upcoming, ongoing, completed, cancelled)
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('event_status', 'Upcoming', 1, 'active'),
  ('event_status', 'Ongoing', 2, 'active'),
  ('event_status', 'Completed', 3, 'active'),
  ('event_status', 'Cancelled', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Gender Identity (for profiles)
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('gender', 'Male', 1, 'active'),
  ('gender', 'Female', 2, 'active'),
  ('gender', 'Non-Binary', 3, 'active'),
  ('gender', 'Prefer not to say', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Skin Tone
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('skin_tone', 'Fair', 1, 'active'),
  ('skin_tone', 'Medium', 2, 'active'),
  ('skin_tone', 'Olive', 3, 'active'),
  ('skin_tone', 'Brown', 4, 'active'),
  ('skin_tone', 'Dark', 5, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Hair Color
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('hair_color', 'Blonde', 1, 'active'),
  ('hair_color', 'Brown', 2, 'active'),
  ('hair_color', 'Black', 3, 'active'),
  ('hair_color', 'Red', 4, 'active'),
  ('hair_color', 'Gray', 5, 'active'),
  ('hair_color', 'White', 6, 'active'),
  ('hair_color', 'Other', 7, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Eye Color
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('eye_color', 'Brown', 1, 'active'),
  ('eye_color', 'Blue', 2, 'active'),
  ('eye_color', 'Green', 3, 'active'),
  ('eye_color', 'Hazel', 4, 'active'),
  ('eye_color', 'Gray', 5, 'active'),
  ('eye_color', 'Other', 6, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Body Type
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('body_type', 'Slim', 1, 'active'),
  ('body_type', 'Athletic', 2, 'active'),
  ('body_type', 'Average', 3, 'active'),
  ('body_type', 'Curvy', 4, 'active'),
  ('body_type', 'Muscular', 5, 'active'),
  ('body_type', 'Plus Size', 6, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Education Level
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('education_level', 'High School', 1, 'active'),
  ('education_level', 'Some College', 2, 'active'),
  ('education_level', 'Associate Degree', 3, 'active'),
  ('education_level', 'Bachelor Degree', 4, 'active'),
  ('education_level', 'Master Degree', 5, 'active'),
  ('education_level', 'Doctorate', 6, 'active'),
  ('education_level', 'Other', 7, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Occupation
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('occupation', 'Professional', 1, 'active'),
  ('occupation', 'Business Owner', 2, 'active'),
  ('occupation', 'Student', 3, 'active'),
  ('occupation', 'Healthcare', 4, 'active'),
  ('occupation', 'Education', 5, 'active'),
  ('occupation', 'Technology', 6, 'active'),
  ('occupation', 'Arts & Entertainment', 7, 'active'),
  ('occupation', 'Service Industry', 8, 'active'),
  ('occupation', 'Retired', 9, 'active'),
  ('occupation', 'Other', 10, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Relationship Status
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('relationship_status', 'Single', 1, 'active'),
  ('relationship_status', 'Divorced', 2, 'active'),
  ('relationship_status', 'Widowed', 3, 'active'),
  ('relationship_status', 'Separated', 4, 'active'),
  ('relationship_status', 'Other', 5, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Smoking Preference
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('smoking', 'Non-Smoker', 1, 'active'),
  ('smoking', 'Occasional Smoker', 2, 'active'),
  ('smoking', 'Regular Smoker', 3, 'active'),
  ('smoking', 'Prefer not to say', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Drinking Preference
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('drinking', 'Non-Drinker', 1, 'active'),
  ('drinking', 'Social Drinker', 2, 'active'),
  ('drinking', 'Regular Drinker', 3, 'active'),
  ('drinking', 'Prefer not to say', 4, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Religion
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('religion', 'Christian', 1, 'active'),
  ('religion', 'Catholic', 2, 'active'),
  ('religion', 'Jewish', 3, 'active'),
  ('religion', 'Muslim', 4, 'active'),
  ('religion', 'Hindu', 5, 'active'),
  ('religion', 'Buddhist', 6, 'active'),
  ('religion', 'Spiritual', 7, 'active'),
  ('religion', 'Agnostic', 8, 'active'),
  ('religion', 'Atheist', 9, 'active'),
  ('religion', 'Other', 10, 'active'),
  ('religion', 'Prefer not to say', 11, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;

-- Interests/Hobbies
INSERT INTO enums (enum_type, enum_title, display_order, status) VALUES
  ('interests', 'Sports', 1, 'active'),
  ('interests', 'Fitness', 2, 'active'),
  ('interests', 'Reading', 3, 'active'),
  ('interests', 'Movies', 4, 'active'),
  ('interests', 'Music', 5, 'active'),
  ('interests', 'Travel', 6, 'active'),
  ('interests', 'Cooking', 7, 'active'),
  ('interests', 'Gaming', 8, 'active'),
  ('interests', 'Art', 9, 'active'),
  ('interests', 'Photography', 10, 'active'),
  ('interests', 'Dancing', 11, 'active'),
  ('interests', 'Outdoor Activities', 12, 'active'),
  ('interests', 'Technology', 13, 'active'),
  ('interests', 'Fashion', 14, 'active'),
  ('interests', 'Volunteering', 15, 'active')
ON CONFLICT (enum_type, enum_title) DO UPDATE SET
  display_order = EXCLUDED.display_order,
  status = EXCLUDED.status;
