-- Create notifications table for future chat and notification system
-- This script prepares the infrastructure for real-time notifications

-- Create notifications table
CREATE TABLE IF NOT EXISTS notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL CHECK (type IN ('message', 'referral', 'event', 'subscription', 'system', 'admin')),
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  read BOOLEAN DEFAULT FALSE,
  link TEXT,
  metadata JSONB DEFAULT '{}'::jsonb,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  read_at TIMESTAMPTZ,
  expires_at TIMESTAMPTZ
);

-- Add indexes for better performance
CREATE INDEX IF NOT EXISTS idx_notifications_user_id ON notifications(user_id);
CREATE INDEX IF NOT EXISTS idx_notifications_created_at ON notifications(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_notifications_user_unread ON notifications(user_id, read) WHERE read = FALSE;
CREATE INDEX IF NOT EXISTS idx_notifications_type ON notifications(type);

-- Add RLS policies
ALTER TABLE notifications ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist
DROP POLICY IF EXISTS "Users can view their own notifications" ON notifications;
DROP POLICY IF EXISTS "Users can update their own notifications" ON notifications;
DROP POLICY IF EXISTS "System can insert notifications" ON notifications;

-- Policy: Users can view their own notifications
CREATE POLICY "Users can view their own notifications"
  ON notifications
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Policy: Users can update their own notifications (mark as read)
CREATE POLICY "Users can update their own notifications"
  ON notifications
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: System can insert notifications
CREATE POLICY "System can insert notifications"
  ON notifications
  FOR INSERT
  TO authenticated
  WITH CHECK (true);

-- Function to auto-delete expired notifications
CREATE OR REPLACE FUNCTION delete_expired_notifications()
RETURNS void AS $$
BEGIN
  DELETE FROM notifications
  WHERE expires_at IS NOT NULL AND expires_at < NOW();
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to create notification
CREATE OR REPLACE FUNCTION create_notification(
  p_user_id UUID,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb,
  p_expires_at TIMESTAMPTZ DEFAULT NULL
)
RETURNS UUID AS $$
DECLARE
  v_notification_id UUID;
BEGIN
  INSERT INTO notifications (
    user_id,
    type,
    title,
    message,
    link,
    metadata,
    expires_at
  ) VALUES (
    p_user_id,
    p_type,
    p_title,
    p_message,
    p_link,
    p_metadata,
    p_expires_at
  )
  RETURNING id INTO v_notification_id;
  
  RETURN v_notification_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Function to send notification to all users with a specific role
CREATE OR REPLACE FUNCTION broadcast_notification_to_role(
  p_role_name TEXT,
  p_type TEXT,
  p_title TEXT,
  p_message TEXT,
  p_link TEXT DEFAULT NULL,
  p_metadata JSONB DEFAULT '{}'::jsonb
)
RETURNS INTEGER AS $$
DECLARE
  v_count INTEGER := 0;
  v_user_record RECORD;
BEGIN
  FOR v_user_record IN
    SELECT user_id
    FROM profiles
    WHERE role_id = (SELECT id FROM roles WHERE name = p_role_name)
  LOOP
    PERFORM create_notification(
      v_user_record.user_id,
      p_type,
      p_title,
      p_message,
      p_link,
      p_metadata,
      NULL
    );
    v_count := v_count + 1;
  END LOOP;
  
  RETURN v_count;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Trigger to create notification when user receives a referral
CREATE OR REPLACE FUNCTION notify_referral_reward()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify user when they earn a referral
  IF NEW.status = 'completed' THEN
    PERFORM create_notification(
      NEW.referrer_id,
      'referral',
      'New Referral!',
      'Someone joined using your referral code!',
      '/dashboard/referrals',
      jsonb_build_object('referral_id', NEW.id),
      NULL
    );
    
    -- Check if user earned free activity
    DECLARE
      v_referral_count INTEGER;
      v_free_events INTEGER;
    BEGIN
      SELECT referral_count, free_events_earned
      INTO v_referral_count, v_free_events
      FROM profiles
      WHERE user_id = NEW.referrer_id;
      
      -- Notify when user reaches milestones
      IF v_referral_count % 25 = 0 THEN
        PERFORM create_notification(
          NEW.referrer_id,
          'referral',
          '🎉 Free Activity Earned!',
          format('Congratulations! You''ve earned a FREE activity with %s referrals!', v_referral_count),
          '/dashboard/referrals',
          jsonb_build_object('milestone', v_referral_count, 'free_events', v_free_events),
          NULL
        );
      END IF;
    END;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for referral notifications
DROP TRIGGER IF EXISTS trigger_notify_referral_reward ON referrals;
CREATE TRIGGER trigger_notify_referral_reward
  AFTER INSERT OR UPDATE OF status ON referrals
  FOR EACH ROW
  EXECUTE FUNCTION notify_referral_reward();

-- Trigger to create notification when user's affiliate application is approved
CREATE OR REPLACE FUNCTION notify_affiliate_status()
RETURNS TRIGGER AS $$
BEGIN
  -- Notify when application is approved
  IF NEW.approval_status = 'approved' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'approved') THEN
    PERFORM create_notification(
      NEW.user_id,
      'system',
      'Affiliate Application Approved!',
      'Congratulations! Your affiliate application has been approved. You can now start earning!',
      '/dashboard/affiliates',
      jsonb_build_object('affiliate_id', NEW.id),
      NULL
    );
  END IF;
  
  -- Notify when application is rejected
  IF NEW.approval_status = 'rejected' AND (OLD.approval_status IS NULL OR OLD.approval_status != 'rejected') THEN
    PERFORM create_notification(
      NEW.user_id,
      'system',
      'Affiliate Application Update',
      'Thank you for your interest. Your affiliate application is under review. We''ll contact you soon.',
      '/affiliates/apply',
      jsonb_build_object('affiliate_id', NEW.id),
      NULL
    );
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create trigger for affiliate notifications
DROP TRIGGER IF EXISTS trigger_notify_affiliate_status ON affiliates;
CREATE TRIGGER trigger_notify_affiliate_status
  AFTER UPDATE OF approval_status ON affiliates
  FOR EACH ROW
  EXECUTE FUNCTION notify_affiliate_status();

