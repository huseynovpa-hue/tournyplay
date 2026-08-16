-- =====================================================================
-- TournyPlay database schema
-- Run this entire file once in Supabase Dashboard -> SQL Editor -> New query
-- =====================================================================

create extension if not exists "pgcrypto";

-- ---------------------------------------------------------------------
-- Tables
-- ---------------------------------------------------------------------

create table public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  profile_name text not null,
  efootball_username text not null,
  token_balance integer not null default 0,
  created_at timestamptz not null default now()
);

create table public.rooms (
  id uuid primary key default gen_random_uuid(),
  creator_id uuid not null references public.profiles(id),
  opponent_id uuid references public.profiles(id),
  stake integer not null check (stake > 0),
  status text not null default 'open'
    check (status in ('open','full','reported','completed','disputed','expired','cancelled')),
  created_at timestamptz not null default now(),
  full_at timestamptz,
  expires_at timestamptz
);

create table public.room_messages (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null references public.rooms(id) on delete cascade,
  sender_id uuid not null references public.profiles(id),
  message text not null check (char_length(message) between 1 and 500),
  created_at timestamptz not null default now()
);

create table public.room_results (
  id uuid primary key default gen_random_uuid(),
  room_id uuid not null unique references public.rooms(id) on delete cascade,
  reporter_id uuid not null references public.profiles(id),
  winner_id uuid not null references public.profiles(id),
  score_winner integer not null,
  score_loser integer not null,
  screenshot_url text not null,
  status text not null default 'pending' check (status in ('pending','approved','disputed')),
  created_at timestamptz not null default now(),
  approved_at timestamptz
);

create table public.token_transactions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id),
  amount integer not null,
  type text not null check (type in ('purchase','room_stake','room_win','refund','admin_adjust')),
  room_id uuid references public.rooms(id),
  created_at timestamptz not null default now()
);

create index on public.rooms (status);
create index on public.room_messages (room_id, created_at);
create index on public.token_transactions (user_id, created_at);

-- ---------------------------------------------------------------------
-- New-user trigger: auto-create a profile row from signup metadata
-- ---------------------------------------------------------------------

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, profile_name, efootball_username, token_balance)
  values (
    new.id,
    coalesce(new.raw_user_meta_data->>'profile_name', 'Player'),
    coalesce(new.raw_user_meta_data->>'efootball_username', ''),
    0
  );
  return new;
end;
$$;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- ---------------------------------------------------------------------
-- Row Level Security
-- ---------------------------------------------------------------------

alter table public.profiles enable row level security;
alter table public.rooms enable row level security;
alter table public.room_messages enable row level security;
alter table public.room_results enable row level security;
alter table public.token_transactions enable row level security;

-- profiles: anyone signed in can read (needed to show usernames in rooms);
-- users can only edit their own display fields, never token_balance directly.
create policy "profiles are readable by authenticated users"
  on public.profiles for select
  to authenticated
  using (true);

create policy "users can update their own profile"
  on public.profiles for update
  to authenticated
  using (auth.uid() = id)
  with check (auth.uid() = id);

revoke update on public.profiles from authenticated;
grant update (profile_name, efootball_username) on public.profiles to authenticated;

-- rooms: readable by everyone signed in (open room browsing).
-- No direct insert/update grants -- all writes go through the RPC
-- functions below so token balances stay consistent.
create policy "rooms are readable by authenticated users"
  on public.rooms for select
  to authenticated
  using (true);

-- room_messages: only participants of that room can read/write, and only
-- once the room has an opponent (status != 'open').
create policy "participants can read room messages"
  on public.room_messages for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_messages.room_id
        and (r.creator_id = auth.uid() or r.opponent_id = auth.uid())
    )
  );

create policy "participants can send room messages"
  on public.room_messages for insert
  to authenticated
  with check (
    sender_id = auth.uid()
    and exists (
      select 1 from public.rooms r
      where r.id = room_id
        and (r.creator_id = auth.uid() or r.opponent_id = auth.uid())
        and r.status <> 'open'
    )
  );

-- room_results: only participants can read; all writes go through RPCs.
create policy "participants can read room results"
  on public.room_results for select
  to authenticated
  using (
    exists (
      select 1 from public.rooms r
      where r.id = room_results.room_id
        and (r.creator_id = auth.uid() or r.opponent_id = auth.uid())
    )
  );

-- token_transactions: users can read only their own ledger; writes only via RPCs.
create policy "users can read their own transactions"
  on public.token_transactions for select
  to authenticated
  using (user_id = auth.uid());

-- ---------------------------------------------------------------------
-- RPC functions (SECURITY DEFINER -- run as the table owner so they can
-- update balances atomically, bypassing the restrictive policies above
-- which intentionally block direct client writes)
-- ---------------------------------------------------------------------

