/*
  # Update user preferences schema

  1. Changes
    - Add activity suggestions table
    - Add budget tracking table
    - Add cached responses table
    - Add analytics events table

  2. Security
    - Enable RLS on all new tables
    - Add appropriate policies
*/

-- Activity suggestions cache
CREATE TABLE IF NOT EXISTS activity_suggestions_cache (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  location TEXT NOT NULL,
  query_params JSONB NOT NULL,
  suggestions JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  expires_at TIMESTAMPTZ NOT NULL,
  
  CONSTRAINT valid_expiry CHECK (expires_at > created_at)
);

-- Budget tracking
CREATE TABLE IF NOT EXISTS budget_tracking (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  category TEXT NOT NULL,
  amount DECIMAL NOT NULL,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Analytics events
CREATE TABLE IF NOT EXISTS analytics_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL,
  event_data JSONB NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE activity_suggestions_cache ENABLE ROW LEVEL SECURITY;
ALTER TABLE budget_tracking ENABLE ROW LEVEL SECURITY;
ALTER TABLE analytics_events ENABLE ROW LEVEL SECURITY;

-- RLS Policies
CREATE POLICY "Users can view their cached suggestions"
  ON activity_suggestions_cache
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can manage their budget tracking"
  ON budget_tracking
  FOR ALL
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their analytics"
  ON analytics_events
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

-- Indexes
CREATE INDEX idx_suggestions_user_location ON activity_suggestions_cache(user_id, location);
CREATE INDEX idx_budget_user_date ON budget_tracking(user_id, date);
CREATE INDEX idx_analytics_user_type ON analytics_events(user_id, event_type);