-- Trigger to notify user when their subscription is about to expire
CREATE OR REPLACE FUNCTION notify_subscription_expiring()
RETURNS void AS $$
DECLARE
  v_subscription RECORD;
BEGIN
  FOR v_subscription IN
    SELECT 
      us.user_id,
      us.id as subscription_id,
      sp.name as plan_name,
      us.end_date
    FROM user_subscriptions us
    JOIN subscription_plans sp ON us.plan_id = sp.id
    WHERE us.status = 'active'
    AND us.end_date <= NOW() + INTERVAL '7 days'
    AND us.end_date > NOW()
    AND NOT EXISTS (
      SELECT 1 FROM notifications
      WHERE user_id = us.user_id
      AND type = 'subscription'
      AND metadata->>'subscription_id' = us.id::text
      AND created_at > NOW() - INTERVAL '7 days'
    )
  LOOP
    PERFORM create_notification(
      v_subscription.user_id,
      'subscription',
      'Subscription Expiring Soon',
      format('Your %s membership will expire on %s. Renew now to continue enjoying benefits!', 
        v_subscription.plan_name,
        to_char(v_subscription.end_date, 'Mon DD, YYYY')
      ),
      '/membership',
      jsonb_build_object(
        'subscription_id', v_subscription.subscription_id,
        'expires_at', v_subscription.end_date
      ),
      NULL
    );
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Example usage comments for future implementation:
COMMENT ON FUNCTION create_notification IS 'Create a notification for a specific user. Example: SELECT create_notification(user_id, ''message'', ''New Message'', ''You have a new chat message'', ''/dashboard/messages'')';
COMMENT ON FUNCTION broadcast_notification_to_role IS 'Send notification to all users with a specific role. Example: SELECT broadcast_notification_to_role(''member'', ''system'', ''Platform Update'', ''We have exciting new features!'')';
COMMENT ON FUNCTION notify_subscription_expiring IS 'Check and notify users about expiring subscriptions. Run this daily via cron job';

-- Grant necessary permissions
GRANT SELECT, UPDATE ON notifications TO authenticated;
GRANT EXECUTE ON FUNCTION create_notification TO authenticated;
GRANT EXECUTE ON FUNCTION delete_expired_notifications TO postgres;
GRANT EXECUTE ON FUNCTION broadcast_notification_to_role TO postgres;
GRANT EXECUTE ON FUNCTION notify_subscription_expiring TO postgres;

-- Insert sample notification for testing (optional - remove in production)
-- COMMENT: Uncomment the following lines to create test notifications
/*
DO $$
DECLARE
  v_test_user_id UUID;
BEGIN
  -- Get a test user (first user in the system)
  SELECT id INTO v_test_user_id FROM auth.users LIMIT 1;
  
  IF v_test_user_id IS NOT NULL THEN
    -- Create welcome notification
    PERFORM create_notification(
      v_test_user_id,
      'system',
      'Welcome!',
      'Welcome to our platform! Start exploring events and connecting with people.',
      '/events',
      '{"category": "welcome"}'::jsonb,
      NOW() + INTERVAL '30 days'
    );
  END IF;
END $$;
*/
