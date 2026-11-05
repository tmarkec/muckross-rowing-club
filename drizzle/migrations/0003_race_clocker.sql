CREATE TABLE public.race_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  distance text,
  start_date date,
  end_date date,
  status text NOT NULL DEFAULT 'draft' CHECK (status IN ('draft','running','finished')),
  checkpoints_count smallint NOT NULL DEFAULT 0 CHECK (checkpoints_count BETWEEN 0 AND 2),
  checkpoint_names text[] NOT NULL DEFAULT '{}',
  finished_at timestamptz,
  created_by uuid NOT NULL DEFAULT auth.uid(),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE TABLE public.race_event_controllers (
  event_id uuid NOT NULL REFERENCES public.race_events(id) ON DELETE CASCADE,
  coach_id uuid NOT NULL,
  PRIMARY KEY (event_id, coach_id)
);
CREATE TABLE public.race_crews (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  event_id uuid NOT NULL REFERENCES public.race_events(id) ON DELETE CASCADE,
  boat_type text NOT NULL,
  crew_name text NOT NULL,
  bow_number text,
  category text,
  start_time timestamptz,
  split1_time timestamptz,
  split2_time timestamptz,
  finish_time timestamptz,
  status text NOT NULL DEFAULT 'waiting' CHECK (status IN ('waiting','running','finished','dnf')),
  created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX race_crews_event_idx ON public.race_crews(event_id);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.race_events, public.race_event_controllers, public.race_crews TO authenticated;
GRANT ALL ON public.race_events, public.race_event_controllers, public.race_crews TO service_role;

ALTER TABLE public.race_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_event_controllers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.race_crews ENABLE ROW LEVEL SECURITY;

CREATE OR REPLACE FUNCTION public.is_coach_or_admin(_user_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select exists (select 1 from public.user_roles where user_id = _user_id and role in ('coach','admin'));
$$;

CREATE OR REPLACE FUNCTION public.can_control_race(_user_id uuid, _event_id uuid)
RETURNS boolean LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select public.has_role(_user_id, 'admin')
    or exists (select 1 from public.race_events where id = _event_id and created_by = _user_id)
    or exists (select 1 from public.race_event_controllers where event_id = _event_id and coach_id = _user_id);
$$;

CREATE OR REPLACE FUNCTION public.list_coaches()
RETURNS TABLE (id uuid, full_name text) LANGUAGE sql STABLE SECURITY DEFINER SET search_path = public AS $$
  select distinct p.id, coalesce(p.full_name, p.email) as full_name
  from public.profiles p join public.user_roles r on r.user_id = p.id
  where r.role in ('coach','admin') and public.is_coach_or_admin(auth.uid())
  order by 2;
$$;
REVOKE EXECUTE ON FUNCTION public.list_coaches() FROM public, anon;
GRANT EXECUTE ON FUNCTION public.list_coaches() TO authenticated;

CREATE POLICY "coaches read events" ON public.race_events FOR SELECT TO authenticated USING (public.is_coach_or_admin(auth.uid()));
CREATE POLICY "coaches create events" ON public.race_events FOR INSERT TO authenticated WITH CHECK (public.is_coach_or_admin(auth.uid()) AND created_by = auth.uid());
CREATE POLICY "controllers update events" ON public.race_events FOR UPDATE TO authenticated USING (public.can_control_race(auth.uid(), id)) WITH CHECK (public.can_control_race(auth.uid(), id));
CREATE POLICY "controllers delete events" ON public.race_events FOR DELETE TO authenticated USING (public.can_control_race(auth.uid(), id));

CREATE POLICY "coaches read controllers" ON public.race_event_controllers FOR SELECT TO authenticated USING (public.is_coach_or_admin(auth.uid()));
CREATE POLICY "controllers insert controllers" ON public.race_event_controllers FOR INSERT TO authenticated WITH CHECK (public.can_control_race(auth.uid(), event_id));
CREATE POLICY "controllers delete controllers" ON public.race_event_controllers FOR DELETE TO authenticated USING (public.can_control_race(auth.uid(), event_id));

CREATE POLICY "coaches read crews" ON public.race_crews FOR SELECT TO authenticated USING (public.is_coach_or_admin(auth.uid()));
CREATE POLICY "controllers insert crews" ON public.race_crews FOR INSERT TO authenticated WITH CHECK (public.can_control_race(auth.uid(), event_id));
CREATE POLICY "controllers update crews" ON public.race_crews FOR UPDATE TO authenticated USING (public.can_control_race(auth.uid(), event_id)) WITH CHECK (public.can_control_race(auth.uid(), event_id));
CREATE POLICY "controllers delete crews" ON public.race_crews FOR DELETE TO authenticated USING (public.can_control_race(auth.uid(), event_id));

ALTER PUBLICATION supabase_realtime ADD TABLE public.race_events, public.race_crews;