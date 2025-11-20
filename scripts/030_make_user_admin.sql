-- Script to promote a user to admin role
-- Replace 'user@example.com' with the actual email address of the user you want to make an admin

-- Update the user's role to 'admin' in the profiles table
UPDATE profiles
SET role = 'admin', updated_at = now()
WHERE email = 'luis.guerra@ntsprint.com'; -- <-- CHANGE THIS EMAIL

-- Verify the change
SELECT id, email, full_name, role, created_at
FROM profiles
WHERE email = 'luis.guerra@ntsprint.com'; -- <-- CHANGE THIS EMAIL

-- Alternative: If you know the user_id instead of email, use this:
-- UPDATE profiles
-- SET role = 'admin', updated_at = now()
-- WHERE id = 'USER_ID_HERE';

-- To see all users and their current roles:
-- SELECT id, email, full_name, role, created_at
-- FROM profiles
-- ORDER BY created_at DESC;
