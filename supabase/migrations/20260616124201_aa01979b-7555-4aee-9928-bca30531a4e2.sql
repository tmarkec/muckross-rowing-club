
-- Group training schedules
CREATE TABLE public.training_schedules (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  day_of_week smallint NOT NULL CHECK (day_of_week BETWEEN 1 AND 7),
  group_name text NOT NULL,
  time_text text NOT NULL,
  location text NOT NULL CHECK (location IN ('Boathouse','Gym')),
  sort_order int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT ON public.training_schedules TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_schedules TO authenticated;
GRANT ALL ON public.training_schedules TO service_role;

ALTER TABLE public.training_schedules ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view training schedules"
  ON public.training_schedules FOR SELECT
  USING (true);

CREATE POLICY "Admins can insert training schedules"
  ON public.training_schedules FOR INSERT
  TO authenticated
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can update training schedules"
  ON public.training_schedules FOR UPDATE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'))
  WITH CHECK (public.has_role(auth.uid(), 'admin'));

CREATE POLICY "Admins can delete training schedules"
  ON public.training_schedules FOR DELETE
  TO authenticated
  USING (public.has_role(auth.uid(), 'admin'));

CREATE TRIGGER set_training_schedules_updated_at
  BEFORE UPDATE ON public.training_schedules
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
