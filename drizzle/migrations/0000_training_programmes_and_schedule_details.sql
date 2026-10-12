ALTER TABLE public.training_schedules ADD COLUMN IF NOT EXISTS details text;

CREATE TABLE public.training_programmes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  group_id uuid NOT NULL UNIQUE REFERENCES public.groups(id) ON DELETE CASCADE,
  start_date date NOT NULL,
  data jsonb NOT NULL DEFAULT '{}'::jsonb,
  updated_by uuid,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.training_programmes TO authenticated;
GRANT ALL ON public.training_programmes TO service_role;
ALTER TABLE public.training_programmes ENABLE ROW LEVEL SECURITY;
CREATE POLICY tp_select ON public.training_programmes FOR SELECT TO authenticated
  USING (has_role(auth.uid(),'admin') OR is_coach_of_group(auth.uid(), group_id));
CREATE POLICY tp_insert ON public.training_programmes FOR INSERT TO authenticated
  WITH CHECK (has_role(auth.uid(),'admin') OR is_coach_of_group(auth.uid(), group_id));
CREATE POLICY tp_update ON public.training_programmes FOR UPDATE TO authenticated
  USING (has_role(auth.uid(),'admin') OR is_coach_of_group(auth.uid(), group_id))
  WITH CHECK (has_role(auth.uid(),'admin') OR is_coach_of_group(auth.uid(), group_id));
CREATE POLICY tp_delete ON public.training_programmes FOR DELETE TO authenticated
  USING (has_role(auth.uid(),'admin') OR is_coach_of_group(auth.uid(), group_id));
CREATE TRIGGER training_programmes_updated_at BEFORE UPDATE ON public.training_programmes
  FOR EACH ROW EXECUTE FUNCTION set_updated_at();
ALTER PUBLICATION supabase_realtime ADD TABLE public.training_programmes;