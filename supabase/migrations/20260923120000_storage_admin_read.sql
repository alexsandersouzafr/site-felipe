-- Deleting a stored file goes through a lookup first: without read access the
-- Storage API finds nothing to delete, answers successfully and leaves the
-- file in place. That is why replacing or deleting an image kept filling the
-- bucket while the admin saw no error at all.
create policy "administrators read media" on storage.objects
  for select to authenticated
  using (bucket_id = 'media' and public.is_admin());
