/*
  # Update vehicles table for direct profiles relationship

  1. Modified Tables
    - `vehicles`
      - Drop `last_verified_by` (text) column.
      - Add `verifier_id` (uuid, nullable, foreign key to `profiles.id`).
      - Update RLS policies to reflect the new column if necessary (though not directly for this change).
  2. Important Notes
    - This migration establishes a direct foreign key relationship between `vehicles` and `profiles` for the verifier information, replacing the previous text-based `last_verified_by`.
    - Data in `last_verified_by` will be lost. If data migration is needed, it should be handled separately before this migration.
*/

DO $$
BEGIN
  -- Drop the old last_verified_by column if it exists
  IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'last_verified_by') THEN
    ALTER TABLE vehicles DROP COLUMN last_verified_by;
  END IF;

  -- Add the new verifier_id column referencing profiles
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'verifier_id') THEN
    ALTER TABLE vehicles ADD COLUMN verifier_id uuid REFERENCES profiles(id);
  END IF;
END $$;