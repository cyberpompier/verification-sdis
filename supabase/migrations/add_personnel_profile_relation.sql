/*
      # Add foreign key and RLS for personnel table

      1. Modified Tables
        - `personnel`
          - Add a foreign key constraint on `user_id` referencing `auth.users.id`.
      2. Security
        - Enable RLS on `personnel` table (if not already enabled).
        - Add RLS policies for `personnel` table:
          - `SELECT`: Authenticated users can read their own personnel data.
          - `INSERT`: Authenticated users can insert personnel data with their own `user_id`.
          - `UPDATE`: Authenticated users can update their own personnel data.
          - `DELETE`: Authenticated users can delete their own personnel data.
    */

    -- Add foreign key constraint to personnel table
    DO $$
    BEGIN
      IF NOT EXISTS (
        SELECT 1
        FROM pg_constraint
        WHERE conname = 'personnel_user_id_fkey'
      ) THEN
        ALTER TABLE personnel
        ADD CONSTRAINT personnel_user_id_fkey
        FOREIGN KEY (user_id) REFERENCES auth.users(id)
        ON DELETE CASCADE;
      END IF;
    END $$;

    -- Enable Row Level Security on the personnel table
    ALTER TABLE personnel ENABLE ROW LEVEL SECURITY;

    -- Policy for authenticated users to read their own personnel data
    DROP POLICY IF EXISTS "Authenticated users can read their own personnel data." ON personnel;
    CREATE POLICY "Authenticated users can read their own personnel data."
      ON personnel
      FOR SELECT
      TO authenticated
      USING (auth.uid() = user_id);

    -- Policy for authenticated users to insert their own personnel data
    DROP POLICY IF EXISTS "Authenticated users can insert their own personnel data." ON personnel;
    CREATE POLICY "Authenticated users can insert their own personnel data."
      ON personnel
      FOR INSERT
      TO authenticated
      WITH CHECK (auth.uid() = user_id);

    -- Policy for authenticated users to update their own personnel data
    DROP POLICY IF EXISTS "Authenticated users can update their own personnel data." ON personnel;
    CREATE POLICY "Authenticated users can update their own personnel data."
      ON personnel
      FOR UPDATE
      TO authenticated
      USING (auth.uid() = user_id)
      WITH CHECK (auth.uid() = user_id);

    -- Policy for authenticated users to delete their own personnel data
    DROP POLICY IF EXISTS "Authenticated users can delete their own personnel data." ON personnel;
    CREATE POLICY "Authenticated users can delete their own personnel data."
      ON personnel
      FOR DELETE
      TO authenticated
      USING (auth.uid() = user_id);