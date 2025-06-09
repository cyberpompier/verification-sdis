/*
      # Create personnel table

      1. New Tables
        - `personnel`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `created_at` (timestamptz, default now())
          - `user_id` (uuid, foreign key to auth.users, not null)
          - `first_name` (text, not null)
          - `last_name` (text, not null)
          - `role` (text, not null)
          - `contact_number` (text, nullable)
          - `email` (text, nullable)
          - `fire_station` (text, nullable)
          - `status` (text, default 'Actif')
          - `notes` (text, nullable)
          - `photo_url` (text, nullable)
      2. Security
        - Enable RLS on `personnel` table
        - Add policy for authenticated users to insert their own data
        - Add policy for authenticated users to select their own data
        - Add policy for authenticated users to update their own data
        - Add policy for authenticated users to delete their own data
    */

    CREATE TABLE IF NOT EXISTS personnel (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
      first_name text NOT NULL,
      last_name text NOT NULL,
      role text NOT NULL,
      contact_number text,
      email text,
      fire_station text,
      status text DEFAULT 'Actif',
      notes text,
      photo_url text
    );

    ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can insert their own personnel"
      ON personnel
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can select their own personnel"
      ON personnel
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can update their own personnel"
      ON personnel
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can delete their own personnel"
      ON personnel
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);