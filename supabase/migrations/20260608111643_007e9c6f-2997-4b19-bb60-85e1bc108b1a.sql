
-- 1) Restrict profiles SELECT to self or admin
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;
CREATE POLICY profiles_select_self_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (id = auth.uid() OR public.has_role(auth.uid(), 'admin'::app_role));

-- 2) Storage RLS for post-images bucket
DROP POLICY IF EXISTS "post_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "post_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "post_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "post_images_admin_delete" ON storage.objects;

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT TO anon, authenticated
  USING (bucket_id = 'post-images');

CREATE POLICY "post_images_admin_insert" ON storage.objects
  FOR INSERT TO authenticated
  WITH CHECK (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "post_images_admin_update" ON storage.objects
  FOR UPDATE TO authenticated
  USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "post_images_admin_delete" ON storage.objects
  FOR DELETE TO authenticated
  USING (bucket_id = 'post-images' AND public.has_role(auth.uid(), 'admin'::app_role));

-- 3) Lock down SECURITY DEFINER functions from anon/public callers
REVOKE EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.has_role(uuid, public.app_role) TO authenticated, service_role;

REVOKE EXECUTE ON FUNCTION public.is_coach_of_group(uuid, uuid) FROM PUBLIC, anon;
GRANT EXECUTE ON FUNCTION public.is_coach_of_group(uuid, uuid) TO authenticated, service_role;
