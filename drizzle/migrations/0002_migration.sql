-- Additive: lets the app upsert weekly plans with ON CONFLICT (group_id, start_date)
CREATE UNIQUE INDEX IF NOT EXISTS training_programmes_group_start_key
  ON public.training_programmes (group_id, start_date);