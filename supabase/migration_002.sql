-- =====================================================================
-- TournyPlay migration 002
-- Run in Supabase Dashboard -> SQL Editor -> New query, AFTER schema.sql
-- and storage.sql have already been run once.
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Turn on Realtime for the tables the app listens to.
--    Without this, chat messages and "opponent joined" only show up
--    after a manual page refresh.
-- ---------------------------------------------------------------------
do $$
begin
  alter publication supabase_realtime add table public.rooms;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.room_messages;
exception when duplicate_object then null;
end $$;

do $$
begin
  alter publication supabase_realtime add table public.room_results;
exception when duplicate_object then null;
end $$;

-- ---------------------------------------------------------------------
-- 2. New room lifecycle columns: room code (host-entered, not chat),
--    start time, finish time.
-- ---------------------------------------------------------------------
alter table public.rooms add column if not exists room_code text;
alter table public.rooms add column if not exists started_at timestamptz;
alter table public.rooms add column if not exists finished_at timestamptz;

-- ---------------------------------------------------------------------
-- 3. Host sets the real in-game Friendly Match Room ID.
-- ---------------------------------------------------------------------
create or replace function public.set_room_code(p_room_id uuid, p_code text)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_room.creator_id <> v_uid then
    raise exception 'Only the host can set the room ID';
  end if;
  if v_room.status <> 'full' then
    raise exception 'Room is not ready yet';
  end if;
  if p_code is null or length(trim(p_code)) = 0 then
    raise exception 'Room ID cannot be empty';
  end if;

  update public.rooms set room_code = trim(p_code) where id = p_room_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 4. Start / finish the match. Reporting a result now requires the
--    match to have been marked finished first.
-- ---------------------------------------------------------------------
create or replace function public.start_match(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_uid <> v_room.creator_id and v_uid <> v_room.opponent_id then
    raise exception 'You are not a participant in this room';
  end if;
  if v_room.status <> 'full' then
    raise exception 'Room is not ready yet';
  end if;
  if v_room.room_code is null then
    raise exception 'The host needs to share the Room ID first';
  end if;
  if v_room.started_at is not null then
    return; -- already started, no-op
  end if;

  update public.rooms set started_at = now() where id = p_room_id;
end;
$$;

create or replace function public.finish_match(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_uid <> v_room.creator_id and v_uid <> v_room.opponent_id then
    raise exception 'You are not a participant in this room';
  end if;
  if v_room.status <> 'full' then
    raise exception 'Room is not ready yet';
  end if;
  if v_room.started_at is null then
    raise exception 'Match has not been started yet';
  end if;
  if v_room.finished_at is not null then
    return; -- already finished, no-op
  end if;

  update public.rooms set finished_at = now() where id = p_room_id;
end;
$$;

-- Replace submit_result so it now also requires finished_at to be set.
create or replace function public.submit_result(
  p_room_id uuid,
  p_winner_id uuid,
  p_score_winner integer,
  p_score_loser integer,
  p_screenshot_url text
)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_room.status <> 'full' then
    raise exception 'This room is not awaiting a result';
  end if;
  if v_room.finished_at is null then
    raise exception 'Click "Finish match" before reporting a result';
  end if;
  if v_uid <> v_room.creator_id and v_uid <> v_room.opponent_id then
    raise exception 'You are not a participant in this room';
  end if;
  if p_winner_id <> v_room.creator_id and p_winner_id <> v_room.opponent_id then
    raise exception 'Winner must be one of the two participants';
  end if;
  if p_score_winner <= p_score_loser then
    raise exception 'The winner''s score must be higher than the loser''s';
  end if;

  insert into public.room_results
    (room_id, reporter_id, winner_id, score_winner, score_loser, screenshot_url, status)
  values
    (p_room_id, v_uid, p_winner_id, p_score_winner, p_score_loser, p_screenshot_url, 'pending');

  update public.rooms set status = 'reported' where id = p_room_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 5. Reject a reported result -> goes to "disputed" for manual review,
--    instead of only being approvable.
-- ---------------------------------------------------------------------
create or replace function public.reject_result(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_result public.room_results;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_uid <> v_room.creator_id and v_uid <> v_room.opponent_id then
    raise exception 'You are not a participant in this room';
  end if;

  select * into v_result from public.room_results where room_id = p_room_id for update;
  if not found then
    raise exception 'No result has been submitted yet';
  end if;
  if v_result.status <> 'pending' then
    raise exception 'This result has already been resolved';
  end if;
  if v_result.reporter_id = v_uid then
    raise exception 'The player who reported the result cannot reject it';
  end if;

  update public.room_results set status = 'disputed' where room_id = p_room_id;
  update public.rooms set status = 'disputed' where id = p_room_id;
end;
$$;

-- ---------------------------------------------------------------------
-- 6. Admin-only: resolve a disputed room by picking the real winner.
--    NOT granted to "authenticated" on purpose -- only you (the project
--    owner) can run this, from the Supabase SQL Editor, until an admin
--    screen exists. Usage:
--
--    select public.admin_resolve_dispute(
--      'room-id-here'::uuid,
--      'winner-user-id-here'::uuid
--    );
-- ---------------------------------------------------------------------
create or replace function public.admin_resolve_dispute(p_room_id uuid, p_winner_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_room public.rooms;
  v_result public.room_results;
begin
  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_room.status <> 'disputed' then
    raise exception 'Room is not in a disputed state';
  end if;
  if p_winner_id <> v_room.creator_id and p_winner_id <> v_room.opponent_id then
    raise exception 'Winner must be one of the two participants';
  end if;

  select * into v_result from public.room_results where room_id = p_room_id for update;

  update public.room_results
    set status = 'approved', approved_at = now(), winner_id = p_winner_id
    where room_id = p_room_id;

  update public.rooms set status = 'completed' where id = p_room_id;
  update public.profiles set token_balance = token_balance + (v_room.stake * 2) where id = p_winner_id;

  insert into public.token_transactions (user_id, amount, type, room_id)
  values (p_winner_id, v_room.stake * 2, 'admin_adjust', p_room_id);
end;
$$;

grant execute on function
  public.set_room_code(uuid, text),
  public.start_match(uuid),
  public.finish_match(uuid),
  public.submit_result(uuid, uuid, integer, integer, text),
  public.reject_result(uuid)
to authenticated;

-- admin_resolve_dispute intentionally NOT granted to authenticated.
