-- Insert protected event categories for the new menu structure
-- These categories should not be deleted or edited from the admin panel

-- Add a column to mark categories as protected (system categories)
ALTER TABLE event_categories ADD COLUMN IF NOT EXISTS is_protected BOOLEAN DEFAULT false;

-- Insert the new protected categories
INSERT INTO event_categories (name, slug, description, display_order, status, is_protected)
VALUES 
  (
    'After Work Activities',
    'after-work-activities',
    'Social events and activities happening after work hours. Meet like-minded singles in a relaxed environment.',
    1,
    'active',
    true
  ),
  (
    'Extreme Sports',
    'extreme-sports',
    'Experience adrenaline-pumping extreme sports activities with fellow adventure enthusiasts.',
    2,
    'active',
    true
  ),
  (
    'Water Sports',
    'water-sports',
    'Enjoy water-based activities and sports with fellow water enthusiasts in your area.',
    3,
    'active',
    true
  ),
  (
    'Weekend Activities',
    'weekend-activities',
    'Explore weekend activities and events perfect for meeting other singles who enjoy similar hobbies and interests.',
    4,
    'active',
    true
  ),
  (
    'Winter Sports',
    'winter-sports',
    'Experience winter sports and snow activities with fellow cold-weather enthusiasts in your area.',
    5,
    'active',
    true
  ),
  (
    'Travel – Domestic / International',
    'travel',
    'Join group travel experiences and trips designed for singles. Explore domestic destinations and international adventures with fellow travelers.',
    6,
    'active',
    true
  )
ON CONFLICT (slug) DO UPDATE SET is_protected = true;

-- Update RLS policies to prevent deletion/editing of protected categories

-- Drop existing policies
DROP POLICY IF EXISTS "event_categories_update_admin" ON event_categories;
DROP POLICY IF EXISTS "event_categories_delete_admin" ON event_categories;

-- Create new policies that prevent modifying protected categories
CREATE POLICY "event_categories_update_admin" ON event_categories FOR UPDATE 
  USING (is_admin() AND NOT is_protected)
  WITH CHECK (is_admin() AND NOT is_protected);

CREATE POLICY "event_categories_delete_admin" ON event_categories FOR DELETE 
  USING (is_admin() AND NOT is_protected);

-- Create a policy to allow selecting protected categories (read-only)
DROP POLICY IF EXISTS "event_categories_select_protected" ON event_categories;
CREATE POLICY "event_categories_select_protected" ON event_categories FOR SELECT 
  USING (true);

-- Add comment to the is_protected column
COMMENT ON COLUMN event_categories.is_protected IS 'System-protected categories that cannot be deleted or edited from the admin panel. These are core menu categories.';
