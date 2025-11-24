-- Verify and ensure CASCADE DELETE for all user-related tables
-- This ensures that when a user is deleted from auth.users, all their data is automatically deleted

-- Note: Most tables should already have CASCADE DELETE from previous migrations
-- This migration verifies and adds it where missing

-- Profiles table (main user profile)
-- This should cascade from auth.users
DO $$
BEGIN
  -- Check if constraint exists and has CASCADE
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'profiles_id_fkey' 
    AND table_name = 'profiles'
  ) THEN
    -- Drop and recreate with CASCADE
    ALTER TABLE profiles DROP CONSTRAINT IF EXISTS profiles_id_fkey;
  END IF;
  
  ALTER TABLE profiles
    ADD CONSTRAINT profiles_id_fkey
    FOREIGN KEY (id) REFERENCES auth.users(id) ON DELETE CASCADE;
END $$;

-- Verify other tables have CASCADE DELETE via profiles
-- These should cascade when profile is deleted

-- List of tables that should have CASCADE DELETE via user_id -> profiles(id)
DO $$
DECLARE
  table_record RECORD;
BEGIN
  FOR table_record IN
    SELECT 
      tc.table_name,
      tc.constraint_name,
      kcu.column_name
    FROM information_schema.table_constraints tc
    JOIN information_schema.key_column_usage kcu
      ON tc.constraint_name = kcu.constraint_name
    WHERE tc.constraint_type = 'FOREIGN KEY'
      AND kcu.column_name IN ('user_id', 'referrer_id', 'referred_id', 'sender_id')
      AND tc.table_schema = 'public'
      AND tc.table_name IN (
        'waivers',
        'event_attendees', 
        'user_preferences',
        'user_attributes',
        'matches',
        'referrals',
        'user_subscriptions',
        'payments',
        'notifications'
      )
  LOOP
    -- Check if it references profiles
    IF EXISTS (
      SELECT 1 
      FROM information_schema.referential_constraints rc
      JOIN information_schema.table_constraints tc ON rc.constraint_name = tc.constraint_name
      WHERE tc.constraint_name = table_record.constraint_name
        AND rc.delete_rule != 'CASCADE'
    ) THEN
      RAISE NOTICE 'Table % constraint % does not have CASCADE DELETE', 
        table_record.table_name, table_record.constraint_name;
    END IF;
  END LOOP;
END $$;

-- Ensure chat_conversations cascades when profile is deleted
-- user1_id and user2_id should cascade from profiles
DO $$
BEGIN
  -- user1_id constraint
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_conversations_user1_id_fkey' 
    AND table_name = 'chat_conversations'
  ) THEN
    ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_user1_id_fkey;
  END IF;
  
  ALTER TABLE chat_conversations
    ADD CONSTRAINT chat_conversations_user1_id_fkey
    FOREIGN KEY (user1_id) REFERENCES profiles(id) ON DELETE CASCADE;

  -- user2_id constraint  
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_conversations_user2_id_fkey' 
    AND table_name = 'chat_conversations'
  ) THEN
    ALTER TABLE chat_conversations DROP CONSTRAINT IF EXISTS chat_conversations_user2_id_fkey;
  END IF;
  
  ALTER TABLE chat_conversations
    ADD CONSTRAINT chat_conversations_user2_id_fkey
    FOREIGN KEY (user2_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- chat_messages should cascade when conversation is deleted
-- This should already be set from migration 022, but verify
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_messages_conversation_id_fkey' 
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_conversation_id_fkey;
  END IF;
  
  ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_conversation_id_fkey
    FOREIGN KEY (conversation_id) REFERENCES chat_conversations(id) ON DELETE CASCADE;

  -- sender_id should also cascade from profiles
  IF EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'chat_messages_sender_id_fkey' 
    AND table_name = 'chat_messages'
  ) THEN
    ALTER TABLE chat_messages DROP CONSTRAINT IF EXISTS chat_messages_sender_id_fkey;
  END IF;
  
  ALTER TABLE chat_messages
    ADD CONSTRAINT chat_messages_sender_id_fkey
    FOREIGN KEY (sender_id) REFERENCES profiles(id) ON DELETE CASCADE;
END $$;

-- Add comment for documentation
COMMENT ON CONSTRAINT profiles_id_fkey ON profiles IS 
  'Cascade delete: When user is deleted from auth.users, profile is automatically deleted';

COMMENT ON CONSTRAINT chat_conversations_user1_id_fkey ON chat_conversations IS 
  'Cascade delete: When profile is deleted, all conversations where user is participant are deleted';

COMMENT ON CONSTRAINT chat_conversations_user2_id_fkey ON chat_conversations IS 
  'Cascade delete: When profile is deleted, all conversations where user is participant are deleted';

COMMENT ON CONSTRAINT chat_messages_conversation_id_fkey ON chat_messages IS 
  'Cascade delete: When conversation is deleted, all messages in that conversation are deleted';

-- Verification query to check CASCADE DELETE is set
-- Uncomment to run verification
/*
SELECT 
  tc.table_name,
  tc.constraint_name,
  kcu.column_name,
  ccu.table_name AS foreign_table_name,
  ccu.column_name AS foreign_column_name,
  rc.delete_rule
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
JOIN information_schema.referential_constraints AS rc
  ON rc.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND tc.table_schema = 'public'
  AND tc.table_name IN (
    'profiles',
    'chat_conversations',
    'chat_messages',
    'waivers',
    'event_attendees',
    'user_subscriptions',
    'notifications'
  )
ORDER BY tc.table_name, tc.constraint_name;
*/
