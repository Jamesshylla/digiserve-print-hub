CREATE POLICY "anyone can upload design files"
  ON storage.objects FOR INSERT TO anon, authenticated
  WITH CHECK (bucket_id = 'design-uploads');

CREATE POLICY "admins read design files"
  ON storage.objects FOR SELECT TO authenticated
  USING (bucket_id = 'design-uploads' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins update design files"
  ON storage.objects FOR UPDATE TO authenticated
  USING (bucket_id = 'design-uploads' AND public.has_role(auth.uid(), 'admin'::app_role))
  WITH CHECK (bucket_id = 'design-uploads' AND public.has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "admins delete design files"
  ON storage.objects FOR DELETE TO authenticated
  USING (bucket_id = 'design-uploads' AND public.has_role(auth.uid(), 'admin'::app_role));