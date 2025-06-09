/*
  # Fix shared plan functionality

  1. Changes
    - Ensure shareable_link_id column exists with proper constraints
    - Add unique constraint for shareable_link_id
    - Update RLS policies for proper public access
    - Add is_public column for better control

  2. Security
    - Allow anonymous users to view plans with valid shareable_link_id
    - Maintain existing user privacy for non-shared plans
    - Add is_public flag for explicit sharing control
*/

-- Add is_public column if it doesn't exist
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'is_public'
  ) THEN
    ALTER TABLE plans ADD COLUMN is_public BOOLEAN DEFAULT false;
  END IF;
END $$;

-- Ensure shareable_link_id column exists
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'plans' AND column_name = 'shareable_link_id'
  ) THEN
    ALTER TABLE plans ADD COLUMN shareable_link_id UUID;
  END IF;
END $$;

-- Add unique constraint for shareable_link_id if it doesn't exist
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE table_name = 'plans' AND constraint_name = 'plans_shareable_link_id_key'
  ) THEN
    ALTER TABLE plans ADD CONSTRAINT plans_shareable_link_id_key UNIQUE (shareable_link_id);
  END IF;
END $$;

-- Create indexes for better performance
CREATE INDEX IF NOT EXISTS idx_plans_shareable_link_id ON plans(shareable_link_id);
CREATE INDEX IF NOT EXISTS idx_plans_is_public ON plans(is_public);

-- Drop existing policies to recreate them properly
DROP POLICY IF EXISTS "Public can view shared plans" ON plans;
DROP POLICY IF EXISTS "Allow public read access to shared plans" ON plans;

-- Create comprehensive RLS policy for public access to shared plans
CREATE POLICY "Allow public read access to shared plans"
  ON plans
  FOR SELECT
  TO anon, authenticated
  USING (
    shareable_link_id IS NOT NULL 
    AND is_public = true
  );

-- Ensure users can update their plans to make them shareable
DROP POLICY IF EXISTS "Users can update their plans to add shareable links" ON plans;
CREATE POLICY "Users can update their plans to add shareable links"
  ON plans
  FOR UPDATE
  TO authenticated
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);