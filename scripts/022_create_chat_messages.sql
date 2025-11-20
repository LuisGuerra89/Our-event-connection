-- Chat Conversations table
CREATE TABLE IF NOT EXISTS chat_conversations (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user1_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  user2_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  last_message_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  UNIQUE(user1_id, user2_id),
  CHECK (user1_id < user2_id)
);

-- Chat Messages table
CREATE TABLE IF NOT EXISTS chat_messages (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  conversation_id UUID REFERENCES chat_conversations(id) ON DELETE CASCADE,
  sender_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  message_text TEXT NOT NULL,
  is_read BOOLEAN DEFAULT false,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE chat_conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages ENABLE ROW LEVEL SECURITY;

-- Policies
DROP POLICY IF EXISTS "chat_conversations_select_own" ON chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_insert_own" ON chat_conversations;
DROP POLICY IF EXISTS "chat_conversations_update_own" ON chat_conversations;
DROP POLICY IF EXISTS "chat_messages_select_conversation" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_insert_own" ON chat_messages;
DROP POLICY IF EXISTS "chat_messages_update_own" ON chat_messages;

CREATE POLICY "chat_conversations_select_own" ON chat_conversations 
  FOR SELECT USING (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "chat_conversations_insert_own" ON chat_conversations 
  FOR INSERT WITH CHECK (auth.uid() = user1_id OR auth.uid() = user2_id);
CREATE POLICY "chat_conversations_update_own" ON chat_conversations 
  FOR UPDATE USING (auth.uid() = user1_id OR auth.uid() = user2_id);

CREATE POLICY "chat_messages_select_conversation" ON chat_messages 
  FOR SELECT USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );
CREATE POLICY "chat_messages_insert_own" ON chat_messages 
  FOR INSERT WITH CHECK (auth.uid() = sender_id);
CREATE POLICY "chat_messages_update_own" ON chat_messages 
  FOR UPDATE USING (
    EXISTS (
      SELECT 1 FROM chat_conversations 
      WHERE id = conversation_id 
      AND (user1_id = auth.uid() OR user2_id = auth.uid())
    )
  );

-- Indexes
CREATE INDEX idx_chat_conversations_user1 ON chat_conversations(user1_id);
CREATE INDEX idx_chat_conversations_user2 ON chat_conversations(user2_id);
CREATE INDEX idx_chat_messages_conversation ON chat_messages(conversation_id);
CREATE INDEX idx_chat_messages_sender ON chat_messages(sender_id);
CREATE INDEX idx_chat_messages_created_at ON chat_messages(created_at DESC);
