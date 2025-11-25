-- Restore Secure RLS for Realtime
-- Now that we know Realtime works with permissive policies, we apply secure but optimized policies

-- 1. Drop the debug policy
DROP POLICY IF EXISTS "debug_realtime_select" ON chat_messages;

-- 2. Re-apply the optimized security function (from script 075)
-- This function is SECURITY DEFINER, which is fast and reliable for Realtime
CREATE OR REPLACE FUNCTION public.can_view_conversation(conv_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 
    FROM chat_conversations 
    WHERE id = conv_id 
    AND (user1_id = auth.uid() OR user2_id = auth.uid())
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- 3. Create the secure SELECT policy using the function
DROP POLICY IF EXISTS "chat_messages_select_conversation" ON chat_messages;
CREATE POLICY "chat_messages_select_conversation" ON chat_messages
  FOR SELECT
  USING (
    public.can_view_conversation(conversation_id)
  );

-- 4. Ensure sender can always see their own messages (fallback)
DROP POLICY IF EXISTS "chat_messages_select_own_sender" ON chat_messages;
CREATE POLICY "chat_messages_select_own_sender" ON chat_messages
  FOR SELECT
  USING (sender_id = auth.uid());

-- 5. Ensure INSERT/UPDATE policies are correct
DROP POLICY IF EXISTS "chat_messages_insert_own" ON chat_messages;
CREATE POLICY "chat_messages_insert_own" ON chat_messages
  FOR INSERT
  WITH CHECK (
    sender_id = auth.uid()
    AND public.can_view_conversation(conversation_id)
  );

DROP POLICY IF EXISTS "chat_messages_update_own" ON chat_messages;
CREATE POLICY "chat_messages_update_own" ON chat_messages
  FOR UPDATE
  USING (sender_id = auth.uid())
  WITH CHECK (sender_id = auth.uid());

-- 6. Verify policies
SELECT policyname, cmd, qual 
FROM pg_policies 
WHERE tablename = 'chat_messages' 
ORDER BY policyname;
