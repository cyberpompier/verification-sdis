/*
      # Add photo_url, photo, and lien columns to vehicles table

      1. Modified Tables
        - `vehicles`
          - `photo_url` (text, default '') - URL for a vehicle photo.
          - `photo` (text, default '') - Placeholder for photo data (e.g., base64 or file path).
          - `lien` (text, default '') - A general link related to the vehicle.
      2. Security
        - No changes to RLS policies, existing policies will apply to new columns.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles' AND column_name = 'photo_url'
      ) THEN
        ALTER TABLE vehicles ADD COLUMN photo_url text DEFAULT '';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles' AND column_name = 'photo'
      ) THEN
        ALTER TABLE vehicles ADD COLUMN photo text DEFAULT '';
      END IF;

      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'vehicles' AND column_name = 'lien'
      ) THEN
        ALTER TABLE vehicles ADD COLUMN lien text DEFAULT '';
      END IF;
    END $$;