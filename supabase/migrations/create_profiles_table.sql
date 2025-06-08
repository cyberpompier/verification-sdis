/*
      # Create profiles table

      1. New Tables
        - `profiles`
          - `id` (uuid, primary key, references auth.users)
          - `username` (text, unique, nullable)
          - `avatar_url` (text, nullable)
          - `updated_at` (timestamp with time zone, nullable)
      2. Security
        - Enable RLS on `profiles` table
        - Add policies for authenticated users to:
          - Select their own profile
          - Insert their own profile
          - Update their own profile
    */

    CREATE TABLE IF NOT EXISTS profiles (
      id uuid REFERENCES auth.users ON DELETE CASCADE PRIMARY KEY,
      username text UNIQUE,
      avatar_url text,
      updated_at timestamptz
    );

    ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Public profiles are viewable by everyone."
      ON profiles FOR SELECT
      USING (true);

    CREATE POLICY "Users can insert their own profile."
      ON profiles FOR INSERT
      WITH CHECK (auth.uid() = id);

    CREATE POLICY "Users can update their own profile."
      ON profiles FOR UPDATE
      USING (auth.uid() = id);