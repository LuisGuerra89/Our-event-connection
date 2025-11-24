-- FINAL CONSOLIDATED MIGRATION SCRIPT
-- Includes all fixes for:
-- 1. User Registration & Role ID
-- 2. Referral System (Triggers, Rewards, Notifications)
-- 3. Chat System (RLS, Referrals, Realtime)

BEGIN;

-- =================================================================
-- 1. SCHEMA UPDATES & ROLES
-- =================================================================

-- Add role_id to profiles if not exists
DO $$ 
BEGIN 
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'profiles' AND column_name = 'role_id') THEN
        ALTER TABLE profiles ADD COLUMN role_id UUID REFERENCES roles(id);
    END IF;
END $$;

-- Ensure default roles exist
INSERT INTO roles (role_name) VALUES ('user'), ('admin') ON CONFLICT (role_name) DO NOTHING;

-- =================================================================
-- 2. REFERRAL SYSTEM FUNCTIONS & TRIGGERS
-- =================================================================

-- Function: Process Referral (Awards, Counts, Notifications)
CREATE OR REPLACE FUNCTION public.process_referral()
RETURNS TRIGGER AS $$
DECLARE
  referrer_code TEXT;
  referrer_id UUID;
  new_referral_count INTEGER;
BEGIN
  -- Only proceed if referred_by is set and was previously null
  IF NEW.referred_by IS NOT NULL AND (OLD.referred_by IS NULL OR OLD.referred_by IS DISTINCT FROM NEW.referred_by) THEN
    
    -- Get referrer details
    SELECT id, referral_code INTO referrer_id, referrer_code
    FROM profiles
    WHERE id = NEW.referred_by;

    IF referrer_id IS NOT NULL THEN
      -- Create referral record
      INSERT INTO referrals (referrer_id, referred_id, barcode, status, referral_date)
      VALUES (referrer_id, NEW.id, referrer_code, 'completed', NOW())
      ON CONFLICT (barcode) DO NOTHING;

      -- Increment referral count
      UPDATE profiles
      SET referral_count = COALESCE(referral_count, 0) + 1
      WHERE id = referrer_id
      RETURNING referral_count INTO new_referral_count;

      -- Check for milestones (e.g., every 25 referrals)
      IF new_referral_count % 25 = 0 THEN
        UPDATE profiles
        SET free_events_earned = COALESCE(free_events_earned, 0) + 1
        WHERE id = referrer_id;
      END IF;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Process Referral on UPDATE of referred_by
DROP TRIGGER IF EXISTS process_referral_trigger ON profiles;
CREATE TRIGGER process_referral_trigger
  AFTER UPDATE OF referred_by ON profiles
  FOR EACH ROW
  WHEN (NEW.referred_by IS NOT NULL AND OLD.referred_by IS NULL)
  EXECUTE FUNCTION public.process_referral();

-- Function: Notify Referral Reward
CREATE OR REPLACE FUNCTION notify_referral_reward()
RETURNS TRIGGER AS $$
DECLARE
  referrer_count INTEGER;
BEGIN
  SELECT referral_count INTO referrer_count
  FROM profiles 
  WHERE id = NEW.referrer_id;
  
  -- Notification: New Referral
  INSERT INTO notifications (user_id, type, title, message, read, created_at)
  VALUES (
    NEW.referrer_id,
    'referral',
    'New Referral!',
    'Someone joined using your referral code!',
    false,
    NOW()
  );
  
  -- Notification: Milestone
  IF referrer_count % 25 = 0 THEN
    INSERT INTO notifications (user_id, type, title, message, read, created_at)
    VALUES (
      NEW.referrer_id,
      'referral',
      'Referral Milestone Reached!',
      format('Congratulations! You''ve reached %s referrals and earned a free event!', referrer_count),
      false,
      NOW()
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger: Notify on Referral Insert
DROP TRIGGER IF EXISTS trigger_notify_referral_reward ON referrals;
CREATE TRIGGER trigger_notify_referral_reward
  AFTER INSERT ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_reward();

-- =================================================================
-- 3. CHAT SYSTEM & REALTIME
-- =================================================================

-- Helper: Check Referral Relationship
CREATE OR REPLACE FUNCTION are_users_in_referral_relationship(user1_id UUID, user2_id UUID)
RETURNS BOOLEAN AS $$
BEGIN
  RETURN EXISTS (
    SELECT 1 FROM profiles
    WHERE (id = user1_id AND referred_by = user2_id)
       OR (id = user2_id AND referred_by = user1_id)
  );
END;
$$ LANGUAGE plpgsql SECURITY DEFINER STABLE;

-- Helper: Check Conversation Access (Optimized for Realtime)
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

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.can_view_conversation TO authenticated;

-- RLS: Chat Conversations
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_conversations_select_own" ON chat_conversations;
CREATE POLICY "chat_conversations_select_own" ON chat_conversations 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);

DROP POLICY IF EXISTS "chat_conversations_insert_own" ON chat_conversations;
CREATE POLICY "chat_conversations_insert_own" ON chat_conversations 
  FOR INSERT WITH CHECK (
    (auth.uid() = user1_id OR auth.uid() = user2_id)
    AND (
      are_users_in_referral_relationship(user1_id, user2_id)
      OR EXISTS (
        SELECT 1 FROM matches
        WHERE (user1_id = chat_conversations.user1_id AND user2_id = chat_conversations.user2_id)
           OR (user1_id = chat_conversations.user2_id AND user2_id = chat_conversations.user1_id)
      )
    )
  );

-- RLS: Chat Messages (Optimized)
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "chat_messages_select_conversation" ON chat_messages;
CREATE POLICY "chat_messages_select_conversation" ON chat_messages
  FOR SELECT USING (public.can_view_conversation(conversation_id));

DROP POLICY IF EXISTS "chat_messages_select_own_sender" ON chat_messages;
CREATE POLICY "chat_messages_select_own_sender" ON chat_messages
  FOR SELECT USING (sender_id = auth.uid());

DROP POLICY IF EXISTS "chat_messages_insert_own" ON chat_messages;
CREATE POLICY "chat_messages_insert_own" ON chat_messages
  FOR INSERT WITH CHECK (
    sender_id = auth.uid()
    AND public.can_view_conversation(conversation_id)
  );

-- =================================================================
-- 4. REALTIME CONFIGURATION
-- =================================================================

-- Force Replica Identity FULL (Critical for Realtime)
ALTER TABLE chat_messages REPLICA IDENTITY FULL;
ALTER TABLE chat_conversations REPLICA IDENTITY FULL;

-- Configure Publication
DO $$
BEGIN
  -- Remove from custom publication if exists
  DROP PUBLICATION IF EXISTS supabase_realtime_messages_publication;
  
  -- Add to default publication
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
  ALTER PUBLICATION supabase_realtime ADD TABLE chat_conversations;
EXCEPTION
  WHEN duplicate_object THEN NULL;
END $$;

COMMIT;
