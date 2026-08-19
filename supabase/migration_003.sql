-- =====================================================================
-- TournyPlay migration 003
-- Run in Supabase Dashboard -> SQL Editor -> New query, AFTER schema.sql,
-- storage.sql and migration_002.sql have already been run once.
--
-- Adds:
--   1. push_subscriptions table (Web Push subscriptions per user/device)
--   2. Leaderboard + per-player stats + match history RPC functions
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Push subscriptions
--    One row per browser/device a user has enabled notifications on.
--    Sending pushes happens from the Next.js server using the Supabase
--    service-role key, so no special RLS is needed beyond "you manage
--    your own rows" -- the service role bypasses RLS entirely.
-- ---------------------------------------------------------------------
create table if not exists public.push_subscriptions (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references public.profiles(id) on delete cascade,
  endpoint text not null unique,
  p256dh text not null,
  auth text not null,
  created_at timestamptz not null default now()
);

create index if not exists push_subscriptions_user_id_idx
  on public.push_subscriptions (user_id);

alter table public.push_subscriptions enable row level security;

drop policy if exists "users manage their own push subscriptions" on public.push_subscriptions;
create policy "users manage their own push subscriptions"
  on public.push_subscriptions for all
  to authenticated
  using (user_id = auth.uid())
  with check (user_id = auth.uid());

grant select, insert, update, delete on public.push_subscriptions to authenticated;

-- ---------------------------------------------------------------------
-- 2. Leaderboard + stats
--    These are SECURITY DEFINER because the existing room_results policy
--    only lets participants read a given result -- fine for a single
--    room, too restrictive for an aggregate public leaderboard. These
--    functions only ever return aggregated numbers and public profile
--    fields (already readable by everyone per the profiles policy), never
--    raw result rows, so it's safe to open them up to all signed-in users.
-- ---------------------------------------------------------------------

create or replace function public.get_leaderboard(p_limit integer default 50)
returns table (
  user_id uuid,
  profile_name text,
  efootball_username text,
  matches_played bigint,
  wins bigint,
  losses bigint,
  win_rate numeric,
  tokens_won bigint
)
language sql
stable
security definer set search_path = public
as $$
  with participant_matches as (
    select r.creator_id as user_id, r.stake, rr.winner_id
    from public.rooms r
    join public.room_results rr on rr.room_id = r.id and rr.status = 'approved'
    union all
    select r.opponent_id as user_id, r.stake, rr.winner_id
    from public.rooms r
    join public.room_results rr on rr.room_id = r.id and rr.status = 'approved'
    where r.opponent_id is not null
  )
  select
    p.id as user_id,
    p.profile_name,
    p.efootball_username,
    count(pm.user_id) as matches_played,
    count(pm.user_id) filter (where pm.winner_id = p.id) as wins,
    count(pm.user_id) filter (where pm.winner_id <> p.id) as losses,
    round(
      100.0 * count(pm.user_id) filter (where pm.winner_id = p.id)
        / nullif(count(pm.user_id), 0),
      1
    ) as win_rate,
    coalesce(sum(pm.stake * 2) filter (where pm.winner_id = p.id), 0) as tokens_won
  from public.profiles p
  join participant_matches pm on pm.user_id = p.id
  group by p.id, p.profile_name, p.efootball_username
  having count(pm.user_id) > 0
  order by wins desc, win_rate desc nulls last, tokens_won desc
  limit p_limit;
$$;

create or replace function public.get_player_stats(p_user_id uuid)
returns table (
  user_id uuid,
  profile_name text,
  efootball_username text,
  matches_played bigint,
  wins bigint,
  losses bigint,
  win_rate numeric,
  tokens_won bigint,
  tokens_staked bigint
)
language sql
stable
security definer set search_path = public
as $$
  with participant_matches as (
    select r.creator_id as user_id, r.stake, rr.winner_id
    from public.rooms r
    join public.room_results rr on rr.room_id = r.id and rr.status = 'approved'
    where r.creator_id = p_user_id
    union all
    select r.opponent_id as user_id, r.stake, rr.winner_id
    from public.rooms r
    join public.room_results rr on rr.room_id = r.id and rr.status = 'approved'
    where r.opponent_id = p_user_id
  )
  select
    p.id,
    p.profile_name,
    p.efootball_username,
    count(pm.user_id),
    count(pm.user_id) filter (where pm.winner_id = p.id),
    count(pm.user_id) filter (where pm.winner_id <> p.id),
    round(
      100.0 * count(pm.user_id) filter (where pm.winner_id = p.id)
        / nullif(count(pm.user_id), 0),
      1
    ),
    coalesce(sum(pm.stake * 2) filter (where pm.winner_id = p.id), 0),
    coalesce(sum(pm.stake), 0)
  from public.profiles p
  left join participant_matches pm on pm.user_id = p.id
  where p.id = p_user_id
  group by p.id, p.profile_name, p.efootball_username;
$$;

create or replace function public.get_player_match_history(
  p_user_id uuid,
  p_limit integer default 50
)
returns table (
  room_id uuid,
  stake integer,
  finished_at timestamptz,
  opponent_id uuid,
  opponent_name text,
  score_for integer,
  score_against integer,
  won boolean
)
language sql
stable
security definer set search_path = public
as $$
  select
    r.id as room_id,
    r.stake,
    r.finished_at,
    case when r.creator_id = p_user_id then r.opponent_id else r.creator_id end,
    case when r.creator_id = p_user_id then op.profile_name else cr.profile_name end,
    case when rr.winner_id = p_user_id then rr.score_winner else rr.score_loser end,
    case when rr.winner_id = p_user_id then rr.score_loser else rr.score_winner end,
    rr.winner_id = p_user_id
  from public.rooms r
  join public.room_results rr on rr.room_id = r.id and rr.status = 'approved'
  join public.profiles cr on cr.id = r.creator_id
  left join public.profiles op on op.id = r.opponent_id
  where r.creator_id = p_user_id or r.opponent_id = p_user_id
  order by r.finished_at desc nulls last
  limit p_limit;
$$;

grant execute on function
  public.get_leaderboard(integer),
  public.get_player_stats(uuid),
  public.get_player_match_history(uuid, integer)
to authenticated;
