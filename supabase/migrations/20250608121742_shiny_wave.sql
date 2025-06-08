/*
  # Add shareable link support

  1. Changes
    - Add shareable_link_id column to plans table (if not exists)
    - Add RLS policy for public access to shared plans
    - Create index for shareable link lookups

  2. Security
    - Allow anonymous users to view plans with shareable_link_id
    - Maintain existing user privacy for non-shared plans
*/

-- Add shareable_link_id column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'shareable_link_id'
  ) THEN
    ALTER TABLE plans ADD COLUMN shareable_link_id UUID;
  END IF;
END $$;

-- Create index for shareable link lookups
CREATE INDEX IF NOT EXISTS idx_plans_shareable_link_id ON plans(shareable_link_id);

-- Add RLS policy for public access to shared plans
CREATE POLICY "Public can view shared plans"
  ON plans
  FOR SELECT
  TO anon, authenticated
  USING (shareable_link_id IS NOT NULL);

-- Add policy for authenticated users to generate shareable links
CREATE POLICY "Users can update their plans to add shareable links"
  ON plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);