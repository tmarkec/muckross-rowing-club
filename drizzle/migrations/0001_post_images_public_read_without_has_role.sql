-- Anonymous visitors could not read article pictures: the shared public policy
-- called has_role(), which the anon role has no EXECUTE on, so every anon read
-- failed with 42501 "permission denied for function has_role".
-- Split it so the anon path never touches the role helper.

DROP POLICY IF EXISTS "post_images_select_public" ON public.post_images;

CREATE POLICY "post_images_select_published"
ON public.post_images
FOR SELECT
TO anon
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_images.post_id
      AND p.published
  )
);

CREATE POLICY "post_images_select_published_or_admin"
ON public.post_images
FOR SELECT
TO authenticated
USING (
  EXISTS (
    SELECT 1
    FROM public.posts p
    WHERE p.id = post_images.post_id
      AND (p.published OR public.has_role(auth.uid(), 'admin'::app_role))
  )
);