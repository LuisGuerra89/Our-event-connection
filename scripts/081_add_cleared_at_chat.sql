-- Add cleared_at timestamps to track when each user cleared their chat view
ALTER TABLE chat_conversations 
ADD COLUMN IF NOT EXISTS user1_cleared_at TIMESTAMPTZ,
ADD COLUMN IF NOT EXISTS user2_cleared_at TIMESTAMPTZ;

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user1_cleared_at ON chat_conversations(user1_cleared_at DESC);
CREATE INDEX IF NOT EXISTS idx_chat_conversations_user2_cleared_at ON chat_conversations(user2_cleared_at DESC);
