/*
      # Create vehicles table

      1. New Tables
        - `vehicles`
          - `id` (uuid, primary key, default gen_random_uuid())
          - `created_at` (timestamptz, default now())
          - `user_id` (uuid, foreign key to auth.users.id, not null) - Links vehicle to the user who added it.
          - `name` (text, not null) - e.g., "FPTL 1", "VSAV 2"
          - `type` (text, not null) - e.g., "Fourgon Pompe Tonne Léger", "Véhicule de Secours et d'Assistance aux Victimes"
          - `fire_station` (text, not null) - The fire station the vehicle is assigned to.
          - `plate_number` (text, unique, not null) - Vehicle's license plate number.
          - `capacity` (integer, default 0) - Number of personnel the vehicle can carry.
          - `equipment_list` (text, default '') - A general list of major equipment.
          - `status` (text, default 'Opérationnel') - Current operational status (e.g., 'Opérationnel', 'En maintenance', 'Hors service').
      2. Security
        - Enable RLS on `vehicles` table.
        - Add policy for authenticated users to insert their own vehicle data.
        - Add policy for authenticated users to select their own vehicle data.
        - Add policy for authenticated users to update their own vehicle data.
    */

    CREATE TABLE IF NOT EXISTS vehicles (
      id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
      created_at timestamptz DEFAULT now(),
      user_id uuid REFERENCES auth.users(id) NOT NULL,
      name text NOT NULL,
      type text NOT NULL,
      fire_station text NOT NULL,
      plate_number text UNIQUE NOT NULL,
      capacity integer DEFAULT 0,
      equipment_list text DEFAULT '',
      status text DEFAULT 'Opérationnel'
    );

    ALTER TABLE vehicles ENABLE ROW LEVEL SECURITY;

    CREATE POLICY "Authenticated users can insert their own vehicles."
      ON vehicles
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can select their own vehicles."
      ON vehicles
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    CREATE POLICY "Authenticated users can update their own vehicles."
      ON vehicles
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id);