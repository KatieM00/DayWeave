/*
  # Create plans table

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
      - `weather_forecast` (jsonb)
      - `reveal_progress` (integer)
      - `created_at` (timestamptz)

  2. Security
    - Enable RLS on `plans` table
    - Add policies for authenticated users to manage their own plans
*/

-- Create plans table
CREATE TABLE IF NOT EXISTS plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) NOT NULL,
  title TEXT NOT NULL,
  date DATE NOT NULL,
  events JSONB NOT NULL,
  total_cost DECIMAL NOT NULL,
  total_duration INTEGER NOT NULL,
  preferences JSONB NOT NULL,
  weather_forecast JSONB,
  reveal_progress INTEGER DEFAULT 100,
  created_at TIMESTAMPTZ DEFAULT NOW(),

  -- Add constraint to ensure user_id exists
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES auth.users(id) ON DELETE CASCADE
);

-- Enable Row Level Security
ALTER TABLE plans ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can create their own plans"
  ON plans
  FOR INSERT
  TO authenticated
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own plans"
  ON plans
  FOR SELECT
  TO authenticated
  USING (auth.uid() = user_id);

CREATE POLICY "Users can update their own plans"
  ON plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own plans"
  ON plans
  FOR DELETE
  TO authenticated
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_plans_user_id ON plans(user_id);
CREATE INDEX idx_plans_date ON plans(date);