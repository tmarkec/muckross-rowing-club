
-- Add session_part to attendance (single | am | pm)
DO $$ BEGIN
  CREATE TYPE public.session_part AS ENUM ('single','am','pm');
EXCEPTION WHEN duplicate_object THEN null; END $$;

ALTER TABLE public.attendance
  ADD COLUMN IF NOT EXISTS session_part public.session_part NOT NULL DEFAULT 'single';

-- Unique per athlete/date/part so we can upsert cleanly
CREATE UNIQUE INDEX IF NOT EXISTS attendance_unique_athlete_date_part
  ON public.attendance (athlete_id, session_date, session_part);
