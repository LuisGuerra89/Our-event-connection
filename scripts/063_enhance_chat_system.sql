-- Enhance Chat System
-- This migration improves the existing chat system with additional features

-- Add new columns to chat_messages table
ALTER TABLE chat_messages 
ADD COLUMN IF NOT EXISTS message_type TEXT DEFAULT 'text' CHECK (message_type IN ('text', 'image', 'file')),
ADD COLUMN IF NOT EXISTS attachment_url TEXT,
ADD COLUMN IF NOT EXISTS metadata JSONB DEFAULT '{}'::jsonb;

-- Add unread_by column to track who hasn't read the message
ALTER TABLE chat_messages
ADD COLUMN IF NOT EXISTS unread_by UUID[];

-- Create index for better performance on unread messages
CREATE INDEX IF NOT EXISTS idx_chat_messages_unread ON chat_messages USING GIN (unread_by);

-- Function to get or create a conversation between two users
CREATE OR REPLACE FUNCTION get_or_create_conversation(
  p_user1_id UUID,
  p_user2_id UUID
)
RETURNS UUID AS $$
DECLARE
  v_conversation_id UUID;
  v_smaller_id UUID;
  v_larger_id UUID;
BEGIN
  -- Ensure user1_id < user2_id for the UNIQUE constraint
  IF p_user1_id < p_user2_id THEN
    v_smaller_id := p_user1_id;
    v_larger_id := p_user2_id;
  ELSE
    v_smaller_id := p_user2_id;
    v_larger_id := p_user1_id;
  END IF;

  -- Try to find existing conversation
  SELECT id INTO v_conversation_id
  FROM chat_conversations
  WHERE user1_id = v_smaller_id AND user2_id = v_larger_id;

  -- If not found, create new conversation
  IF v_conversation_id IS NULL THEN
    INSERT INTO chat_conversations (user1_id, user2_id)
    VALUES (v_smaller_id, v_larger_id)
    RETURNING id INTO v_conversation_id;
  END IF;

  RETURN v_conversation_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to mark all messages in a conversation as read by a user
CREATE OR REPLACE FUNCTION mark_conversation_as_read(
  p_conversation_id UUID,
  p_user_id UUID
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  -- Update messages to remove user from unread_by array
  UPDATE chat_messages
  SET 
    unread_by = array_remove(unread_by, p_user_id),
    is_read = CASE 
      WHEN sender_id != p_user_id THEN true 
      ELSE is_read 
    END
  WHERE conversation_id = p_conversation_id
    AND p_user_id = ANY(unread_by);
  
  GET DIAGNOSTICS v_count = ROW_COUNT;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to get unread message count for a user
CREATE OR REPLACE FUNCTION get_unread_message_count(p_user_id UUID)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER;
BEGIN
  SELECT COUNT(*)::INTEGER INTO v_count
  FROM chat_messages cm
  JOIN chat_conversations cc ON cm.conversation_id = cc.id
  WHERE (cc.user1_id = p_user_id OR cc.user2_id = p_user_id)
    AND cm.sender_id != p_user_id
    AND p_user_id = ANY(cm.unread_by);
  
  RETURN COALESCE(v_count, 0);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger function to update last_message_at when a new message is sent
CREATE OR REPLACE FUNCTION update_conversation_timestamp()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE chat_conversations
  SET 
    last_message_at = NEW.created_at,
    updated_at = NEW.created_at
  WHERE id = NEW.conversation_id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger for updating conversation timestamp
DROP TRIGGER IF EXISTS trigger_update_conversation_timestamp ON chat_messages;
CREATE TRIGGER trigger_update_conversation_timestamp
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION update_conversation_timestamp();

-- Trigger function to create notification when a new message is sent
CREATE OR REPLACE FUNCTION notify_new_message()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_sender_name TEXT;
  v_conversation RECORD;
BEGIN
  -- Get conversation details
  SELECT user1_id, user2_id INTO v_conversation
  FROM chat_conversations
  WHERE id = NEW.conversation_id;
  
  -- Determine recipient (the user who is not the sender)
  IF v_conversation.user1_id = NEW.sender_id THEN
    v_recipient_id := v_conversation.user2_id;
  ELSE
    v_recipient_id := v_conversation.user1_id;
  END IF;
  
  -- Get sender's name
  SELECT full_name INTO v_sender_name
  FROM profiles
  WHERE id = NEW.sender_id;
  
  -- Create notification for recipient
  PERFORM create_notification(
    v_recipient_id,
    'message',
    'New Message',
    format('%s sent you a message', COALESCE(v_sender_name, 'Someone')),
    format('/dashboard/chat/%s', NEW.conversation_id),
    jsonb_build_object(
      'conversation_id', NEW.conversation_id,
      'message_id', NEW.id,
      'sender_id', NEW.sender_id
    ),
    NULL
  );
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for new message notifications
DROP TRIGGER IF EXISTS trigger_notify_new_message ON chat_messages;
CREATE TRIGGER trigger_notify_new_message
  AFTER INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION notify_new_message();

-- Trigger function to set unread_by when message is created
CREATE OR REPLACE FUNCTION set_message_unread()
RETURNS TRIGGER AS $$
DECLARE
  v_recipient_id UUID;
  v_conversation RECORD;
BEGIN
  -- Get conversation details
  SELECT user1_id, user2_id INTO v_conversation
  FROM chat_conversations
  WHERE id = NEW.conversation_id;
  
  -- Determine recipient (the user who is not the sender)
  IF v_conversation.user1_id = NEW.sender_id THEN
    v_recipient_id := v_conversation.user2_id;
  ELSE
    v_recipient_id := v_conversation.user1_id;
  END IF;
  
  -- Set unread_by to include the recipient
  NEW.unread_by := ARRAY[v_recipient_id];
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to set unread_by on message creation
DROP TRIGGER IF EXISTS trigger_set_message_unread ON chat_messages;
CREATE TRIGGER trigger_set_message_unread
  BEFORE INSERT ON chat_messages
  FOR EACH ROW
  EXECUTE FUNCTION set_message_unread();

-- Grant permissions
GRANT EXECUTE ON FUNCTION get_or_create_conversation TO authenticated;
GRANT EXECUTE ON FUNCTION mark_conversation_as_read TO authenticated;
GRANT EXECUTE ON FUNCTION get_unread_message_count TO authenticated;

-- Add comments for documentation
COMMENT ON FUNCTION get_or_create_conversation IS 'Get existing conversation or create new one between two users. Handles user ordering automatically.';
COMMENT ON FUNCTION mark_conversation_as_read IS 'Mark all messages in a conversation as read by the specified user. Returns count of messages marked.';
COMMENT ON FUNCTION get_unread_message_count IS 'Get total count of unread messages for a user across all conversations.';
