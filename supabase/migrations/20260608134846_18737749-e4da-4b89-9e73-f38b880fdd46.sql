
-- Split posts_select_public so anon never calls has_role()
DROP POLICY IF EXISTS posts_select_public ON public.posts;

CREATE POLICY posts_select_published ON public.posts
  FOR SELECT TO anon, authenticated
  USING (published = true);

CREATE POLICY posts_select_admin_all ON public.posts
  FOR SELECT TO authenticated
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Lock down SECURITY DEFINER helpers so anon cannot execute them
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_coach_of_group(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_coach_of_group(uuid, uuid) TO authenticated, service_role;
