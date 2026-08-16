-- =====================================================================
-- Storage setup for match result screenshots
-- Run AFTER schema.sql, in Supabase Dashboard -> SQL Editor
-- =====================================================================

insert into storage.buckets (id, name, public)
values ('result-screenshots', 'result-screenshots', true)
on conflict (id) do nothing;

-- Anyone can view screenshots (bucket is public, links are unguessable UUIDs).
create policy "public can view result screenshots"
  on storage.objects for select
  using (bucket_id = 'result-screenshots');

-- Only a participant of the room (folder name = room id) can upload into it.
create policy "participants can upload their room's screenshot"
  on storage.objects for insert
  to authenticated
  with check (
    bucket_id = 'result-screenshots'
    and exists (
      select 1 from public.rooms r
      where r.id::text = (storage.foldername(name))[1]
        and (r.creator_id = auth.uid() or r.opponent_id = auth.uid())
    )
  );
