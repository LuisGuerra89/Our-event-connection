-- Allow users to chat with their referrals
-- Users should be able to chat with people they referred and people who referred them

-- Add helper function to check if users are in a referral relationship
CREATE OR REPLACE FUNCTION are_users_in_referral_relationship(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  -- Check if user1 referred user2 OR user2 referred user1
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE (id = user1_id AND referred_by = user2_id)
       OR (id = user2_id AND referred_by = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

COMMENT ON FUNCTION are_users_in_referral_relationship IS 
  'Returns true if two users are in a referral relationship (one referred the other)';

-- Update chat conversation policies to allow referrals to chat
DROP POLICY IF EXISTS "chat_conversations_select_own" ON chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_insert_own" ON chat_conversations;

-- Allow selecting conversations if you're a participant OR in referral relationship
CREATE POLICY "chat_conversations_select_own" ON chat_conversations 
  FOR SELECT USING (
    auth.uid() = user1_id 
    OR auth.uid() = user2_id
  );

-- Allow creating conversations if you're a participant OR in referral relationship
CREATE POLICY "chat_conversations_insert_own" ON chat_conversations 
  FOR INSERT WITH CHECK (
    (auth.uid() = user1_id OR auth.uid() = user2_id)
    AND (
      -- Allow if users are in referral relationship
      are_users_in_referral_relationship(user1_id, user2_id)
      -- OR if they have a match
      OR EXISTS (
        SELECT 1 FROM matches
        WHERE (user1_id = chat_conversations.user1_id AND user2_id = chat_conversations.user2_id)
           OR (user1_id = chat_conversations.user2_id AND user2_id = chat_conversations.user1_id)
      )
    )
  );

COMMENT ON POLICY "chat_conversations_insert_own" ON chat_conversations IS 
  'Users can create conversations with their matches or people in their referral network';
