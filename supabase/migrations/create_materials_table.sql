/*
    # Create materials table

    1. New Tables
      - `materials`
        - `id` (uuid, primary key, default gen_random_uuid())
        - `created_at` (timestamptz, default now())
        - `user_id` (uuid, foreign key to auth.users.id, not null) - Links material to the user who added it.
        - `name` (text, not null) - e.g., "Hache", "Lance"
        - `type` (text, not null) - e.g., "Outil", "Équipement de protection"
        - `quantity` (integer, default 1) - Number of items.
        - `location` (text, default '') - Where it's stored, e.g., "Camion FPTL 1", "Caserne".
        - `status` (text, default 'Disponible') - Current operational status (e.g., 'Disponible', 'En réparation', 'Perdu').
        - `last_checked` (timestamptz, default now()) - Last time inventory was checked.
        - `description` (text, default '') - Optional detailed description.
    2. Security
      - Enable RLS on `materials` table.
      - Add policy for authenticated users to insert their own material data.
      - Add policy for authenticated users to select their own material data.
      - Add policy for authenticated users to update their own material data.
      - Add policy for authenticated users to delete their own material data.
  */

  CREATE TABLE IF NOT EXISTS materials (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    created_at timestamptz DEFAULT now(),
    user_id uuid REFERENCES auth.users(id) NOT NULL,
    name text NOT NULL,
    type text NOT NULL,
    quantity integer DEFAULT 1,
    location text DEFAULT '',
    status text DEFAULT 'Disponible',
    last_checked timestamptz DEFAULT now(),
    description text DEFAULT ''
  );

  ALTER TABLE materials ENABLE ROW LEVEL SECURITY;

  CREATE POLICY "Authenticated users can insert their own materials."
    ON materials
    FOR INSERT
    TO authenticated
    WITH CHECK (auth.uid() = user_id);

  CREATE POLICY "Authenticated users can select their own materials."
    ON materials
    FOR SELECT
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Authenticated users can update their own materials."
    ON materials
    FOR UPDATE
    TO authenticated
    USING (auth.uid() = user_id);

  CREATE POLICY "Authenticated users can delete their own materials."
    ON materials
    FOR DELETE
    TO authenticated
    USING (auth.uid() = user_id);