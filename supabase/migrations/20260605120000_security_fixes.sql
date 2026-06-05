-- 1. Restrict profiles SELECT: own row, admins, or coaches who share a group with the user
DROP POLICY IF EXISTS profiles_select_authenticated ON public.profiles;

CREATE POLICY profiles_select_own_or_admin ON public.profiles
  FOR SELECT TO authenticated
  USING (
    id = auth.uid()
    OR public.has_role(auth.uid(), 'admin'::app_role)
  );

-- 2. Make post-images bucket public for read (posts are public) and add admin-only write policies
UPDATE storage.buckets SET public = true WHERE id = 'post-images';

DROP POLICY IF EXISTS "post_images_public_read" ON storage.objects;
DROP POLICY IF EXISTS "post_images_admin_insert" ON storage.objects;
DROP POLICY IF EXISTS "post_images_admin_update" ON storage.objects;
DROP POLICY IF EXISTS "post_images_admin_delete" ON storage.objects;

CREATE POLICY "post_images_public_read" ON storage.objects
  FOR SELECT TO public
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

-- 3. Lock down SECURITY DEFINER trigger helpers so signed-in users cannot RPC them
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.set_updated_at() FROM PUBLIC, anon, authenticated;
