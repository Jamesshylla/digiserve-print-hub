CREATE POLICY "admins manage service images" ON storage.objects FOR ALL TO authenticated
USING (bucket_id = 'service-images' AND public.has_role(auth.uid(),'admin'))
WITH CHECK (bucket_id = 'service-images' AND public.has_role(auth.uid(),'admin'));