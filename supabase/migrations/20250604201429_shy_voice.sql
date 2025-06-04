/*
  # Create plans table and policies

  1. New Tables
    - `plans`
      - `id` (uuid, primary key)
      - `user_id` (uuid, references auth.users)
      - `title` (text)
      - `date` (date)
      - `events` (jsonb)
      - `total_cost` (decimal)
      - `total_duration` (integer)
      - `preferences` (jsonb)
      - `weather_forecast` (jsonb, nullable)
      - `reveal_progress` (integer, default 100)
      - `created_at` (timestamptz, default now())

  2. Security
    - Enable RLS on `plans` table
    - Add policies for authenticated users to:
      - Create their own plans
      - View their own plans
      - Update their own plans
      - Delete their own plans

  3. Indexes
    - Index on user_id for faster lookups
    - Index on date for sorting and filtering
*/

DO $$ BEGIN
  -- Create plans table if it doesn't exist
  CREATE TABLE IF NOT EXISTS plans (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL,
    title TEXT NOT NULL,
    date DATE NOT NULL,
    events JSONB NOT NULL,
    total_cost DECIMAL NOT NULL,
    total_duration INTEGER NOT NULL,
    preferences JSONB NOT NULL,
    weather_forecast JSONB,
    reveal_progress INTEGER DEFAULT 100,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
  );

  -- Enable RLS if not already enabled
  ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

  -- Drop existing policies if they exist
  DROP POLICY IF EXISTS "Users can create their own plans" ON plans;
  DROP POLICY IF EXISTS "Users can view their own plans" ON plans;
  DROP POLICY IF EXISTS "Users can update their own plans" ON plans;
  DROP POLICY IF EXISTS "Users can delete their own plans" ON plans;

  -- Create new policies
  CREATE POLICY "Users can create their own plans"
    ON plans FOR INSERT TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can view their own plans"
    ON plans FOR SELECT TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Users can update their own plans"
    ON plans FOR UPDATE TO authenticated
    USING (auth.uid() = user_id)
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Users can delete their own plans"
    ON plans FOR DELETE TO authenticated
    USING (auth.uid() = user_id);

  -- Create indexes if they don't exist
  CREATE INDEX IF NOT EXISTS idx_plans_user_id ON plans(user_id);
  CREATE INDEX IF NOT EXISTS idx_plans_date ON plans(date);
END $$;