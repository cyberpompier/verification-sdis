/*
      # Add photo_url to personnel table

      1. Modified Tables
        - `personnel`
          - Add `photo_url` (text, nullable)
      2. Security
        - No changes to RLS policies, as the new column is covered by existing policies.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'personnel' AND column_name = 'photo_url'
      ) THEN
        ALTER TABLE personnel ADD COLUMN photo_url text;
      END IF;
    END $$;