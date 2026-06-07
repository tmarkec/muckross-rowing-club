
CREATE TYPE public.boat_type AS ENUM ('1x','2x','2-','4x','4+','8x','8+');
CREATE TYPE public.oar_category AS ENUM ('Sweep','Scull');

CREATE TABLE public.club_boats (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  type public.boat_type NOT NULL,
  assigned_group text,
  status text NOT NULL DEFAULT 'active',
  is_private boolean NOT NULL DEFAULT false,
  notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_boats TO authenticated;
GRANT ALL ON public.club_boats TO service_role;
ALTER TABLE public.club_boats ENABLE ROW LEVEL SECURITY;
CREATE POLICY club_boats_select ON public.club_boats FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'coach'));
CREATE POLICY club_boats_admin_insert ON public.club_boats FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY club_boats_admin_update ON public.club_boats FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY club_boats_admin_delete ON public.club_boats FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER club_boats_set_updated_at BEFORE UPDATE ON public.club_boats
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

CREATE TABLE public.club_oars (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  category public.oar_category NOT NULL,
  quantity integer NOT NULL DEFAULT 1 CHECK (quantity >= 0),
  assigned_group text,
  brand_notes text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);
GRANT SELECT, INSERT, UPDATE, DELETE ON public.club_oars TO authenticated;
GRANT ALL ON public.club_oars TO service_role;
ALTER TABLE public.club_oars ENABLE ROW LEVEL SECURITY;
CREATE POLICY club_oars_select ON public.club_oars FOR SELECT TO authenticated
  USING (public.has_role(auth.uid(),'admin') OR public.has_role(auth.uid(),'coach'));
CREATE POLICY club_oars_admin_insert ON public.club_oars FOR INSERT TO authenticated
  WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY club_oars_admin_update ON public.club_oars FOR UPDATE TO authenticated
  USING (public.has_role(auth.uid(),'admin')) WITH CHECK (public.has_role(auth.uid(),'admin'));
CREATE POLICY club_oars_admin_delete ON public.club_oars FOR DELETE TO authenticated
  USING (public.has_role(auth.uid(),'admin'));
CREATE TRIGGER club_oars_set_updated_at BEFORE UPDATE ON public.club_oars
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
