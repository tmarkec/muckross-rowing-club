CREATE UNIQUE INDEX IF NOT EXISTS athletes_unique_full_name_ci
  ON public.athletes ((lower(first_name)), (lower(last_name)));