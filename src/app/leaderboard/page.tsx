import { createClient } from "@/lib/supabase/server";
import { LeaderboardTable } from "@/components/LeaderboardTable";
import type { PlayerStats } from "@/types/database";

export const dynamic = "force-dynamic";

export default async function LeaderboardPage() {
  const supabase = createClient();

  const {
    data: { user },
  } = await supabase.auth.getUser();

  const { data: leaderboard } = await supabase.rpc("get_leaderboard", {
    p_limit: 50,
  });

  return (
    <div>
      <h1 className="font-display text-3xl font-bold">Leaderboard</h1>
      <p className="mt-1 text-ink-dim">
        Ranked by wins across approved matches. Tap a player to see their
        win rate, tokens won, and full match history.
      </p>

      <div className="mt-6">
        <LeaderboardTable
          players={(leaderboard as PlayerStats[]) ?? []}
          currentUserId={user?.id}
        />
      </div>
    </div>
  );
}
