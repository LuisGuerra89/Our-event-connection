-- Create traffic_sources table to track where users come from
CREATE TABLE IF NOT EXISTS traffic_sources (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES profiles(id) ON DELETE CASCADE,
  session_id VARCHAR(255) NOT NULL,
  
  -- UTM Parameters
  utm_source VARCHAR(100),
  utm_medium VARCHAR(100),
  utm_campaign VARCHAR(255),
  utm_content VARCHAR(255),
  utm_term VARCHAR(255),
  
  -- Referrer Information
  referrer VARCHAR(500),
  referrer_domain VARCHAR(255),
  
  -- Page Entry Point
  landing_page VARCHAR(500),
  
  -- Device & Browser Info
  user_agent TEXT,
  ip_address INET,
  country VARCHAR(100),
  
  -- Timestamps
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for common queries
CREATE INDEX IF NOT EXISTS idx_traffic_sources_user_id ON traffic_sources(user_id);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_utm_source ON traffic_sources(utm_source);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_referrer_domain ON traffic_sources(referrer_domain);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_created_at ON traffic_sources(created_at);
CREATE INDEX IF NOT EXISTS idx_traffic_sources_session_id ON traffic_sources(session_id);

-- Create a view for traffic analytics
CREATE OR REPLACE VIEW traffic_analytics AS
SELECT
  utm_source,
  utm_medium,
  utm_campaign,
  referrer_domain,
  COUNT(*) as visit_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  DATE(created_at) as visit_date
FROM traffic_sources
WHERE created_at >= NOW() - INTERVAL '90 days'
GROUP BY utm_source, utm_medium, utm_campaign, referrer_domain, DATE(created_at)
ORDER BY visit_count DESC;

-- Create another view for source summary
CREATE OR REPLACE VIEW traffic_source_summary AS
SELECT
  COALESCE(utm_source, referrer_domain, 'Direct') as source,
  COALESCE(utm_medium, 'organic') as medium,
  COUNT(*) as total_visits,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  ROUND(100.0 * COUNT(*) / (SELECT COUNT(*) FROM traffic_sources WHERE created_at >= NOW() - INTERVAL '30 days'), 2) as percentage
FROM traffic_sources
WHERE created_at >= NOW() - INTERVAL '30 days'
GROUP BY COALESCE(utm_source, referrer_domain, 'Direct'), COALESCE(utm_medium, 'organic')
ORDER BY total_visits DESC;
