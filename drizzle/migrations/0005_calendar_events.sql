CREATE TABLE public.calendar_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  location text NOT NULL DEFAULT '',
  tag text NOT NULL DEFAULT 'Regatta',
  start_date date NOT NULL,
  end_date date,
  url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT ON public.calendar_events TO anon;
GRANT SELECT, INSERT, UPDATE, DELETE ON public.calendar_events TO authenticated;
GRANT ALL ON public.calendar_events TO service_role;
ALTER TABLE public.calendar_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read calendar events" ON public.calendar_events FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "Admins insert calendar events" ON public.calendar_events FOR INSERT TO authenticated WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins update calendar events" ON public.calendar_events FOR UPDATE TO authenticated USING (public.has_role(auth.uid(), 'admin')) WITH CHECK (public.has_role(auth.uid(), 'admin'));
CREATE POLICY "Admins delete calendar events" ON public.calendar_events FOR DELETE TO authenticated USING (public.has_role(auth.uid(), 'admin'));
CREATE TRIGGER calendar_events_updated_at BEFORE UPDATE ON public.calendar_events FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
INSERT INTO public.calendar_events (name, location, tag, start_date, url) VALUES
 ('Kenmare Endurance Regatta (Coastal)', 'Kenmare, Co. Kerry', 'Coastal', '2026-09-05', 'https://www.rowingireland.ie/regatta-hors/events/'),
 ('Swift Racing Coastal Junior Championships', 'Bantry, Co. Cork', 'Championships', '2026-09-12', 'https://www.rowingireland.ie/regatta-hors/events/'),
 ('St Michael''s Masters & Juniors HOR', 'O''Briensbridge, Co. Clare', 'Head race', '2026-10-10', 'https://www.rowingireland.ie/regatta-hors/events/'),
 ('Castleconnell Head', 'Castleconnell, Co. Limerick', 'Head race', '2026-10-24', 'https://www.rowingireland.ie/regatta-hors/events/'),
 ('Skibbereen HOR', 'Marina, Cork', 'Head race', '2026-11-14', 'https://www.rowingireland.ie/regatta-hors/events/'),
 ('Muckross Head', 'NRC, Farran Wood, Cork', 'Head race', '2026-12-05', 'https://www.rowingireland.ie/regatta-hors/events/');