/*
      # Add verification columns to vehicles table

      1. Modified Tables
        - `vehicles`
          - `last_verified_by` (text, nullable): Stores the email of the user who last verified the vehicle.
          - `last_verified_at` (timestamptz, nullable): Stores the timestamp of the last verification.
          - `verification_status` (text, default 'Non vérifié'): Stores the overall verification status ('OK', 'Anomalie', 'Non vérifié').
    */

    DO $$
    BEGIN
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'last_verified_by') THEN
        ALTER TABLE vehicles ADD COLUMN last_verified_by text;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'last_verified_at') THEN
        ALTER TABLE vehicles ADD COLUMN last_verified_at timestamptz;
      END IF;
      IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'vehicles' AND column_name = 'verification_status') THEN
        ALTER TABLE vehicles ADD COLUMN verification_status text DEFAULT 'Non vérifié';
      END IF;
    END $$;