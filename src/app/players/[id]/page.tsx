import Link from "next/link";
import { notFound } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { PlayerStatsCards } from "@/components/PlayerStatsCards";
import { MatchHistoryList } from "@/components/MatchHistoryList";
import type { PlayerStats, PlayerMatchHistoryItem } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function PlayerPage({
  params,
}: {
  params: { id: string };
}) {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) notFound();

  const { data: statsRows } = await supabase.rpc("get_player_stats", {
    p_user_id: params.id,
  });
  const stats = (statsRows as PlayerStats[] | null)?.[0];
  if (!stats) notFound();

  const { data: history } = await supabase.rpc("get_player_match_history", {
    p_user_id: params.id,
    p_limit: 50,
  });

  const isYou = user.id === params.id;

  return (
    <div className="mx-auto max-w-2xl">
      <Link
        href="/leaderboard"
        className="text-sm font-medium text-ink-dim hover:text-pitch"
      >
        ← Leaderboard
      </Link>

      <h1 className="mt-2 font-display text-3xl font-bold">
        {stats.profile_name}
        {isYou && (
          <span className="ml-2 text-lg font-medium text-pitch">(You)</span>
        )}
      </h1>
      <p className="mt-1 text-ink-dim">
        eFootball: {stats.efootball_username}
      </p>

      <div className="mt-6">
        <PlayerStatsCards stats={stats} />
      </div>

      <div className="mt-8">
        <h2 className="font-display text-xl font-bold text-ink">
          Match history
        </h2>
        <div className="mt-4">
          <MatchHistoryList matches={(history as PlayerMatchHistoryItem[]) ?? []} />
        </div>
      </div>
    </div>
  );
}
