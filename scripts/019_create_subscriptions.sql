-- Subscription Plans table
CREATE TABLE IF NOT EXISTS subscription_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT UNIQUE NOT NULL,
  description TEXT,
  plan_type TEXT NOT NULL CHECK (plan_type IN ('daily', 'weekly', 'monthly', 'custom')),
  price DECIMAL(10, 2) NOT NULL,
  duration_days INTEGER,
  auto_renewal BOOLEAN DEFAULT false,
  features JSONB DEFAULT '[]',
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'inactive')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- User Subscriptions table
CREATE TABLE IF NOT EXISTS user_subscriptions (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  plan_id UUID REFERENCES subscription_plans(id),
  start_date TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  end_date TIMESTAMPTZ,
  auto_renew BOOLEAN DEFAULT false,
  status TEXT DEFAULT 'active' CHECK (status IN ('active', 'cancelled', 'expired')),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE subscription_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE user_subscriptions ENABLE ROW LEVEL SECURITY;

-- Policies
CREATE POLICY "subscription_plans_select_all" ON subscription_plans FOR SELECT USING (true);
CREATE POLICY "subscription_plans_insert_admin" ON subscription_plans FOR INSERT WITH CHECK (is_admin());
CREATE POLICY "subscription_plans_update_admin" ON subscription_plans FOR UPDATE USING (is_admin());
CREATE POLICY "subscription_plans_delete_admin" ON subscription_plans FOR DELETE USING (is_admin());

CREATE POLICY "user_subscriptions_select_own" ON user_subscriptions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_insert_own" ON user_subscriptions FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_update_own" ON user_subscriptions FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "user_subscriptions_select_admin" ON user_subscriptions FOR SELECT USING (is_admin());
CREATE POLICY "user_subscriptions_update_admin" ON user_subscriptions FOR UPDATE USING (is_admin());

-- Indexes
CREATE INDEX idx_user_subscriptions_user_id ON user_subscriptions(user_id);
CREATE INDEX idx_user_subscriptions_plan_id ON user_subscriptions(plan_id);
CREATE INDEX idx_user_subscriptions_status ON user_subscriptions(status);
