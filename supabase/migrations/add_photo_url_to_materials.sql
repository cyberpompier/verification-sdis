/*
      # Add photo_url to materials table

      1. Modified Tables
        - `materials`
          - Add `photo_url` (text, nullable)
      2. Security
        - No changes to RLS policies, as the new column is covered by existing policies.
    */

    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns
        WHERE table_name = 'materials' AND column_name = 'photo_url'
      ) THEN
        ALTER TABLE materials ADD COLUMN photo_url text;
      END IF;
    END $$;