create or replace function public.create_room(p_stake integer)
returns uuid
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_balance integer;
  v_room_id uuid;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;
  if p_stake is null or p_stake <= 0 then
    raise exception 'Stake must be greater than zero';
  end if;

  select token_balance into v_balance from public.profiles where id = v_uid for update;
  if v_balance < p_stake then
    raise exception 'Insufficient token balance';
  end if;

  insert into public.rooms (creator_id, stake, status)
  values (v_uid, p_stake, 'open')
  returning id into v_room_id;

  update public.profiles set token_balance = token_balance - p_stake where id = v_uid;

  insert into public.token_transactions (user_id, amount, type, room_id)
  values (v_uid, -p_stake, 'room_stake', v_room_id);

  return v_room_id;
end;
$$;

create or replace function public.join_room(p_room_id uuid)
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_uid uuid := auth.uid();
  v_room public.rooms;
  v_balance integer;
begin
  if v_uid is null then
    raise exception 'Not authenticated';
  end if;

  select * into v_room from public.rooms where id = p_room_id for update;
  if not found then
    raise exception 'Room not found';
  end if;
  if v_room.status <> 'open' then
    raise exception 'This room is no longer open';
  end if;
  if v_room.creator_id = v_uid then
    raise exception 'You cannot join your own room';
  end if;

  select token_balance into v_balance from public.profiles where id = v_uid for update;
  if v_balance < v_room.stake then
    raise exception 'Insufficient token balance';
  end if;

  update public.profiles set token_balance = token_balance - v_room.stake where id = v_uid;

  update public.rooms
    set opponent_id = v_uid,
        status = 'full',
        full_at = now(),
        expires_at = now() + interval '1 hour'
    where id = p_room_id;

  insert into public.token_transactions (user_id, amount, type, room_id)
  values (v_uid, -v_room.stake, 'room_stake', p_room_id);
end;
$$;

create or replace function public.cancel_room(p_room_id uuid)
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
    raise exception 'Only the host can cancel this room';
  end if;
  if v_room.status <> 'open' then
    raise exception 'This room already has an opponent';
  end if;

  update public.rooms set status = 'cancelled' where id = p_room_id;
  update public.profiles set token_balance = token_balance + v_room.stake where id = v_uid;

  insert into public.token_transactions (user_id, amount, type, room_id)
  values (v_uid, v_room.stake, 'refund', p_room_id);
end;
$$;

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

create or replace function public.approve_result(p_room_id uuid)
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
    raise exception 'The player who reported the result cannot approve it';
  end if;

  update public.room_results set status = 'approved', approved_at = now() where room_id = p_room_id;
  update public.rooms set status = 'completed' where id = p_room_id;
  update public.profiles set token_balance = token_balance + (v_room.stake * 2) where id = v_result.winner_id;

  insert into public.token_transactions (user_id, amount, type, room_id)
  values (v_result.winner_id, v_room.stake * 2, 'room_win', p_room_id);
end;
$$;

-- Refunds any room that has been full for over an hour with no approved
-- result. Meant to be run on a schedule (see pg_cron section below).
create or replace function public.expire_stale_rooms()
returns void
language plpgsql
security definer set search_path = public
as $$
declare
  v_room record;
begin
  for v_room in
    select * from public.rooms
    where status in ('full','reported')
      and expires_at is not null
      and expires_at < now()
  loop
    update public.rooms set status = 'expired' where id = v_room.id;

    update public.profiles set token_balance = token_balance + v_room.stake where id = v_room.creator_id;
    insert into public.token_transactions (user_id, amount, type, room_id)
    values (v_room.creator_id, v_room.stake, 'refund', v_room.id);

    if v_room.opponent_id is not null then
      update public.profiles set token_balance = token_balance + v_room.stake where id = v_room.opponent_id;
      insert into public.token_transactions (user_id, amount, type, room_id)
      values (v_room.opponent_id, v_room.stake, 'refund', v_room.id);
    end if;

    if v_room.status = 'reported' then
      update public.room_results set status = 'disputed' where room_id = v_room.id;
    end if;
  end loop;
end;
$$;

grant execute on function
  public.create_room(integer),
  public.join_room(uuid),
  public.cancel_room(uuid),
  public.submit_result(uuid, uuid, integer, integer, text),
  public.approve_result(uuid)
to authenticated;

-- =====================================================================
-- OPTIONAL: automatic refunds on a schedule
-- Supabase projects support the pg_cron extension. Enable it once from
-- Dashboard -> Database -> Extensions -> pg_cron, then run:
--
--   select cron.schedule(
--     'expire-stale-rooms',
--     '*/5 * * * *',
--     $$ select public.expire_stale_rooms(); $$
--   );
--
-- Until pg_cron is enabled, refunds simply won't run automatically --
-- see README.md for a manual alternative.
-- =====================================================================
